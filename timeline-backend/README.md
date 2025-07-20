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

Create a `.env` file in the `timeline-backend` directory. You can copy the example below or create your own:

**Option 1: Copy the example configuration**
```bash
# Copy the example configuration
cp .env.example .env
# Then edit .env with your actual database credentials
```

**Note**: If `.env.example` doesn't exist, you can create it manually using the configuration below.

**Option 2: Create .env manually**
Create a `.env` file in the `timeline-backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=timeline_game
DB_USER=postgres
DB_PASSWORD=your_password

# Test Database
TEST_DB_HOST=localhost
TEST_DB_PORT=5433
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

## 🃏 Card Management

### Adding Cards

You can add cards to the game in several ways:

#### 1. Database Migration (Recommended for bulk)
```bash
# Run the migration to add 50+ historical events
yarn db:migrate
```

#### 2. Command Line Script
```bash
# Add a single card interactively
node scripts/add-cards.js --single

# Add multiple cards interactively
node scripts/add-cards.js --bulk

# Import from JSON file
node scripts/add-cards.js --file sample-cards.json

# Preview what would be added (dry run)
node scripts/add-cards.js --file sample-cards.json --dry-run
```

#### 3. API Endpoints
```bash
# Create a single card
curl -X POST http://localhost:3001/api/admin/cards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Event",
    "description": "Event description",
    "dateOccurred": "1900-01-01",
    "category": "History",
    "difficulty": 2
  }'

# Create multiple cards
curl -X POST http://localhost:3001/api/admin/cards/bulk \
  -H "Content-Type: application/json" \
  -d @cards.json
```

#### 4. Test API Endpoints
```bash
# Run comprehensive API tests
node scripts/test-cards-api.js
```

### Card Data Structure
```json
{
  "title": "Event Title",           // Required, max 255 characters
  "description": "Event description", // Optional
  "dateOccurred": "1900-01-01",    // Required, YYYY-MM-DD format
  "category": "History",           // Required, from predefined list
  "difficulty": 2                  // Required, integer 1-5
}
```

### Available Categories
- `History`, `Technology`, `Science`, `Space`, `Aviation`
- `Cultural`, `Military`, `Political`, `Disaster`
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

### Card Management (Admin)
- `POST /api/admin/cards` - Create a new card
- `GET /api/admin/cards` - Get all cards (with filtering/pagination)
- `GET /api/admin/cards/:id` - Get a specific card
- `PUT /api/admin/cards/:id` - Update a card
- `DELETE /api/admin/cards/:id` - Delete a card
- `POST /api/admin/cards/bulk` - Create multiple cards

For detailed API documentation, see:
- [Cards CRUD API Documentation](docs/API_CARDS_CRUD.md)
- [Quick Reference](docs/API_CARDS_QUICK_REFERENCE.md)

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
| `DB_PORT` | Database port | `5433` |
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

## 🔧 Troubleshooting

### Common Setup Issues

**Database Connection Failed**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql

# Check if the database exists
psql -h localhost -p 5433 -U postgres -l | grep timeline_game
```

**Port Already in Use**
```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process if needed
kill -9 <PID>
```

**Migration Issues**
```bash
# Check database status
yarn db:status

# Reset database if needed
yarn db:reset

# Run migrations manually
yarn db:migrate
```

**Test Database Issues**
```bash
# Run tests with database setup
NODE_ENV=test yarn db:migrate
yarn test
```

### Environment Variable Reference

Create a `.env` file with these variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=timeline_game
DB_USER=postgres
DB_PASSWORD=your_password

# Test Database
TEST_DB_HOST=localhost
TEST_DB_PORT=5433
TEST_DB_NAME=timeline_game_test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=your_password

# Server Configuration
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
```

## 📄 License

MIT License - see LICENSE file for details 