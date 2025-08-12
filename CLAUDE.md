# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
- `npm run dev` - Start development server with nodemon (auto-restart)
- `npm start` - Start production server
- `npm run sync-db` - Synchronize database models

### Docker Operations
- `npm run docker:build` - Build Docker image
- `npm run docker:up` - Start all services with docker-compose
- `npm run docker:down` - Stop all services
- `npm run docker:restart` - Restart services
- `npm run docker:logs` - View container logs
- `npm run docker:rebuild` - Complete rebuild (down, build, up)

### Testing
No test framework is currently configured. The project uses `echo "Error: no test specified" && exit 1` as placeholder.

## Architecture Overview

### Core Structure
This is an Express.js REST API backend for "Experta", a platform connecting building renovation clients with AMO (Assistance à Maîtrise d'Ouvrage) professionals and partners.

### Key Components

**Database Layer (Sequelize ORM)**
- MySQL database with full Docker containerization
- Models: User, Document, Projet, Mission with Sequelize associations
- Database initialization with default admin/test users
- Connection configuration in `src/config/database.js`
- Model associations and initialization in `src/models/index.js`

**Authentication & Authorization**
- JWT-based authentication with Bearer tokens
- Role-based access control (admin, client, AMO, partenaire)
- Middleware for authentication (`authenticateToken`) and authorization (`authorizeRole`)
- Optional authentication middleware for mixed access endpoints

**API Structure**
- RESTful API with consistent response format: `{success, data/message, error?}`
- Routes organized by entity: users, documents, client-documents, projets, missions
- Comprehensive CORS configuration supporting multiple development origins
- Request logging middleware with emoji indicators

**File Upload System**
- Multer integration for document uploads to `/uploads` directory
- Separate document endpoints for business documents vs client dashboard documents

### User Roles & Workflow
- **client**: End users seeking renovation services
- **AMO**: Architecture/project management professionals  
- **partenaire**: Building trade professionals (plumbing, electrical, etc.)
- **admin**: System administrators

AMO and partenaires have additional fields:
- `zoneIntervention`: Array of postal codes for service areas
- `tagsMetiers`: Array of specialization tags
- `nomEntreprise`: Company name
- `noteFiabilite`: Reliability rating

### Development Patterns

**Error Handling**
- Consistent error logging with emoji prefixes (❌ for errors, ✅ for success)
- Global error middleware with development vs production error details
- Try-catch blocks in all async controllers with detailed error messages

**Database Patterns**  
- Sequelize models with timestamps, underscored naming, and frozen table names
- Model associations defined in `src/models/index.js`
- Database sync with `alter: true` for schema updates without data loss
- Connection pooling and retry configuration for Docker environments

**Security Practices**
- Password hashing with bcryptjs (handled in User model hooks)
- JWT secret from environment variables
- CORS restrictions with allowed origins list
- Request parameter validation in controllers

## Environment Configuration

The application expects these environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` for database
- `JWT_SECRET` for authentication
- `NODE_ENV` for environment-specific behavior
- `PORT` for server port (defaults to 3000)

## Docker Setup

Fully containerized with docker-compose.yml including:
- Node.js application container
- MySQL 8.0 database  
- Adminer web interface for database management
- Health checks and volume persistence

See `docs/README-Docker.md` for detailed Docker setup and troubleshooting.

## API Endpoints

### User Management
- `POST /api/users/login` - User authentication
- `POST /api/users/` - Client registration  
- `POST /api/users/register-amo` - AMO professional registration
- `POST /api/users/register-partner` - Trade partner registration
- `GET /api/users/professionals/tag/:tag` - Find professionals by specialization
- `GET /api/users/professionals/zone/:zone` - Find professionals by location

### Document Management
- `POST /api/documents/upload` - Upload business documents
- `POST /api/client-documents/upload` - Upload client dashboard documents  

### Project Management
- Routes for projet and mission entities with full CRUD operations
- Projects link clients with AMO professionals and contain multiple missions

## Key Files to Understand

- `src/app.js` - Express application setup, middleware configuration, route mounting
- `src/models/index.js` - Database models, associations, and initialization logic
- `src/config/database.js` - Sequelize configuration with Docker-aware settings  
- `server.js` - Application entry point with server startup
- `src/middlewares/authMiddleware.js` - Authentication and authorization logic