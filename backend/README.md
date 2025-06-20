# Yummio Recipe App Backend

A robust Go backend API for the Yummio recipe management application with PostgreSQL database.

## 🚀 Features

- **User Authentication** - JWT-based auth with email/password
- **Recipe Management** - CRUD operations for recipes with rich metadata
- **Collections** - Organize recipes into custom collections
- **Shopping Lists** - Create and manage ingredient lists
- **Image Upload** - Support for recipe images with cloud storage
- **Search & Filtering** - Advanced recipe search capabilities
- **Measurement Conversion** - Automatic unit conversions
- **Social Features** - Recipe sharing and favorites
- **Admin Panel** - User and content management

## 🛠 Tech Stack

- **Language**: Go 1.21+
- **Database**: PostgreSQL 15+
- **Framework**: Gin (HTTP router)
- **ORM**: GORM
- **Authentication**: JWT tokens
- **File Storage**: AWS S3 compatible
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Go 1.21 or higher
- PostgreSQL 15 or higher
- Redis (optional, for caching)
- AWS S3 or compatible storage (for images)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd yummio-backend
go mod download
```

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=8080
GIN_MODE=release

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=yummio
DB_PASSWORD=your_password
DB_NAME=yummio_db
DB_SSLMODE=disable

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=yummio-images

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# External APIs
SPOONACULAR_API_KEY=your_spoonacular_key
```

### 3. Database Setup

```bash
# Create database
createdb yummio_db

# Run migrations
go run cmd/migrate/main.go
```

### 4. Run the Application

```bash
# Development
go run cmd/server/main.go

# Production build
go build -o bin/yummio-server cmd/server/main.go
./bin/yummio-server
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

### Recipe Endpoints

#### Get All Recipes
```http
GET /recipes?page=1&limit=20&search=pasta&difficulty=easy&type=dinner
Authorization: Bearer <access_token>
```

#### Get Recipe by ID
```http
GET /recipes/{id}
Authorization: Bearer <access_token>
```

#### Create Recipe
```http
POST /recipes
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Spaghetti Carbonara",
  "description": "Classic Italian pasta dish",
  "prep_time": 15,
  "cook_time": 20,
  "servings": 4,
  "difficulty": "medium",
  "type": "dinner",
  "ingredients": [
    {
      "name": "spaghetti",
      "amount": 400,
      "unit": "g"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "instruction": "Boil water for pasta"
    }
  ],
  "tags": ["italian", "pasta", "quick"]
}
```

#### Update Recipe
```http
PUT /recipes/{id}
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Delete Recipe
```http
DELETE /recipes/{id}
Authorization: Bearer <access_token>
```

### Collection Endpoints

#### Get User Collections
```http
GET /collections
Authorization: Bearer <access_token>
```

#### Create Collection
```http
POST /collections
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Italian Favorites",
  "description": "My favorite Italian recipes",
  "is_public": false
}
```

#### Add Recipe to Collection
```http
POST /collections/{id}/recipes
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "recipe_id": "uuid-here"
}
```

### Shopping List Endpoints

#### Get Shopping Lists
```http
GET /shopping-lists
Authorization: Bearer <access_token>
```

#### Create Shopping List
```http
POST /shopping-lists
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Weekly Groceries",
  "items": [
    {
      "name": "tomatoes",
      "amount": 2,
      "unit": "kg",
      "completed": false
    }
  ]
}
```

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Recipes Table
```sql
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    prep_time INTEGER, -- minutes
    cook_time INTEGER, -- minutes
    servings INTEGER,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    type VARCHAR(50), -- breakfast, lunch, dinner, dessert, snack, drink
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Ingredients Table
```sql
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,3),
    unit VARCHAR(50),
    notes TEXT,
    order_index INTEGER DEFAULT 0
);
```

### Instructions Table
```sql
CREATE TABLE instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    step INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    image_url VARCHAR(500),
    timer_minutes INTEGER
);
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `8080` | No |
| `GIN_MODE` | Gin mode (debug/release) | `debug` | No |
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | Yes |
| `DB_USER` | Database user | | Yes |
| `DB_PASSWORD` | Database password | | Yes |
| `DB_NAME` | Database name | | Yes |
| `JWT_SECRET` | JWT signing secret | | Yes |
| `JWT_EXPIRY` | JWT token expiry | `24h` | No |
| `AWS_REGION` | AWS region | `us-east-1` | Yes |
| `S3_BUCKET` | S3 bucket name | | Yes |

## 🧪 Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run integration tests
go test -tags=integration ./...
```

## 📦 Deployment

### Docker Deployment

```bash
# Build image
docker build -t yummio-backend .

# Run with docker-compose
docker-compose up -d
```

### Manual Deployment

```bash
# Build for production
CGO_ENABLED=0 GOOS=linux go build -o bin/yummio-server cmd/server/main.go

# Deploy binary to your server
scp bin/yummio-server user@server:/opt/yummio/
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt
- **Rate Limiting** - API endpoint protection
- **CORS** - Cross-origin request handling
- **Input Validation** - Request data validation
- **SQL Injection Protection** - GORM ORM protection

## 📈 Performance

- **Database Indexing** - Optimized queries
- **Connection Pooling** - Efficient DB connections
- **Caching** - Redis for frequently accessed data
- **Pagination** - Large dataset handling
- **Compression** - Gzip response compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.