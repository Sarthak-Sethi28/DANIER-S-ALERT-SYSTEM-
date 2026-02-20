import os
import shutil
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from models import UploadedFile

class FileStorageService:
    def __init__(self, upload_dir: Optional[str] = None):
        # Allow override via environment variable, fallback to 'uploads'
        self.upload_dir = upload_dir or os.getenv("UPLOAD_DIR", "uploads")
        self._ensure_upload_dir()
    
    def _ensure_upload_dir(self):
        """Ensure upload directory exists"""
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir)
    
    def save_uploaded_file(self, temp_file_path: str, original_filename: str, db: Session) -> Optional[str]:
        """
        Save uploaded file to permanent storage and update database
        
        Returns:
            Permanent file path if successful, None otherwise
        """
        try:
            # Generate unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_extension = os.path.splitext(original_filename)[1]
            unique_filename = f"inventory_{timestamp}{file_extension}"
            permanent_path = os.path.join(self.upload_dir, unique_filename)
            
            # Copy file to permanent location
            shutil.copy2(temp_file_path, permanent_path)
            
            # Get file size
            file_size = os.path.getsize(permanent_path)
            
            # Deactivate all previous files
            db.query(UploadedFile).update({"is_active": False})
            
            # Create new uploaded file record
            uploaded_file = UploadedFile(
                filename=original_filename,
                file_path=permanent_path,
                file_size=file_size,
                is_active=True
            )
            db.add(uploaded_file)
            db.flush()  # Get the ID
            
            return permanent_path
            
        except Exception as e:
            print(f"Error saving uploaded file: {str(e)}")
            return None
    
    def get_latest_active_file(self, db: Session) -> Optional[UploadedFile]:
        """Get the most recent active uploaded file"""
        return db.query(UploadedFile).filter(UploadedFile.is_active == True).first()
    
    def get_latest_file_path(self, db: Session) -> Optional[str]:
        """Get the file path of the latest active uploaded file"""
        latest_file = self.get_latest_active_file(db)
        return latest_file.file_path if latest_file else None
    
    def cleanup_old_files(self, db: Session, keep_days: int = 30):
        """Clean up old uploaded files"""
        try:
            cutoff_date = datetime.now() - timedelta(days=keep_days)
            old_files = db.query(UploadedFile).filter(
                UploadedFile.upload_date < cutoff_date,
                UploadedFile.is_active == False
            ).all()
            
            for old_file in old_files:
                # Delete physical file
                if os.path.exists(old_file.file_path):
                    os.remove(old_file.file_path)
                
                # Delete database record
                db.delete(old_file)
            
            db.commit()
            print(f"Cleaned up {len(old_files)} old files")
            
        except Exception as e:
            print(f"Error cleaning up old files: {str(e)}")
            db.rollback() 