# Troubleshooting Guide

## Docker Issues

### Error: "unable to get image" or "The system cannot find the file specified"

**Problem**: Docker Desktop is not running.

**Solution**:
1. Start Docker Desktop application on Windows
2. Wait for Docker Desktop to fully start (check system tray icon)
3. Verify Docker is running: `docker ps`
4. Try the command again

### Error: "version attribute is obsolete"

**Problem**: Docker Compose v2+ doesn't require the `version` field.

**Solution**: Already fixed in the docker-compose files. The warnings are harmless but can be ignored.

### Port Already in Use

**Problem**: One or more ports (8000, 5432, 27017, etc.) are already in use.

**Solution**:
1. Find what's using the port:
   ```powershell
   netstat -ano | findstr :8000
   ```
2. Stop the conflicting service or change ports in `.env` file
3. Update docker-compose.yml port mappings if needed

### Services Won't Start

**Problem**: Services fail to start or crash immediately.

**Solution**:
1. Check logs: `docker-compose logs [service_name]`
2. Verify Docker has enough resources (Settings > Resources in Docker Desktop)
3. Ensure at least 4GB RAM and 2 CPU cores available
4. Check disk space: `docker system df`

### Database Connection Errors

**Problem**: Backend can't connect to databases.

**Solution**:
1. Wait for databases to be healthy:
   ```powershell
   docker-compose ps
   ```
   All services should show "healthy" status
2. Check environment variables in `.env` file
3. Verify service names match in docker-compose.yml
4. Test connection manually:
   ```powershell
   docker-compose exec postgres psql -U postgres -d campus_connect
   ```

### Migration Errors

**Problem**: Alembic migrations fail.

**Solution**:
1. Ensure PostgreSQL is running and healthy
2. Check database credentials in `.env`
3. Try recreating the database:
   ```powershell
   docker-compose down -v
   docker-compose up -d postgres
   # Wait for postgres to be healthy
   docker-compose exec backend alembic upgrade head
   ```

### Weaviate Connection Issues

**Problem**: Weaviate fails to start or connect.

**Solution**:
1. Check Weaviate logs: `docker-compose logs weaviate`
2. Verify port 8080 is available
3. Try accessing Weaviate directly: `http://localhost:8080/v1/.well-known/ready`
4. If using Weaviate Cloud, update `WEAVIATE_URL` in `.env`

### Neo4j Connection Issues

**Problem**: Neo4j fails to start or connect.

**Solution**:
1. Check Neo4j logs: `docker-compose logs neo4j`
2. Verify ports 7474 and 7687 are available
3. Access Neo4j browser: `http://localhost:7474`
4. Default credentials: neo4j / neo4j_password (change in production!)

## Python/Application Issues

### Import Errors

**Problem**: Module not found errors when running the app.

**Solution**:
1. Ensure you're in the Backend directory
2. Install dependencies: `pip install -r requirements.txt`
3. Check Python path includes the Backend directory
4. Use: `python -m app.main` instead of `python app/main.py`

### JWT Token Errors

**Problem**: Authentication fails or tokens are invalid.

**Solution**:
1. Check `SECRET_KEY` in `.env` - must be set and consistent
2. Verify token expiration settings
3. Check system clock is synchronized
4. Clear browser cookies/localStorage if testing

### Database Session Errors

**Problem**: "Session is closed" or similar database errors.

**Solution**:
1. Ensure database connections are properly initialized
2. Check connection pool settings in `app/database/postgres.py`
3. Verify database is accessible from the backend container
4. Check for connection leaks in long-running requests

## Common Fixes

### Reset Everything

```powershell
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all Docker images (optional)
docker system prune -a

# Rebuild and start
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Check Service Health

```powershell
# View all services and their status
docker-compose ps

# View logs for a specific service
docker-compose logs -f backend

# View logs for all services
docker-compose logs -f
```

### Database Reset

```powershell
# Stop services
docker-compose down

# Remove only database volumes
docker volume rm backend_postgres_data backend_mongodb_data

# Start services (will recreate databases)
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head
```

## Getting Help

1. Check logs first: `docker-compose logs [service]`
2. Verify environment variables: `docker-compose config`
3. Test individual services: `docker-compose exec [service] [command]`
4. Check Docker Desktop resources and settings
5. Review the IMPLEMENTATION_SUMMARY.md for architecture details
