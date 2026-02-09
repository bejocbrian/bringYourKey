from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from models.schemas import (
    T2VRequest,
    GenerationResponse,
    StatusResponse,
    ExportRequest,
    ExportResponse,
    UploadResponse
)
from services.veo_service import VeoService
from services.storage_service import StorageService
from services.ffmpeg_service import FFmpegService
from services.supabase_service import SupabaseService
import uuid
import asyncio

router = APIRouter()

# Initialize services
veo_service = VeoService()
storage_service = StorageService()
ffmpeg_service = FFmpegService()
supabase_service = SupabaseService()

# In-memory job storage (for fallback / quick lookup)
jobs = {}

async def process_t2v_generation(job_id: str, request: T2VRequest):
    """
    Background task for T2V generation (consuming SSE stream)
    """
    try:
        # Update status to dreaming
        supabase_service.update_generation_status(job_id, "dreaming", 10)
        jobs[job_id]["status"] = "dreaming"
        jobs[job_id]["progress"] = 10
        
        # Consume SSE Stream
        async for event in veo_service.generate_from_text(
            prompt=request.prompt,
            aspect_ratio=request.aspectRatio,
            audio_prompt=request.audioPrompt
        ):
            status = event.get("status", "rendering")
            file_url = event.get("file_url")
            
            if status == "completed":
                supabase_service.update_generation_status(job_id, "complete", 100, result_url=file_url)
                jobs[job_id].update({"status": "complete", "progress": 100, "resultUrl": file_url})
            else:
                # Map other statuses if any
                supabase_service.update_generation_status(job_id, status, 50)
                jobs[job_id].update({"status": status, "progress": 50})

    except Exception as e:
        print(f"Error in background task: {e}")
        supabase_service.update_generation_status(job_id, "failed", error=str(e))
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)

async def process_i2v_generation(job_id: str, image_url: str, motion_intensity: int, aspect_ratio: str):
    """
    Background task for I2V generation (consuming SSE stream)
    """
    try:
        # Update status to dreaming
        supabase_service.update_generation_status(job_id, "dreaming", 10)
        jobs[job_id]["status"] = "dreaming"
        jobs[job_id]["progress"] = 10
        
        async for event in veo_service.generate_from_image(
            image_url=image_url,
            motion_intensity=motion_intensity,
            aspect_ratio=aspect_ratio
        ):
            status = event.get("status", "rendering")
            file_url = event.get("file_url")
            
            if status == "completed":
                supabase_service.update_generation_status(job_id, "complete", 100, result_url=file_url)
                jobs[job_id].update({"status": "complete", "progress": 100, "resultUrl": file_url})
            else:
                supabase_service.update_generation_status(job_id, status, 50)
                jobs[job_id].update({"status": status, "progress": 50})

    except Exception as e:
        print(f"Error in background task: {e}")
        supabase_service.update_generation_status(job_id, "failed", error=str(e))
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)

@router.post("/generate/t2v", response_model=GenerationResponse)
async def generate_text_to_video(request: T2VRequest, background_tasks: BackgroundTasks):
    """
    Generate video from text prompt (Async)
    """
    try:
        # Create local records first
        job_id = str(uuid.uuid4())
        
        # Initialize in-memory job
        jobs[job_id] = {
            "status": "pending",
            "progress": 0,
            "type": "t2v",
            "request": request.model_dump()
        }
        
        # Create in Supabase 
        try:
             record = supabase_service.create_generation_record(
                 user_id=None,
                 prompt=request.prompt,
                 status="pending"
             )
             if record and "id" in record:
                 job_id = record["id"]
        except Exception as e:
            print(f"Supabase insert failed: {e}")
        
        # Update local jobs dict with the ID we are using
        jobs[job_id] = {
            "status": "pending",
            "progress": 0,
            "type": "t2v",
            "request": request.model_dump()
        }

        # Add background task
        background_tasks.add_task(process_t2v_generation, job_id, request)
        
        return GenerationResponse(
            jobId=job_id,
            status="pending",
            message="Video generation started"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/i2v", response_model=GenerationResponse)
async def generate_image_to_video(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(...),
    motionIntensity: int = Form(...),
    aspectRatio: str = Form("16:9")
):
    """
    Generate video from image (Async)
    """
    try:
        job_id = str(uuid.uuid4())
        
        # Upload image to Storage
        image_url = await storage_service.upload_file(image, f"uploads/{job_id}")
        
        # Create Supabase record
        try:
            record = supabase_service.create_generation_record(
                user_id=None,
                prompt=f"Image-to-Video (Motion: {motionIntensity})",
                status="pending"
            )
            if record and "id" in record:
                job_id = record["id"]
        except Exception as e:
            print(f"Supabase insert failed: {e}")

        jobs[job_id] = {
            "status": "pending",
            "progress": 0,
            "type": "i2v",
            "image_url": image_url,
            "motion_intensity": motionIntensity
        }
        
        background_tasks.add_task(
            process_i2v_generation, 
            job_id, 
            image_url, 
            motionIntensity, 
            aspectRatio
        )
        
        return GenerationResponse(
            jobId=job_id,
            status="pending",
            message="Video generation started"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/generation/{job_id}/status", response_model=StatusResponse)
async def get_generation_status(job_id: str):
    """
    Poll generation status
    """
    # Check local memory first
    if job_id in jobs:
        job = jobs[job_id]
        return StatusResponse(
            jobId=job_id,
            status=job.get("status", "pending"),
            progress=job.get("progress", 0),
            resultUrl=job.get("resultUrl"),
            error=job.get("error")
        )
    
    raise HTTPException(status_code=404, detail="Job not found")

@router.post("/export", response_model=ExportResponse)
async def export_video(request: ExportRequest):
    """
    Stitch multiple clips into final video
    """
    try:
        # Collect clip URLs
        clip_urls = []
        for clip_id in request.clipIds:
            # Check jobs/Supabase for URL
            if clip_id in jobs and jobs[clip_id].get("resultUrl"):
                 clip_urls.append(jobs[clip_id]["resultUrl"])
            # TODO: Add Supabase check
        
        if not clip_urls:
            raise HTTPException(status_code=400, detail="No valid clips found")
        
        export_path = await ffmpeg_service.stitch_videos(
            clip_urls,
            output_format=request.format,
            quality=request.quality
        )
        
        export_url = await storage_service.upload_local_file(export_path, "exports")
        
        return ExportResponse(
            exportUrl=export_url,
            message="Video export complete"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingredients/upload", response_model=UploadResponse)
async def upload_ingredient_image(image: UploadFile = File(...)):
    """
    Upload ingredient reference image
    """
    try:
        # Upload to Storage "ingredients" folder
        image_url = await storage_service.upload_file(image, "ingredients")
        
        return UploadResponse(
            url=image_url,
            message="Image uploaded successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
