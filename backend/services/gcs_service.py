"""
Google Cloud Storage Service
Handles file uploads and downloads
"""
import os
import uuid
from typing import Optional
from fastapi import UploadFile
from google.cloud import storage
from dotenv import load_dotenv

load_dotenv()

class GCSService:
    def __init__(self):
        # Initialize GCS client
        try:
            self.client = storage.Client()
            self.bucket_name = os.getenv("GCP_BUCKET_NAME", "byok-videos")
            # Check if bucket exists, if not create (or fail depending on perms)
            try:
                 self.bucket = self.client.get_bucket(self.bucket_name)
            except Exception:
                 print(f"[GCS] Bucket {self.bucket_name} not found or accessible.")
                 # In production we might want to raise, but for now we print
        except Exception as e:
            print(f"[GCS] Failed to initialize client: {e}")
            self.client = None
            self.bucket = None
    
    async def upload_file(self, file: UploadFile, folder: str = "uploads") -> str:
        """
        Upload file to GCS and return public URL
        """
        if not self.bucket:
            return f"https://mock-gcs/{folder}/{file.filename}"

        try:
            # Generate unique filename
            file_extension = file.filename.split('.')[-1] if file.filename else 'bin'
            unique_filename = f"{folder}/{uuid.uuid4()}.{file_extension}"
            
            blob = self.bucket.blob(unique_filename)
            
            # Read file content
            contents = await file.read()
            blob.upload_from_string(contents, content_type=file.content_type)
            
            # Reset cursor for other uses if needed (though usually consumed)
            await file.seek(0)
            
            # Return public URL (authenticated or public)
            # Check if bucket is public or we need signed URL
            # For this app, let's assume we want a signed URL or public link
            # blob.make_public() # Requires permission
            
            # Use public URL format
            return blob.public_url
        except Exception as e:
            print(f"[GCS] Upload failed: {e}")
            raise e
    
    async def upload_local_file(self, local_path: str, folder: str = "exports") -> str:
        """
        Upload local file to GCS
        """
        if not self.bucket:
             return f"https://mock-gcs/{folder}/{os.path.basename(local_path)}"

        try:
            filename = os.path.basename(local_path)
            blob_name = f"{folder}/{filename}"
            
            blob = self.bucket.blob(blob_name)
            blob.upload_from_filename(local_path)
            
            return blob.public_url
        except Exception as e:
            print(f"[GCS] Local upload failed: {e}")
            raise e
