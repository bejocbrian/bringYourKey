"""
Supabase Storage Service
Handles file uploads and downloads using Supabase Storage
"""
import os
import uuid
from typing import Optional
from fastapi import UploadFile
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class StorageService:
    def __init__(self):
        url: str = os.getenv("VITE_SUPABASE_URL")
        key: str = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY")
        self.bucket_name = "videos" # Default bucket
        
        if not url or not key:
            print("Warning: Supabase credentials missing for StorageService")
            self.client = None
        else:
            self.client: Client = create_client(url, key)

    async def upload_file(self, file: UploadFile, folder: str = "uploads") -> str:
        """
        Upload file to Supabase Storage and return public URL
        """
        if not self.client:
            return f"https://mock-storage/{folder}/{file.filename}"

        try:
            # Generate unique filename
            file_extension = file.filename.split('.')[-1] if file.filename else 'bin'
            unique_filename = f"{folder}/{uuid.uuid4()}.{file_extension}"
            
            # Read file content
            contents = await file.read()
            
            # Upload to Supabase
            # API: supabase.storage.from_(bucket).upload(path, file, file_options)
            response = self.client.storage.from_(self.bucket_name).upload(
                path=unique_filename,
                file=contents,
                file_options={"content-type": file.content_type}
            )
            
            # Reset cursor
            await file.seek(0)
            
            # Get Public URL
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(unique_filename)
            return public_url
            
        except Exception as e:
            print(f"[Storage] Upload failed: {e}")
            raise e
    
    async def upload_local_file(self, local_path: str, folder: str = "exports") -> str:
        """
        Upload local file to Supabase Storage
        """
        if not self.client:
             return f"https://mock-storage/{folder}/{os.path.basename(local_path)}"

        try:
            filename = os.path.basename(local_path)
            storage_path = f"{folder}/{filename}"
            
            with open(local_path, "rb") as f:
                self.client.storage.from_(self.bucket_name).upload(
                    path=storage_path,
                    file=f
                )
            
            return self.client.storage.from_(self.bucket_name).get_public_url(storage_path)
        except Exception as e:
            print(f"[Storage] Local upload failed: {e}")
            raise e
