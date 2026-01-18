# AWS Deployment Guide

## Overview

This guide covers deploying the Campus Connect FastAPI backend to AWS using containerized services. We'll use AWS ECS (Elastic Container Service) for the backend and managed AWS services for databases.

## Architecture Options

### Option 1: AWS ECS with Fargate (Recommended - Serverless Containers)
- **Backend**: ECS Fargate (no EC2 management)
- **PostgreSQL**: AWS RDS
- **MongoDB**: AWS DocumentDB
- **Redis**: AWS ElastiCache
- **Weaviate**: ECS Fargate or EC2
- **Neo4j**: ECS Fargate or EC2

### Option 2: AWS EKS (Kubernetes)
- All services in Kubernetes cluster
- More control, more complexity

### Option 3: EC2 with Docker Compose
- Single/multiple EC2 instances
- Run docker-compose
- Simpler but less scalable

## Recommended: ECS Fargate Deployment

### Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Docker installed locally
4. ECR repository created

### Step 1: Create AWS Resources

#### 1.1 Create ECR Repository

```bash
aws ecr create-repository --repository-name campus-connect-backend --region us-east-1
```

#### 1.2 Create RDS PostgreSQL Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier campus-connect-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --region us-east-1
```

Or use AWS Console:
- Go to RDS > Create Database
- Choose PostgreSQL
- Select Free Tier (db.t3.micro)
- Configure VPC and security groups

#### 1.3 Create DocumentDB Cluster (MongoDB Compatible)

```bash
aws docdb create-db-cluster \
  --db-cluster-identifier campus-connect-mongodb \
  --engine docdb \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name default \
  --region us-east-1

aws docdb create-db-instance \
  --db-instance-identifier campus-connect-mongodb-instance \
  --db-instance-class db.t3.medium \
  --engine docdb \
  --db-cluster-identifier campus-connect-mongodb \
  --region us-east-1
```

#### 1.4 Create ElastiCache Redis Cluster

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id campus-connect-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --vpc-security-group-ids sg-xxxxx \
  --region us-east-1
```

#### 1.5 Create VPC and Security Groups

```bash
# Create VPC (or use default)
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create security group for backend
aws ec2 create-security-group \
  --group-name campus-connect-backend-sg \
  --description "Security group for Campus Connect backend" \
  --vpc-id vpc-xxxxx

# Allow inbound on port 8000 from ALB
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 8000 \
  --source-group sg-alb-xxxxx

# Allow outbound to databases
aws ec2 authorize-security-group-egress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-db-xxxxx
```

### Step 2: Build and Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t campus-connect-backend .

# Tag image
docker tag campus-connect-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/campus-connect-backend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/campus-connect-backend:latest
```

### Step 3: Create ECS Task Definition

Create `task-definition.json`:

```json
{
  "family": "campus-connect-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/campus-connect-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "production"
        },
        {
          "name": "API_HOST",
          "value": "0.0.0.0"
        },
        {
          "name": "API_PORT",
          "value": "8000"
        }
      ],
      "secrets": [
        {
          "name": "POSTGRES_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:rds-endpoint"
        },
        {
          "name": "POSTGRES_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:rds-password"
        },
        {
          "name": "SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:jwt-secret-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/campus-connect-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

Register task definition:

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### Step 4: Create ECS Cluster and Service

```bash
# Create cluster
aws ecs create-cluster --cluster-name campus-connect-cluster

# Create service
aws ecs create-service \
  --cluster campus-connect-cluster \
  --service-name campus-connect-backend \
  --task-definition campus-connect-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<account-id>:targetgroup/campus-connect-tg/xxxxx,containerName=backend,containerPort=8000"
```

### Step 5: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name campus-connect-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-alb-xxxxx

# Create target group
aws elbv2 create-target-group \
  --name campus-connect-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /health

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:<account-id>:loadbalancer/app/campus-connect-alb/xxxxx \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<account-id>:targetgroup/campus-connect-tg/xxxxx
```

### Step 6: Store Secrets in AWS Secrets Manager

```bash
# Store database passwords
aws secretsmanager create-secret \
  --name rds-password \
  --secret-string "YourSecurePassword123!"

aws secretsmanager create-secret \
  --name jwt-secret-key \
  --secret-string "your-very-long-random-secret-key-here"

aws secretsmanager create-secret \
  --name rds-endpoint \
  --secret-string "campus-connect-postgres.xxxxx.us-east-1.rds.amazonaws.com"
```

### Step 7: Update Environment Variables

Create `.env.aws` file with AWS-specific values:

```env
# Application
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8000

# PostgreSQL (RDS)
POSTGRES_HOST=campus-connect-postgres.xxxxx.us-east-1.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<from-secrets-manager>
POSTGRES_DB=campus_connect

# MongoDB (DocumentDB)
MONGODB_URL=mongodb://admin:password@campus-connect-mongodb.xxxxx.docdb.amazonaws.com:27017
MONGODB_DB=campus_connect

# Redis (ElastiCache)
REDIS_HOST=campus-connect-redis.xxxxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=

# Weaviate (ECS Fargate or EC2)
WEAVIATE_URL=http://weaviate-service:8080
# Or use Weaviate Cloud
# WEAVIATE_URL=https://your-cluster.weaviate.network
# WEAVIATE_API_KEY=your-api-key

# Neo4j (ECS Fargate or EC2)
NEO4J_URI=bolt://neo4j-service:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=<from-secrets-manager>

# JWT
SECRET_KEY=<from-secrets-manager>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

## Alternative: Deploy Weaviate and Neo4j

### Option A: Deploy as ECS Services

Create separate ECS services for Weaviate and Neo4j:

```bash
# Weaviate service
aws ecs register-task-definition --cli-input-json file://weaviate-task-def.json
aws ecs create-service --cluster campus-connect-cluster --service-name weaviate --task-definition weaviate:1

# Neo4j service
aws ecs register-task-definition --cli-input-json file://neo4j-task-def.json
aws ecs create-service --cluster campus-connect-cluster --service-name neo4j --task-definition neo4j:1
```

### Option B: Use Managed Services

- **Weaviate**: Use Weaviate Cloud (SaaS) - update `WEAVIATE_URL` in environment
- **Neo4j**: Use Neo4j Aura (AWS) - update `NEO4J_URI` in environment

## Cost Optimization

### Free Tier Eligible
- RDS: db.t3.micro (750 hours/month for 12 months)
- ElastiCache: cache.t3.micro (750 hours/month for 12 months)
- ECS Fargate: 20GB storage, limited compute

### Estimated Monthly Costs (After Free Tier)

| Service | Instance Type | Monthly Cost (approx) |
|---------|--------------|----------------------|
| RDS PostgreSQL | db.t3.micro | $15-20 |
| DocumentDB | db.t3.medium | $50-70 |
| ElastiCache Redis | cache.t3.micro | $15-20 |
| ECS Fargate (Backend) | 1 vCPU, 2GB RAM | $30-40 |
| ECS Fargate (Weaviate) | 1 vCPU, 2GB RAM | $30-40 |
| ECS Fargate (Neo4j) | 1 vCPU, 2GB RAM | $30-40 |
| ALB | Standard | $20-25 |
| Data Transfer | First 1GB free | $0.09/GB |
| **Total** | | **$200-300/month** |

### Cost Reduction Tips

1. Use smaller instance types for development
2. Use Reserved Instances for production (30-50% savings)
3. Use Spot Instances for non-critical services
4. Enable auto-scaling to scale down during low usage
5. Use S3 for file storage instead of EBS volumes
6. Consider Aurora Serverless for PostgreSQL (pay per use)

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy-aws.yml`:

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: campus-connect-backend
  ECS_SERVICE: campus-connect-backend
  ECS_CLUSTER: campus-connect-cluster
  ECS_TASK_DEFINITION: campus-connect-backend

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "::set-output name=image::$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"
      
      - name: Fill in the new image ID in the Amazon ECS task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: backend
          image: ${{ steps.build-image.outputs.image }}
      
      - name: Deploy Amazon ECS task definition
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

## Security Best Practices

1. **Use AWS Secrets Manager** for all sensitive data
2. **Enable VPC** for all services (private subnets)
3. **Use Security Groups** to restrict access
4. **Enable SSL/TLS** for all connections
5. **Use IAM Roles** instead of access keys
6. **Enable CloudWatch Logs** for monitoring
7. **Use WAF** (Web Application Firewall) for ALB
8. **Enable AWS GuardDuty** for threat detection
9. **Regular security updates** for container images
10. **Enable encryption at rest** for all databases

## Monitoring and Logging

### CloudWatch Setup

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/campus-connect-backend

# Set up CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name campus-connect-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

## Quick Start Script

Create `deploy-aws.sh`:

```bash
#!/bin/bash

# Configuration
AWS_REGION="us-east-1"
ECR_REPO="campus-connect-backend"
CLUSTER_NAME="campus-connect-cluster"
SERVICE_NAME="campus-connect-backend"

# Build and push
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com

docker build -t $ECR_REPO .
docker tag $ECR_REPO:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest
docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

# Update ECS service
aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment --region $AWS_REGION

echo "Deployment initiated. Check ECS console for status."
```

## Troubleshooting

### Common Issues

1. **Container won't start**: Check CloudWatch logs
2. **Can't connect to databases**: Verify security groups and VPC configuration
3. **High costs**: Review instance sizes and enable auto-scaling
4. **Slow performance**: Check instance types and database connections

### Useful Commands

```bash
# View ECS service logs
aws logs tail /ecs/campus-connect-backend --follow

# Check service status
aws ecs describe-services --cluster campus-connect-cluster --services campus-connect-backend

# View task details
aws ecs describe-tasks --cluster campus-connect-cluster --tasks <task-id>

# SSH into ECS task (if using EC2 launch type)
aws ecs execute-command --cluster campus-connect-cluster --task <task-id> --container backend --command "/bin/bash" --interactive
```

## Next Steps

1. Set up Route 53 for custom domain
2. Configure SSL certificate with ACM
3. Set up auto-scaling policies
4. Configure backup strategies
5. Set up monitoring dashboards
6. Implement CI/CD pipeline
7. Configure disaster recovery
