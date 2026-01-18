#!/bin/bash

# AWS Deployment Script for Campus Connect Backend
# Usage: ./deploy-aws.sh [region] [environment]

set -e

# Configuration
AWS_REGION=${1:-us-east-1}
ENVIRONMENT=${2:-production}
ECR_REPO="campus-connect-backend"
CLUSTER_NAME="campus-connect-cluster"
SERVICE_NAME="campus-connect-backend"
TASK_DEFINITION="campus-connect-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AWS deployment...${NC}"
echo "Region: $AWS_REGION"
echo "Environment: $ENVIRONMENT"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo -e "${YELLOW}Step 1: Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

echo -e "${YELLOW}Step 2: Building Docker image...${NC}"
docker build -t $ECR_REPO:latest .

echo -e "${YELLOW}Step 3: Tagging image...${NC}"
docker tag $ECR_REPO:latest $ECR_REGISTRY/$ECR_REPO:latest
docker tag $ECR_REPO:latest $ECR_REGISTRY/$ECR_REPO:$(git rev-parse --short HEAD)

echo -e "${YELLOW}Step 4: Pushing image to ECR...${NC}"
docker push $ECR_REGISTRY/$ECR_REPO:latest
docker push $ECR_REGISTRY/$ECR_REPO:$(git rev-parse --short HEAD)

echo -e "${YELLOW}Step 5: Updating ECS service...${NC}"
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --force-new-deployment \
  --region $AWS_REGION \
  --query 'service.serviceName' \
  --output text

echo -e "${GREEN}Deployment initiated successfully!${NC}"
echo -e "${YELLOW}Monitor deployment status:${NC}"
echo "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION"
