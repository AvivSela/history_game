# Timeline Game Backend

Enhanced backend API for the Timeline historical card game with PostgreSQL database integration.

## 🚀 Features

- **PostgreSQL Database**: Persistent storage for game cards and data
- **Connection Pooling**: Efficient database connection management
- **Enhanced Health Checks**: Database status monitoring
- **Migration System**: Automated database schema and data setup
- **Error Handling**: Comprehensive error handling and logging
- **Performance Monitoring**: Query performance tracking

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Yarn package manager

## 🛠️ Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE timeline_game;
CREATE DATABASE timeline_game_test;  -- for testing
```

### 3. Environment Configuration

Create a `.env` file in the `timeline-backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timeline_game
DB_USER=postgres
DB_PASSWORD=your_password

# Test Database
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=timeline_game_test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=your_password

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Database Migration

Run the database migrations to set up the schema and sample data:

```bash
yarn db:migrate
```

### 5. Start the Server

```bash
# Development mode
yarn dev

# Production mode
yarn start
```

## 📊 Database Management

### Migration Commands

```bash
# Run migrations
yarn db:migrate

# Reset database (drop and recreate)
yarn db:reset

# Check database status
yarn db:status
```

### Database Schema

The backend uses a single `cards` table with the following structure:

```sql
CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date_occurred DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Server and database health status

### Cards/Events
- `GET /api/events` - Get all cards
- `GET /api/events/random/:count` - Get random cards for a game
- `GET /api/events/random?count=5` - Get random cards (query parameter)
- `GET /api/events/category?name=History` - Get cards by category

### Categories
- `GET /api/categories` - Get all available categories

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run tests in CI mode
yarn test:ci
```

## 📁 Project Structure

```
timeline-backend/
├── config/
│   └── database.js          # Database configuration and connection
├── migrations/
│   ├── 001_initial_schema.sql  # Database schema
│   └── 002_sample_data.sql     # Sample data
├── scripts/
│   └── migrate.js           # Database migration script
├── utils/
│   ├── database.js          # Database utility functions
│   └── logger.js            # Logging utility
├── middleware/
│   └── errorHandler.js      # Error handling middleware
├── __tests__/               # Test files
├── server.js                # Main server file
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `timeline_game` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |

### Database Configuration

The database configuration supports three environments:

- **Development**: Local development with default settings
- **Test**: Separate test database for testing
- **Production**: Production settings with SSL support

## 🚨 Error Handling

The backend includes comprehensive error handling:

- Database connection errors
- Query execution errors
- Input validation errors
- Graceful shutdown handling

## 📈 Performance

- Connection pooling for efficient database connections
- Query performance monitoring and logging
- Optimized database indexes
- Prepared statements for security

## 🔒 Security

- Input validation and sanitization
- SQL injection prevention through parameterized queries
- Environment-based configuration
- Secure error messages (no sensitive data exposed)

## 📝 Logging

The backend uses structured logging with different levels:

- `info`: General application information
- `debug`: Detailed debugging information
- `error`: Error messages and stack traces
- `warn`: Warning messages

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Run migrations when changing database schema

## 📄 License

MIT License - see LICENSE file for details 