# Campus Connect Backend - Docker Setup

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB of available RAM
- Ports 8000, 5432, 27017, 6379, 8080, 7474, 7687 available

### Development Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env file with your configuration** (especially SECRET_KEY)

3. **Start all services:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

5. **Access the API:**
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Production Setup

1. **Copy and configure .env file:**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Start services:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Run migrations:**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

### Useful Commands

```bash
# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild specific service
docker-compose build backend

# Access database shell
docker-compose exec postgres psql -U postgres -d campus_connect

# Access MongoDB shell
docker-compose exec mongodb mongosh

# Access Redis CLI
docker-compose exec redis redis-cli

# Access Neo4j browser
# Open http://localhost:7474 in browser
```

## Services

- **backend**: FastAPI application (port 8000)
- **postgres**: PostgreSQL database (port 5432)
- **mongodb**: MongoDB database (port 27017)
- **redis**: Redis cache (port 6379)
- **weaviate**: Weaviate vector database (port 8080)
- **neo4j**: Neo4j graph database (ports 7474, 7687)

## Data Persistence

All databases use Docker volumes for data persistence:
- `postgres_data`: PostgreSQL data
- `mongodb_data`: MongoDB data
- `redis_data`: Redis data
- `weaviate_data`: Weaviate data
- `neo4j_data`: Neo4j data
- `neo4j_logs`: Neo4j logs

## Troubleshooting

### Services won't start
- Check if ports are already in use
- Ensure Docker has enough resources allocated
- Check logs: `docker-compose logs [service_name]`

### Database connection errors
- Wait for databases to be healthy (check health status)
- Verify environment variables in .env file
- Check network connectivity: `docker network ls`

### Migration errors
- Ensure PostgreSQL is running and healthy
- Check database credentials in .env
- Try: `docker-compose exec backend alembic upgrade head`
