#!/bin/bash
# =============================================================================
# Mediann Admin Panel - Docker Deployment Script
# =============================================================================
# This script builds and deploys the admin panel to a remote server
#
# Usage:
#   ./scripts/deploy.sh [options]
#
# Options:
#   --build-only    Only build the Docker image, don't deploy
#   --push          Push to Docker registry instead of direct server upload
#   --help          Show this help message
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Configuration - EDIT THESE VALUES
# =============================================================================
IMAGE_NAME="mediann-admin"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Remote server settings
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_HOST="${REMOTE_HOST:-your-server-ip}"
REMOTE_PATH="/opt/backend_sceleton"

# Production environment variables
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://api.mediann.de}"
NEXT_PUBLIC_ADMIN_URL="${NEXT_PUBLIC_ADMIN_URL:-https://admin.mediann.de}"

# Docker registry (if using --push option)
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"

# =============================================================================
# Parse arguments
# =============================================================================
BUILD_ONLY=false
PUSH_TO_REGISTRY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --push)
            PUSH_TO_REGISTRY=true
            shift
            ;;
        --help)
            echo "Usage: ./scripts/deploy.sh [options]"
            echo ""
            echo "Options:"
            echo "  --build-only    Only build the Docker image, don't deploy"
            echo "  --push          Push to Docker registry instead of direct upload"
            echo "  --help          Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  REMOTE_USER     SSH user (default: root)"
            echo "  REMOTE_HOST     Server hostname/IP (default: your-server-ip)"
            echo "  IMAGE_TAG       Docker image tag (default: latest)"
            echo "  NEXT_PUBLIC_API_URL   API URL for production"
            echo "  NEXT_PUBLIC_ADMIN_URL Admin URL for production"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# =============================================================================
# Validation
# =============================================================================
if [[ "$REMOTE_HOST" == "your-server-ip" && "$BUILD_ONLY" == false ]]; then
    log_error "Please set REMOTE_HOST environment variable or edit this script"
    log_info "Example: REMOTE_HOST=192.168.1.100 ./scripts/deploy.sh"
    exit 1
fi

# =============================================================================
# Build Docker Image
# =============================================================================
log_info "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
log_info "API URL: ${NEXT_PUBLIC_API_URL}"
log_info "Admin URL: ${NEXT_PUBLIC_ADMIN_URL}"

docker build \
    --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
    --build-arg NEXT_PUBLIC_ADMIN_URL="${NEXT_PUBLIC_ADMIN_URL}" \
    -t "${IMAGE_NAME}:${IMAGE_TAG}" \
    .

log_success "Docker image built successfully!"

# Exit if build-only
if [[ "$BUILD_ONLY" == true ]]; then
    log_info "Build-only mode, skipping deployment"
    exit 0
fi

# =============================================================================
# Deploy
# =============================================================================
if [[ "$PUSH_TO_REGISTRY" == true ]]; then
    # Push to Docker registry
    if [[ -z "$DOCKER_REGISTRY" ]]; then
        log_error "DOCKER_REGISTRY not set. Please set it for --push mode"
        exit 1
    fi
    
    FULL_IMAGE_NAME="${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    
    log_info "Tagging image for registry: ${FULL_IMAGE_NAME}"
    docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${FULL_IMAGE_NAME}"
    
    log_info "Pushing to registry..."
    docker push "${FULL_IMAGE_NAME}"
    
    log_success "Image pushed to registry!"
    
    log_info "Pulling image on remote server..."
    ssh "${REMOTE_USER}@${REMOTE_HOST}" "docker pull ${FULL_IMAGE_NAME}"
else
    # Direct upload via SSH
    log_info "Saving Docker image..."
    docker save "${IMAGE_NAME}:${IMAGE_TAG}" | gzip > /tmp/${IMAGE_NAME}.tar.gz
    
    log_info "Uploading to server (this may take a few minutes)..."
    scp /tmp/${IMAGE_NAME}.tar.gz "${REMOTE_USER}@${REMOTE_HOST}:/tmp/"
    
    log_info "Loading image on server..."
    ssh "${REMOTE_USER}@${REMOTE_HOST}" "gunzip -c /tmp/${IMAGE_NAME}.tar.gz | docker load && rm /tmp/${IMAGE_NAME}.tar.gz"
    
    # Cleanup local temp file
    rm /tmp/${IMAGE_NAME}.tar.gz
fi

# =============================================================================
# Restart container on server
# =============================================================================
log_info "Restarting admin container on server..."

ssh "${REMOTE_USER}@${REMOTE_HOST}" << 'ENDSSH'
cd /opt/backend_sceleton/backend

# Check if docker-compose.prod.yml exists
if [[ -f docker-compose.prod.yml ]]; then
    docker compose -f docker-compose.prod.yml --env-file .env.prod up -d admin
    docker compose -f docker-compose.prod.yml --env-file .env.prod exec nginx nginx -s reload 2>/dev/null || true
else
    echo "Warning: docker-compose.prod.yml not found"
    echo "Please add admin service to your docker-compose configuration"
fi
ENDSSH

log_success "Deployment complete!"
log_info "Admin panel should be available at: ${NEXT_PUBLIC_ADMIN_URL}"

# =============================================================================
# Health check
# =============================================================================
log_info "Waiting for health check..."
sleep 5

if curl -sf "${NEXT_PUBLIC_ADMIN_URL}" > /dev/null 2>&1; then
    log_success "Health check passed! Admin panel is online."
else
    log_warning "Health check failed or timed out. Please verify manually."
fi

