from pydantic import BaseModel
from typing import Optional, Literal

class T2VRequest(BaseModel):
    prompt: str
    aspectRatio: Literal["16:9", "9:16"] = "16:9"
    audioPrompt: Optional[str] = None
    referenceImages: Optional[list[str]] = None

class I2VRequest(BaseModel):
    motionIntensity: int
    aspectRatio: Literal["16:9", "9:16"] = "16:9"

class GenerationResponse(BaseModel):
    jobId: str
    status: str
    message: str

class StatusResponse(BaseModel):
    jobId: str
    status: Literal["pending", "dreaming", "rendering", "polishing", "complete", "failed"]
    progress: int
    resultUrl: Optional[str] = None
    error: Optional[str] = None

class ExportRequest(BaseModel):
    clipIds: list[str]
    format: Literal["mp4", "webm"] = "mp4"
    quality: Literal["high", "medium", "low"] = "high"

class ExportResponse(BaseModel):
    exportUrl: str
    message: str

class UploadResponse(BaseModel):
    url: str
    message: str
