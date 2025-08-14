# 🚀 Danier Stock Alert System - Professional Docker Deployment

## Quick Start (Recommended)

### Prerequisites
- Docker Desktop installed
- 4GB RAM available
- Ports 3000 and 8000 free

### One-Command Startup
```bash
./start.sh
```

That's it! The script will:
1. ✅ Check Docker installation
2. 🧹 Clean up any existing containers
3. 🔄 Build fresh containers
4. 🚀 Start the system
5. 🔍 Health check both services
6. 📊 Provide access URLs

## Access Your System
- **Frontend**: http://localhost:3000 (Upload page by default)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Management Commands

### Start System
```bash
./start.sh
```

### Stop System
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only  
docker-compose logs -f frontend
```

### Restart System
```bash
docker-compose restart
```

### Complete Reset
```bash
docker-compose down
docker system prune -f
./start.sh
```

## Features
- ✅ **Containerized**: Runs anywhere Docker runs
- ✅ **Auto-restart**: Services restart if they crash
- ✅ **Health checks**: Automatic monitoring
- ✅ **Data persistence**: Uploads and database saved
- ✅ **Performance optimized**: Fast batch processing
- ✅ **Production ready**: Proper logging and error handling

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
./start.sh
```

### Docker Issues
```bash
# Reset Docker state
docker system prune -a -f
./start.sh
```

### File Upload Issues
- Ensure uploads directory has write permissions
- Check Docker volume mounts are working
- View backend logs: `docker-compose logs -f backend`

## Performance
- **Upload Processing**: < 5 seconds for typical files
- **Dashboard Loading**: < 2 seconds with caching
- **Memory Usage**: ~512MB total
- **Startup Time**: ~30 seconds

## Support
If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify Docker is running: `docker --version`
3. Ensure ports are free: `lsof -i :3000,8000`
4. Try complete reset (see above) 