from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import tempfile
import os
from datetime import datetime
import pandas as pd

from database import get_db, engine, init_db
from models import Base, Recipient, UploadedFile
from key_items_service import KeyItemsService
from email_service import EmailService
from file_storage_service import FileStorageService
from comparison_service import ComparisonService
from recipients_storage import recipients_storage
from threshold_analysis_service import ThresholdAnalysisService

# Initialize database
init_db()

app = FastAPI(title="Danier Stock Alert System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
key_items_service = KeyItemsService()
email_service = EmailService()
file_storage_service = FileStorageService()
comparison_service = ComparisonService(key_items_service)
threshold_analysis_service = ThresholdAnalysisService()

# Default recipient email (can be configured via environment variable)
RECIPIENT_EMAIL = os.getenv("DEFAULT_RECIPIENT_EMAIL", "alerts@danier.ca")

@app.get("/")
async def root():
    return {"message": "Danier Key Items Stock Alert System API"}

@app.get("/recipients")
async def get_recipients():
    """Get all active recipients"""
    recipients = recipients_storage.get_all_recipients()
    stats = recipients_storage.get_stats()
    
    return {
        "recipients": recipients,
        "stats": stats
    }

@app.get("/test-recipients")
async def test_recipients():
    """Test recipients endpoint"""
    return {"message": "Recipients endpoint working"}

@app.get("/test-email")
async def test_email():
    """Test email endpoint"""
    return {"message": "Email endpoint working", "status": "ready"}

@app.post("/recipients")
async def add_recipient(
    email: str = Form(...),
    name: str = Form(None),
    department: str = Form(None)
):
    """Add a new email recipient"""
    result = recipients_storage.add_recipient(email, name, department)
    return result

@app.delete("/recipients/{email}")
async def delete_recipient(email: str):
    """Delete a recipient email"""
    result = recipients_storage.delete_recipient(email)
    return result

@app.put("/recipients/{email}")
async def update_recipient(
    email: str,
    name: str = Form(None),
    department: str = Form(None)
):
    """Update recipient information"""
    result = recipients_storage.update_recipient(email, name, department)
    return result

@app.post("/upload-report")
async def upload_report(file: UploadFile = File(...)):
    """Process uploaded inventory file and return key items alerts"""
    
    # Validate file type
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")
    
    try:
        # Read file content directly
        content = await file.read()
        
        # Create uploads directory if it doesn't exist
        uploads_dir = "uploads"
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"inventory_{timestamp}{file_extension}"
        permanent_path = os.path.join(uploads_dir, unique_filename)
        
        # Write content to permanent file
        with open(permanent_path, 'wb') as f:
            f.write(content)
        
        print(f"✅ File saved to: {permanent_path}")
        
        # Force fresh processing for new file upload
        print("🔄 FORCE FRESH PROCESSING for new file upload...")
        key_items_service.clear_all_caches()
        comparison_service.clear_all_caches()
        
        # Clear upload history cache when new file is uploaded
        if hasattr(key_items_service, '_cache') and 'upload_history_cache' in key_items_service._cache:
            del key_items_service._cache['upload_history_cache']
            print("🗑️ Cleared upload history cache")
        
        # Clear inventory files cache when new file is uploaded
        if hasattr(key_items_service, '_cache') and 'inventory_files_cache' in key_items_service._cache:
            del key_items_service._cache['inventory_files_cache']
            print("🗑️ Cleared inventory files cache")
        
        # Use force fresh processing to ensure new files are handled correctly
        key_items_low_stock, success, error_message = key_items_service.force_fresh_processing(permanent_path)
        
        if not success:
            raise HTTPException(status_code=400, detail=error_message)
        
        # Group results by item name for better presentation
        results_by_item = {}
        for item in key_items_low_stock:
            item_name = item['item_name']
            if item_name not in results_by_item:
                results_by_item[item_name] = []
            results_by_item[item_name].append(item)
        
        # Send email alert
        email_sent = False
        email_error = None
        try:
            email_subject = f"🚨 Danier Key Items Low Stock Alert - {len(key_items_low_stock)} items"
            email_body = f"""
            New inventory analysis completed with {len(key_items_low_stock)} low stock items requiring attention.
            
            📊 Summary:
            - Total low stock alerts: {len(key_items_low_stock)}
            - Items affected: {len(results_by_item)}
            - File processed: {file.filename}
            - Analysis date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
            
            Please check the dashboard for detailed information.
            """
            
            email_service.send_alert_email([RECIPIENT_EMAIL], key_items_low_stock)
            email_sent = True
            print(f"✅ Email sent successfully to {RECIPIENT_EMAIL}")
        except Exception as email_error_detail:
            email_error = str(email_error_detail)
            print(f"❌ Error sending email: {email_error}")
        
        # Database operations
        db = next(get_db())
        try:
            # Deactivate all previous files
            deactivated_count = db.query(UploadedFile).update({"is_active": False})
            print(f"📊 Deactivated {deactivated_count} previous files")
            
            # Create new uploaded file record
            uploaded_file = UploadedFile(
                filename=file.filename,
                file_path=permanent_path,
                file_size=len(content),
                is_active=True,
                total_items=len(key_items_low_stock),
                low_stock_count=len(key_items_low_stock)
            )
            print(f"📝 Created UploadedFile object: {uploaded_file.filename}")
            
            db.add(uploaded_file)
            print(f"➕ Added to database session")
            
            db.commit()  # Commit the transaction
            print(f"✅ Database committed successfully: File saved with {len(key_items_low_stock)} low stock items")
            
            # Verification
            verification = db.query(UploadedFile).filter(UploadedFile.is_active == True).first()
            if verification:
                print(f"✅ Verification successful: Found active file {verification.filename}")
            else:
                print(f"❌ Verification failed: No active file found after commit")
                
        except Exception as db_error:
            print(f"❌ Database error: {db_error}")
            print(f"❌ Error type: {type(db_error)}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")
            db.rollback()
        finally:
            db.close()
        
        print(f"🎉 UPLOAD COMPLETE: File {unique_filename} processed successfully")
        print(f"📊 Found {len(key_items_low_stock)} low stock items")
        print(f"📁 Cache cleared - ready for dashboard queries")
        
        return {
            "success": True,
            "message": f"Key items processed successfully. Found {len(key_items_low_stock)} size/color combinations below threshold.",
            "key_items_low_stock": key_items_low_stock,
            "results_by_item": results_by_item,
            "email_sent": email_sent,
            "email_error": email_error,
            "file_processed": file.filename,
            "file_saved": permanent_path,
            "cache_cleared": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/key-items/alerts")
async def get_key_items_alerts():
    """Get current key items alerts from the latest uploaded file"""
    try:
        print("🔍 DASHBOARD REQUEST: Getting key items alerts...")
        
        # Get the latest uploaded file path
        db = next(get_db())
        latest_file_path = file_storage_service.get_latest_file_path(db)
        
        print(f"📁 Latest file path: {latest_file_path}")
        
        # If no file in database, try to find the most recent file in uploads directory
        if not latest_file_path:
            uploads_dir = "uploads"
            if os.path.exists(uploads_dir):
                files = [f for f in os.listdir(uploads_dir) if f.endswith('.xlsx')]
                if files:
                    # Sort by modification time, get the most recent
                    files.sort(key=lambda x: os.path.getmtime(os.path.join(uploads_dir, x)), reverse=True)
                    latest_file_path = os.path.join(uploads_dir, files[0])
        
        if not latest_file_path or not os.path.exists(latest_file_path):
            return {
                "key_items_tracked": [],
                "threshold": key_items_service.default_size_threshold,
                "low_stock_items": [],
                "message": "No inventory file found. Please upload an inventory file first."
            }
        
        # Always use fresh processing for dashboard alerts to ensure accuracy
        print("🔄 DASHBOARD: Using fresh processing for latest file...")
        low_stock_items, success, error_message = key_items_service.force_fresh_processing(latest_file_path)
        
        if not success:
            raise HTTPException(status_code=400, detail=error_message)
        
        # Get file-specific key items and summary
        file_key_items = key_items_service.get_file_key_items(latest_file_path)
        summary = key_items_service.get_key_items_summary(latest_file_path)
        
        return {
            "key_items_tracked": file_key_items,
            "threshold": key_items_service.default_size_threshold,
            "low_stock_items": low_stock_items,
            "summary": summary,
            "source_file": os.path.basename(latest_file_path),
            "total_ki00_items_detected": len(file_key_items)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving alerts: {str(e)}")

@app.get("/inventory-files")
async def get_inventory_files():
    """Get all uploaded inventory files with their key items - OPTIMIZED"""
    try:
        uploads_dir = "uploads"
        if not os.path.exists(uploads_dir):
            return {"files": []}
        
        files = [f for f in os.listdir(uploads_dir) if f.endswith('.xlsx')]
        files.sort(key=lambda x: os.path.getmtime(os.path.join(uploads_dir, x)), reverse=True)
        
        # Use cached results if available
        cache_key = "inventory_files_cache"
        if hasattr(key_items_service, '_cache') and cache_key in key_items_service._cache:
            cached_files = key_items_service._cache[cache_key]
            if len(cached_files) == len(files):
                print("⚡ Using cached inventory files")
                return {
                    "files": cached_files,
                    "total_files": len(cached_files),
                    "all_key_items": key_items_service.get_all_key_items()
                }
        
        print(f"📁 Processing {len(files)} files for inventory list...")
        file_info = []
        
        # Process files in batches
        batch_size = 3
        for i in range(0, len(files), batch_size):
            batch_files = files[i:i + batch_size]
            print(f"📦 Processing batch {i//batch_size + 1}/{(len(files) + batch_size - 1)//batch_size}")
            
            for filename in batch_files:
                file_path = os.path.join(uploads_dir, filename)
                try:
                    file_key_items = key_items_service.get_file_key_items(file_path)
                    stat = os.stat(file_path)
                    file_info.append({
                        "filename": filename,
                        "upload_date": stat.st_mtime,
                        "file_size": stat.st_size,
                        "key_items_count": len(file_key_items),
                        "key_items": file_key_items,
                        "file_path": file_path
                    })
                except Exception as e:
                    print(f"Error processing file {filename}: {e}")
                    continue
        
        # Cache the results
        if not hasattr(key_items_service, '_cache'):
            key_items_service._cache = {}
        key_items_service._cache[cache_key] = file_info
        
        return {
            "files": file_info,
            "total_files": len(file_info),
            "all_key_items": key_items_service.get_all_key_items()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving inventory files: {str(e)}")

@app.get("/inventory-files/{filename}/alerts")
async def get_file_alerts(filename: str):
    """Get alerts for a specific inventory file"""
    try:
        file_path = os.path.join("uploads", filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        low_stock_items, success, error_message = key_items_service.process_key_items_inventory(file_path)
        
        if not success:
            raise HTTPException(status_code=400, detail=error_message)
        
        summary = key_items_service.get_key_items_summary(file_path)
        
        return {
            "filename": filename,
            "key_items_tracked": key_items_service.get_file_key_items(file_path),
            "threshold": key_items_service.default_size_threshold,
            "low_stock_items": low_stock_items,
            "summary": summary,
            "total_ki00_items_detected": len(key_items_service.get_file_key_items(file_path))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving file alerts: {str(e)}")

# Optimized key items endpoint with batch processing
@app.get("/key-items/list")
async def get_key_items_list():
    """Get all key items with optimized batch processing"""
    try:
        # Use comparison service caching for ultra-fast response
        cache_key = f"key_items_list_{datetime.now().strftime('%Y%m%d_%H')}"
        
        # Get the latest file with proper caching
        files = comparison_service.get_all_uploaded_files()
        if not files:
            return {"key_items": [], "message": "No files uploaded yet"}
        
        latest_file = files[0]  # Already sorted by date
        
        # Ultra-fast processing with batch operations
        success, key_items, error = key_items_service.get_key_items_batch(latest_file['file_path'])
        
        if not success:
            raise HTTPException(status_code=400, detail=error)
        
        return {
            "key_items": key_items,
            "file": latest_file['filename'],
            "count": len(key_items),
            "cached": True
        }
        
    except Exception as e:
        print(f"⚠️  Error in get_key_items_list: {str(e)}")
        return {"key_items": [], "error": str(e)}

@app.get("/key-items/{item_name}/alerts")
async def get_key_item_alerts(item_name: str):
    """Get alerts for specific key item with lightning-fast caching"""
    try:
        # Use service-level caching for instant response
        alerts = key_items_service.get_item_alerts_cached(item_name)
        
        return {
            "item_name": item_name,
            "alerts": alerts,
            "count": len(alerts),
            "cached": True
        }
        
    except Exception as e:
        print(f"⚠️  Error getting alerts for {item_name}: {str(e)}")
        return {"alerts": [], "error": str(e)}

@app.get("/test")
async def test_system():
    """Test endpoint to verify system is working with the latest uploaded file"""
    try:
        # Get the latest uploaded file path
        db = next(get_db())
        latest_file_path = file_storage_service.get_latest_file_path(db)
        
        if not latest_file_path:
            uploads_dir = "uploads"
            if os.path.exists(uploads_dir):
                files = [f for f in os.listdir(uploads_dir) if f.endswith('.xlsx')]
                if files:
                    files.sort(key=lambda x: os.path.getmtime(os.path.join(uploads_dir, x)), reverse=True)
                    latest_file_path = os.path.join(uploads_dir, files[0])
        
        if not latest_file_path or not os.path.exists(latest_file_path):
            return {
                "status": "no_file",
                "message": "No inventory file found. Please upload a file first.",
                "key_items_service_status": "ready",
                "dynamic_detection": "enabled"
            }
        
        # Test key items detection
        file_key_items = key_items_service.get_file_key_items(latest_file_path)
        
        # Test processing
        low_stock_items, success, error_message = key_items_service.process_key_items_inventory(latest_file_path)
        
        return {
            "status": "success" if success else "error",
            "message": error_message if error_message else "System working correctly",
            "latest_file": os.path.basename(latest_file_path) if latest_file_path else None,
            "detected_ki00_items": len(file_key_items),
            "sample_ki00_items": file_key_items[:5] if file_key_items else [],
            "low_stock_alerts": len(low_stock_items) if success else 0,
            "key_items_service_status": "operational",
            "dynamic_detection": "working",
            "all_key_items_across_files": len(key_items_service.get_all_key_items())
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"System test failed: {str(e)}",
            "key_items_service_status": "error"
        }

@app.get("/upload-history")
async def get_upload_history():
    """Get upload history with ACTUAL current data"""
    try:
        uploads_dir = "uploads"
        if not os.path.exists(uploads_dir):
            return {"uploads": []}
        
        files = [f for f in os.listdir(uploads_dir) if f.endswith('.xlsx')]
        files.sort(key=lambda x: os.path.getmtime(os.path.join(uploads_dir, x)), reverse=True)
        
        # Use cached results if available
        cache_key = "upload_history_cache"
        if hasattr(key_items_service, '_cache') and cache_key in key_items_service._cache:
            cached_history = key_items_service._cache[cache_key]
            if len(cached_history) == len(files):
                print("⚡ Using cached upload history with actual data")
                return {"uploads": cached_history, "total_uploads": len(cached_history)}
        
        print(f"📊 Processing {len(files)} files for accurate upload history...")
        history = []
        
        # Process each file to get ACTUAL current data
        for filename in files:
            file_path = os.path.join(uploads_dir, filename)
            try:
                stat = os.stat(file_path)
                
                # Get actual key items count
                file_key_items = key_items_service.get_file_key_items(file_path)
                key_items_count = len(file_key_items) if file_key_items else 0
                
                # Get actual low stock alerts
                low_stock_items, success, _ = key_items_service.process_key_items_inventory(file_path)
                low_stock_count = len(low_stock_items) if low_stock_items else 0
                
                history.append({
                    "filename": filename,
                    "upload_date": stat.st_mtime,
                    "file_size": stat.st_size,
                    "key_items_detected": key_items_count,
                    "low_stock_alerts": low_stock_count,
                    "processed_successfully": success
                })
            except Exception as e:
                print(f"Error processing file {filename}: {e}")
                history.append({
                    "filename": filename,
                    "upload_date": stat.st_mtime if 'stat' in locals() else 0,
                    "file_size": stat.st_size if 'stat' in locals() else 0,
                    "key_items_detected": "Error",
                    "low_stock_alerts": "Error",
                    "processed_successfully": False
                })
                continue
        
        # Cache the results
        if not hasattr(key_items_service, '_cache'):
            key_items_service._cache = {}
        key_items_service._cache[cache_key] = history
        
        print(f"✅ Upload history with actual data: {len(history)} files processed")
        return {"uploads": history, "total_uploads": len(history)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving upload history: {str(e)}")

@app.get("/files/smart-analysis/{file1}/{file2}")
async def get_smart_performance_analysis(file1: str, file2: str):
    """Get intelligent performance analysis between two inventory files"""
    try:
        file1_path = os.path.join("uploads", file1)
        file2_path = os.path.join("uploads", file2)
        
        if not os.path.exists(file1_path):
            raise HTTPException(status_code=404, detail=f"File {file1} not found")
        if not os.path.exists(file2_path):
            raise HTTPException(status_code=404, detail=f"File {file2} not found")
        
        analysis_result = comparison_service.get_smart_performance_analysis(file1_path, file2_path)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=400, detail=analysis_result["error"])
        
        return analysis_result
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Smart analysis endpoint error: {str(e)}")
        print(f"Full traceback: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error analyzing files: {str(e)}")

@app.get("/files/smart-analysis-simple/{file1}/{file2}")
async def get_smart_performance_analysis_simple(file1: str, file2: str):
    """Get simple smart performance analysis between two inventory files"""
    try:
        file1_path = os.path.join("uploads", file1)
        file2_path = os.path.join("uploads", file2)
        
        if not os.path.exists(file1_path):
            return {"error": f"File {file1} not found"}
        if not os.path.exists(file2_path):
            return {"error": f"File {file2} not found"}
        
        # Load files using key items service
        df1 = key_items_service._load_inventory_file(file1_path)
        df2 = key_items_service._load_inventory_file(file2_path)
        
        if df1 is None or df2 is None:
            return {"error": "Failed to load one or both files"}
        
        # Get basic stats
        ki00_1 = df1[df1['Season Code'] == 'KI00'] if 'Season Code' in df1.columns else pd.DataFrame()
        ki00_2 = df2[df2['Season Code'] == 'KI00'] if 'Season Code' in df2.columns else pd.DataFrame()
        
        total_stock_1 = ki00_1['Grand Total'].sum() if 'Grand Total' in ki00_1.columns and not ki00_1.empty else 0
        total_stock_2 = ki00_2['Grand Total'].sum() if 'Grand Total' in ki00_2.columns and not ki00_2.empty else 0
        
        # Simple analysis
        return {
            "file1": file1,
            "file2": file2,
            "analysis_date": datetime.now().strftime('%Y-%m-%d %H:%M'),
            "simple_comparison": {
                "file1_ki00_items": len(ki00_1),
                "file2_ki00_items": len(ki00_2),
                "file1_total_stock": int(total_stock_1) if pd.notna(total_stock_1) else 0,
                "file2_total_stock": int(total_stock_2) if pd.notna(total_stock_2) else 0,
                "stock_change": int(total_stock_2 - total_stock_1) if pd.notna(total_stock_2) and pd.notna(total_stock_1) else 0,
                "status": "✅ Smart analysis working! Files processed successfully."
            }
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Simple smart analysis error: {str(e)}")
        print(f"Full traceback: {error_details}")
        return {"error": f"Simple analysis failed: {str(e)}"}

@app.get("/files/performance-analysis")
async def get_performance_analysis():
    """Get performance analysis across all uploaded files"""
    try:
        files_data = comparison_service.get_all_uploaded_files()
        
        if len(files_data) < 2:
            return {
                "error": "Need at least 2 files for performance analysis",
                "files_count": len(files_data),
                "message": "Upload more inventory files to enable performance analysis"
            }
        
        analysis_result = comparison_service.analyze_product_performance(files_data)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=400, detail=analysis_result["error"])
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing analysis: {str(e)}")

@app.get("/files/enhanced-list")
async def get_enhanced_inventory_files():
    """Get enhanced list of inventory files with detailed metadata"""
    try:
        files_data = comparison_service.get_all_uploaded_files()
        
        return {
            "files": files_data,
            "total_files": len(files_data),
            "analysis_ready": len(files_data) >= 2,
            "all_key_items": key_items_service.get_all_key_items()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving enhanced file list: {str(e)}")

@app.get("/files/archive")
async def get_file_archive():
    """Get comprehensive file archive with categorization and search"""
    try:
        files_data = comparison_service.get_all_uploaded_files()
        
        # Categorize files by age and status
        recent_files = []
        archive_files = []
        
        for file in files_data:
            if "error" not in file:
                age_days = file.get("file_age_days", 0)
                if age_days <= 7:
                    recent_files.append(file)
                else:
                    archive_files.append(file)
        
        # Sort by date
        recent_files.sort(key=lambda x: x.get('upload_timestamp', 0), reverse=True)
        archive_files.sort(key=lambda x: x.get('upload_timestamp', 0), reverse=True)
        
        return {
            "recent_files": recent_files,
            "archive_files": archive_files,
            "total_files": len(files_data),
            "recent_count": len(recent_files),
            "archive_count": len(archive_files),
            "storage_info": {
                "upload_directory": "uploads",
                "total_size_mb": sum(f.get("file_size", 0) for f in files_data if "error" not in f) / (1024 * 1024)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving file archive: {str(e)}")

@app.get("/files/archive/{filename}/download")
async def download_archive_file(filename: str):
    """Download a file from the archive"""
    try:
        file_path = os.path.join("uploads", filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            file_path,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename=filename
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")

@app.get("/key-items/batch-alerts")
async def get_all_key_items_with_alerts():
    """Get all key items with their alerts in a single batch request"""
    try:
        # Get the latest file
        files = comparison_service.get_all_uploaded_files()
        if not files:
            return {"key_items": [], "message": "No files uploaded yet"}
        
        latest_file = files[0]
        
        # Process all key items with alerts in one go
        success, all_alerts, error = key_items_service.get_all_key_items_with_alerts(latest_file['file_path'])
        
        if not success:
            raise HTTPException(status_code=400, detail=error)
        
        return {
            "key_items": all_alerts,
            "file": latest_file['filename'],
            "total_items": len(all_alerts),
            "cached": True
        }
        
    except Exception as e:
        print(f"⚠️  Error in batch alerts: {str(e)}")
        return {"key_items": [], "error": str(e)}

@app.get("/search/article/{search_term}")
async def search_article_alerts(search_term: str):
    """Search for specific article alerts"""
    try:
        print(f"🔍 API: Searching for article '{search_term}'")
        results = key_items_service.search_article_alerts(search_term)
        
        return {
            "search_term": search_term,
            "results": results,
            "count": len(results),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/thresholds/set")
async def set_custom_threshold(item_name: str, threshold: int):
    """Set custom threshold for a specific key item"""
    try:
        if threshold < 0:
            raise HTTPException(status_code=400, detail="Threshold must be positive")
        
        success = key_items_service.set_custom_threshold(item_name, threshold)
        
        return {
            "success": success,
            "item_name": item_name,
            "threshold": threshold,
            "message": f"Threshold set to {threshold} for {item_name}"
        }
        
    except Exception as e:
        print(f"❌ Set threshold error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to set threshold: {str(e)}")

@app.get("/thresholds/get/{item_name}")
async def get_custom_threshold(item_name: str):
    """Get custom threshold for a specific key item"""
    try:
        threshold = key_items_service.get_custom_threshold(item_name)
        is_custom = item_name in key_items_service.custom_thresholds
        
        return {
            "item_name": item_name,
            "threshold": threshold,
            "is_custom": is_custom,
            "default_threshold": key_items_service.default_size_threshold
        }
        
    except Exception as e:
        print(f"❌ Get threshold error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get threshold: {str(e)}")

@app.get("/thresholds/all")
async def get_all_custom_thresholds():
    """Get all custom thresholds"""
    try:
        thresholds = key_items_service.get_all_custom_thresholds()
        
        return {
            "custom_thresholds": thresholds,
            "default_threshold": key_items_service.default_size_threshold,
            "total_custom": len(thresholds)
        }
        
    except Exception as e:
        print(f"❌ Get all thresholds error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get thresholds: {str(e)}")

@app.delete("/thresholds/reset/{item_name}")
async def reset_custom_threshold(item_name: str):
    """Reset custom threshold for a specific key item to default"""
    try:
        success = key_items_service.reset_custom_threshold(item_name)
        
        return {
            "success": success,
            "item_name": item_name,
            "message": f"Threshold reset to default for {item_name}"
        }
        
    except Exception as e:
        print(f"❌ Reset threshold error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reset threshold: {str(e)}")

# Email Alert Endpoints
@app.post("/email/send-alert")
async def send_email_alert(
    item_name: str = Form(None)
):
    """Send personalized email alert to all active recipients"""
    try:
        # Get latest file for alerts
        files = comparison_service.get_all_uploaded_files()
        if not files:
            raise HTTPException(status_code=400, detail="No inventory files found")
        
        latest_file = files[0]
        
        # Get low stock items
        low_stock_items, success, error = key_items_service.get_all_key_items_with_alerts(latest_file['file_path'])
        if not success:
            raise HTTPException(status_code=400, detail=error)
        
        # Send personalized email to configured recipients
        # You can add multiple recipients here
        recipients = ["danieralertsystem@gmail.com"]  # Danier dedicated email
        result = email_service.send_personalized_alert(
            recipients=recipients,
            low_stock_items=low_stock_items,
            recipient_names={"danieralertsystem@gmail.com": "Danier Stock Alert System"},
            item_name=item_name
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": f"Email alert sent to {len(recipients)} recipients",
                "recipients": recipients,
                "items_count": len(low_stock_items),
                "item_name": item_name
            }
        else:
            raise HTTPException(status_code=500, detail=result["message"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/email/send-item-alert/{item_name}")
async def send_item_specific_alert(
    item_name: str
):
    """Send alert for a specific item to all active recipients"""
    try:
        # Get the latest file for alerts
        files = comparison_service.get_all_uploaded_files()
        if not files:
            raise HTTPException(status_code=404, detail="No inventory files found")
        
        latest_file = files[0]
        
        # Get low stock items for this specific item
        success, all_alerts, error = key_items_service.get_all_key_items_with_alerts(latest_file['file_path'])
        if not success:
            raise HTTPException(status_code=400, detail=error)
        
        # Extract low stock items from the alerts structure
        low_stock_items = []
        for item_data in all_alerts:
            if item_data['name'] == item_name:
                low_stock_items = item_data['alerts']
                break
        
        if not low_stock_items:
            raise HTTPException(status_code=404, detail=f"No low stock items found for {item_name}")
        
        # Send personalized email to configured recipients
        active_recipients = recipients_storage.get_active_recipients()
        if not active_recipients:
            # If no recipients configured, use default
            recipients = ["danieralertsystem@gmail.com"]
            recipient_names = {"danieralertsystem@gmail.com": "Danier Stock Alert System"}
        else:
            recipients = [r['email'] for r in active_recipients]
            recipient_names = {r['email']: r['name'] for r in active_recipients}
        
        result = email_service.send_personalized_alert(
            recipients=recipients,
            low_stock_items=low_stock_items,
            recipient_names=recipient_names,
            item_name=item_name
        )
        
        # Record email sent to each recipient
        if result["success"]:
            for recipient_email in recipients:
                recipients_storage.record_email_sent(recipient_email)
        
        if result["success"]:
            return {
                "success": True,
                "message": f"Email alert sent to {len(recipients)} recipients",
                "recipients": recipients,
                "items_count": len(low_stock_items),
                "item_name": item_name
            }
        else:
            raise HTTPException(status_code=500, detail=result["message"])
            
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/email/status")
async def get_email_status():
    """Get email service status and configuration"""
    smtp_configured = bool(email_service.smtp_pass)
    return {
        "smtp_configured": smtp_configured,
        "smtp_host": email_service.smtp_host,
        "smtp_port": email_service.smtp_port,
        "email_from": email_service.email_from,
        "status": "Ready" if smtp_configured else "Not configured"
    }

@app.get("/threshold-analysis")
async def get_threshold_analysis():
    """Get threshold change analysis between latest and previous file uploads"""
    try:
        # Get all uploaded files
        files = comparison_service.get_all_uploaded_files()
        if not files:
            return {"error": "No files uploaded yet"}
        
        if len(files) < 2:
            # Only one file - initial analysis
            current_file = files[0]
            analysis = threshold_analysis_service.analyze_threshold_changes(current_file['file_path'])
        else:
            # Compare latest with previous
            current_file = files[0]  # Most recent
            previous_file = files[1]  # Second most recent
            analysis = threshold_analysis_service.analyze_threshold_changes(
                current_file['file_path'], 
                previous_file['file_path']
            )
        
        # Add summary
        analysis['summary_text'] = threshold_analysis_service.get_threshold_alert_summary(analysis)
        
        return analysis
        
    except Exception as e:
        return {"error": f"Threshold analysis failed: {str(e)}"}

@app.get("/threshold-analysis/{filename}")
async def get_threshold_analysis_for_file(filename: str):
    """Get threshold analysis for a specific file compared to its previous upload"""
    try:
        # Get all uploaded files
        files = comparison_service.get_all_uploaded_files()
        if not files:
            return {"error": "No files uploaded yet"}
        
        # Find the specified file
        target_file = None
        target_index = -1
        
        for i, file in enumerate(files):
            if file['filename'] == filename:
                target_file = file
                target_index = i
                break
        
        if not target_file:
            return {"error": f"File {filename} not found"}
        
        if target_index == 0:
            # Latest file - compare with previous
            if len(files) < 2:
                analysis = threshold_analysis_service.analyze_threshold_changes(target_file['file_path'])
            else:
                previous_file = files[1]
                analysis = threshold_analysis_service.analyze_threshold_changes(
                    target_file['file_path'], 
                    previous_file['file_path']
                )
        else:
            # Compare with the file before it
            previous_file = files[target_index + 1]
            analysis = threshold_analysis_service.analyze_threshold_changes(
                target_file['file_path'], 
                previous_file['file_path']
            )
        
        # Add summary
        analysis['summary_text'] = threshold_analysis_service.get_threshold_alert_summary(analysis)
        
        return analysis
        
    except Exception as e:
        return {"error": f"Threshold analysis failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 