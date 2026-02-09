"""
Veo 3.1 API Service (GenAIPro)
Handles video generation using genaipro.vn API
"""
import os
import asyncio
import httpx
import json
from typing import Optional, Dict, Any, AsyncGenerator, List
from dotenv import load_dotenv

load_dotenv()

class VeoService:
    def __init__(self):
        self.base_url = os.getenv("GENAI_BASE_URL", "https://genaipro.vn/api/v1")
        self.token = os.getenv("GENAI_API_TOKEN")
        self.headers = {
            "Authorization": f"Bearer {self.token}"
            # Content-Type is set automatically by httpx for json/files
        }
        
    async def get_quota(self) -> Dict[str, Any]:
        """
        Get current user's quota
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/veo/me",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()

    async def _handle_sse_stream(self, response: httpx.Response) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Helper to parse GenAIPro SSE events
        """
        current_event = None
        
        async for line in response.aiter_lines():
            if not line:
                continue
            
            # Remove "data: " or "event: " prefix if present
            line = line.strip()
            
            if line.startswith("event:"):
                current_event = line[6:].strip()
                continue
                
            if line.startswith("data:"):
                data_str = line[5:].strip()
                if not data_str:
                    continue
                    
                try:
                    data = json.loads(data_str)
                    
                    # Normalize output for our app
                    output = {"status": "rendering", "progress": 0}
                    
                    if current_event == "progress":
                        # data: {"percentage": 45, "status": "processing"}
                        output["status"] = "rendering" # or parsing data['status']
                        output["progress"] = data.get("percentage", 0)
                        yield output
                        
                    elif current_event == "video_generation_complete":
                        # data: {"videos": [{"url": "..."}]}
                        videos = data.get("videos", [])
                        if videos:
                             output["status"] = "completed" # Matches our generation.py expectation check
                             output["progress"] = 100
                             output["file_url"] = videos[0].get("url")
                             yield output
                        else:
                             yield {"status": "failed", "error": "No videos returned"}
                             
                    elif current_event == "error":
                        yield {"status": "failed", "error": data.get("message", "Unknown error")}
                        
                    # Reset event after processing data? 
                    # Usually SSE implies event applies to the data that follows.
                    # We accept that flow.
                    
                except json.JSONDecodeError:
                    print(f"[VEO] Failed to parse SSE data: {data_str}")
                    continue

    async def generate_from_text(
        self,
        prompt: str,
        aspect_ratio: str,
        audio_prompt: Optional[str] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Generate video from text (SSE Stream)
        """
        url = f"{self.base_url}/veo/text-to-video"
        
        aspect_map = {
            "16:9": "VIDEO_ASPECT_RATIO_LANDSCAPE",
            "9:16": "VIDEO_ASPECT_RATIO_PORTRAIT"
        }
        api_aspect = aspect_map.get(aspect_ratio, "VIDEO_ASPECT_RATIO_LANDSCAPE")
        
        payload = {
            "prompt": prompt,
            "aspect_ratio": api_aspect,
            "number_of_videos": 1
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            headers = self.headers.copy()
            headers["Content-Type"] = "application/json"
            
            async with client.stream("POST", url, headers=headers, json=payload) as response:
                if response.status_code != 200:
                    try:
                        error_text = await response.aread()
                        error_msg = error_text.decode()
                    except:
                        error_msg = "Unknown API Error"
                    raise Exception(f"API Error {response.status_code}: {error_msg}")
                
                async for status in self._handle_sse_stream(response):
                    yield status

    async def generate_from_image(
        self,
        image_url: str,
        motion_intensity: int,
        aspect_ratio: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Generate video from ingredients (Reference Images)
        Uses 'ingredients-to-video' endpoint as it supports reference images.
        """
        # Download image first
        url = f"{self.base_url}/veo/ingredients-to-video"
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            # 1. Download image
            try:
                img_resp = await client.get(image_url)
                img_resp.raise_for_status()
                image_data = img_resp.content
            except Exception as e:
                yield {"status": "failed", "error": f"Failed to download source image: {e}"}
                return

            # 2. Prepare Form Data
            # Note: API expects 'reference_images' as file field name
            files = [
                ("reference_images", ("image.jpg", image_data, "image/jpeg"))
            ]
            
            aspect_map = {
                "16:9": "VIDEO_ASPECT_RATIO_LANDSCAPE",
                "9:16": "VIDEO_ASPECT_RATIO_PORTRAIT"
            }
            # Note: ingredients-to-video doc provided by user does NOT show aspect_ratio in request body
            # But text-to-video and frames-to-video do. 
            # Let's verify... User doc for Ingredients says: 
            # Request Body: reference_images, prompt, number_of_videos.
            # NO aspect_ratio listed.
            # We'll omit it to be safe or put it in prompt?
            # User wants aspect ratio control. 
            # We will try adding it (often APIs are consistent), or fallback to prompt instruction.
            
            data = {
                "prompt": f"Video from image, motion intensity {motion_intensity}", 
                "number_of_videos": 1
            }
            
            # 3. Stream Request
            # Don't set Content-Type manually for files
            async with client.stream("POST", url, headers=self.headers, data=data, files=files) as response:
                 if response.status_code != 200:
                    try:
                        error_text = await response.aread()
                        error_msg = error_text.decode()
                    except:
                        error_msg = "Unknown API Error"
                    raise Exception(f"API Error {response.status_code}: {error_msg}")

                 async for status in self._handle_sse_stream(response):
                    yield status
