.PHONY: build run test clean docker-build docker-run migrate dev

# Variables
BINARY_NAME=yummio-server
DOCKER_IMAGE=yummio-backend
DOCKER_TAG=latest

# Build the application
build:
	go build -o bin/$(BINARY_NAME) cmd/server/main.go

# Run the application
run:
	go run cmd/server/main.go

# Run in development mode with hot reload
dev:
	air

# Run database migrations
migrate:
	go run cmd/migrate/main.go

# Run tests
test:
	go test -v ./...

# Run tests with coverage
test-coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# Clean build artifacts
clean:
	rm -rf bin/
	rm -f coverage.out coverage.html

# Install dependencies
deps:
	go mod download
	go mod tidy

# Format code
fmt:
	go fmt ./...

# Lint code
lint:
	golangci-lint run

# Generate swagger docs
swagger:
	swag init -g cmd/server/main.go -o docs

# Docker commands
docker-build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

docker-run:
	docker run -p 8080:8080 --env-file .env $(DOCKER_IMAGE):$(DOCKER_TAG)

docker-compose-up:
	docker-compose up -d

docker-compose-down:
	docker-compose down

docker-compose-logs:
	docker-compose logs -f

# Database commands
db-create:
	createdb yummio_db

db-drop:
	dropdb yummio_db

db-reset: db-drop db-create migrate

# Production deployment
deploy-prod:
	@echo "Building production binary..."
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/$(BINARY_NAME) cmd/server/main.go
	@echo "Production binary built successfully!"

# Install development tools
install-tools:
	go install github.com/cosmtrek/air@latest
	go install github.com/swaggo/swag/cmd/swag@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Help
help:
	@echo "Available commands:"
	@echo "  build          - Build the application"
	@echo "  run            - Run the application"
	@echo "  dev            - Run in development mode with hot reload"
	@echo "  migrate        - Run database migrations"
	@echo "  test           - Run tests"
	@echo "  test-coverage  - Run tests with coverage report"
	@echo "  clean          - Clean build artifacts"
	@echo "  deps           - Install dependencies"
	@echo "  fmt            - Format code"
	@echo "  lint           - Lint code"
	@echo "  swagger        - Generate swagger documentation"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run Docker container"
	@echo "  docker-compose-up   - Start all services with docker-compose"
	@echo "  docker-compose-down - Stop all services"
	@echo "  db-create      - Create database"
	@echo "  db-drop        - Drop database"
	@echo "  db-reset       - Reset database"
	@echo "  deploy-prod    - Build production binary"
	@echo "  install-tools  - Install development tools"