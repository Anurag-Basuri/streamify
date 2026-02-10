# ============================================
# Streamify — Makefile
# Common Docker commands for development
# ============================================

.PHONY: help up dev down build logs clean restart status

help: ## Show this help message
	@echo.
	@echo   Streamify Docker Commands
	@echo   =========================
	@echo.
	@echo   make up        Start all services (production)
	@echo   make dev       Start in dev mode (hot-reload)
	@echo   make down      Stop and remove containers
	@echo   make build     Rebuild all images
	@echo   make logs      Tail all container logs
	@echo   make clean     Remove containers, volumes, images
	@echo   make restart   Restart all services
	@echo   make status    Show container status
	@echo.

## ---- Production ----

up: ## Start all services in production mode
	docker compose up -d
	@echo.
	@echo   Streamify is running!
	@echo   Frontend:  http://localhost
	@echo   Backend:   http://localhost:8000
	@echo.

build: ## Rebuild all Docker images
	docker compose build --no-cache

## ---- Development ----

dev: ## Start in development mode with hot-reload
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up
	@echo.
	@echo   Streamify DEV is running!
	@echo   Frontend:      http://localhost:5173
	@echo   Backend:       http://localhost:8000
	@echo   Mongo Express: http://localhost:8081
	@echo.

## ---- Management ----

down: ## Stop and remove all containers
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

restart: ## Restart all services
	docker compose restart

logs: ## Follow logs from all containers
	docker compose logs -f

status: ## Show status of all containers
	docker compose ps -a

## ---- Cleanup ----

clean: ## Remove containers, volumes, and built images
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --rmi local
	@echo   Cleaned up all Streamify containers, volumes, and images.
