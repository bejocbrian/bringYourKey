from supabase import create_client, Client
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class SupabaseService:
    def __init__(self):
        url: str = os.getenv("VITE_SUPABASE_URL")
        key: str = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY") # Use service role for backend updates
        if not url or not key:
             # Fallback for development if env vars not set (though they should be)
             # In production, this should error out.
             # For now, we'll initialize with empty strings or handle it gracefully
             # But supabase-py will error if url/key are None.
             # Assuming .env is loaded correctly.
             self.client = None
             print("Warning: Supabase credentials not found in environment variables.")
        else:
            self.client: Client = create_client(url, key)

    def create_generation_record(self, user_id: str, prompt: str, status: str = "pending") -> Dict[str, Any]:
        if not self.client: return {}
        data = {
            "user_id": user_id, # Optional: if user system is fully integrated
            "prompt": prompt,
            "status": status,
            "progress": 0
        }
        # If user_id is None/empty, maybe don't include it if policies allow anon inserts?
        # For now, let's assume we might not integrate user_id fully in this step unless passed from frontend.
        # But the plan says "user_id". The frontend request currently doesn't send user_id.
        # I'll make user_id optional in this method.
        if not user_id:
            del data["user_id"]
            
        response = self.client.table("generations").insert(data).execute()
        if response.data:
            return response.data[0]
        return {}

    def update_generation_status(self, job_id: str, status: str, progress: int = 0, result_url: Optional[str] = None, error: Optional[str] = None):
        if not self.client: return
        data = {
            "status": status,
            "progress": progress
        }
        if result_url:
            data["result_url"] = result_url
        if error:
            data["error"] = error # Assuming schema has error column, if not, might need to add it or ignore

        self.client.table("generations").update(data).eq("id", job_id).execute()
