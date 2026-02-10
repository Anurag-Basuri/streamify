# ============================================
# Streamify Monorepo — Makefile
# ============================================

.PHONY: help up prod dev down build logs clean restart status certs install lint

help: ## Show this help message
	@echo.
	@echo   Streamify Monorepo Commands
	@echo   ===========================
	@echo.
	@echo   DOCKER
	@echo   ------
	@echo   make up        Start all services (basic, no SSL)
	@echo   make prod      Start production with Traefik + SSL
	@echo   make dev       Start in dev mode (hot-reload)
	@echo   make down      Stop and remove containers
	@echo   make build     Rebuild all Docker images
	@echo   make logs      Tail all container logs
	@echo   make clean     Remove containers, volumes, images
	@echo   make restart   Restart all services
	@echo   make status    Show container status
	@echo   make certs     Show SSL certificate status
	@echo.
	@echo   DEVELOPMENT
	@echo   -----------
	@echo   make install   Install all workspace dependencies
	@echo   make lint      Lint all workspaces (via Turbo)
	@echo   make format    Format all files (Prettier)
	@echo   make turbo-build Build all workspaces (via Turbo)
	@echo.

## ---- Development (Local) ----

install: ## Install all workspace dependencies
	npm install

lint: ## Lint all workspaces via Turborepo
	npx turbo lint

format: ## Format all files with Prettier
	npm run format

turbo-build: ## Build all workspaces via Turborepo
	npx turbo build

## ---- Docker: Production ----

up: ## Start all services (basic, no Traefik)
	docker compose up -d
	@echo.
	@echo   Streamify is running!
	@echo   Frontend:  http://localhost
	@echo   Backend:   http://localhost:8000
	@echo.

prod: ## Start production with Traefik + SSL
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo.
	@echo   Streamify PRODUCTION is running!
	@echo   App:       https://$${DOMAIN:-localhost}
	@echo   Dashboard: http://localhost:8080
	@echo.

build: ## Rebuild all Docker images
	docker compose build --no-cache

## ---- Docker: Development ----

dev: ## Start in development mode with hot-reload
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up
	@echo.
	@echo   Streamify DEV is running!
	@echo   Frontend:      http://localhost:5173
	@echo   Backend:       http://localhost:8000
	@echo   Mongo Express: http://localhost:8081
	@echo.

## ---- Docker: Management ----

down: ## Stop and remove all containers
	docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.dev.yml down 2>/dev/null || docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## Follow logs from all containers
	docker compose logs -f

status: ## Show status of all containers
	docker compose ps -a

certs: ## Show SSL certificate status
	@docker compose -f docker-compose.yml -f docker-compose.prod.yml exec traefik cat /letsencrypt/acme.json 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "No certificates found. Is Traefik running?"

## ---- Cleanup ----

clean: ## Remove containers, volumes, and built images
	docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.dev.yml down -v --rmi local 2>/dev/null || docker compose down -v --rmi local
	@echo   Cleaned up all Streamify containers, volumes, and images.
