# Database Migration Best Practices for CI/CD

## 🎯 Overview

This document outlines best practices for configuring database migrations in GitHub Actions CI/CD pipelines, specifically for the Timeline Game project.

## ✅ Current Implementation vs Best Practices

### **What We Have (Good)**
- ✅ PostgreSQL service container in GitHub Actions
- ✅ Health checks with `pg_isready`
- ✅ Environment-specific database configurations
- ✅ Migration script with status reporting
- ✅ Comprehensive error handling and logging

### **What We've Improved (Best Practices)**
- ✅ **Migration Versioning**: Track applied migrations with checksums
- ✅ **Idempotent Migrations**: Safe to run multiple times
- ✅ **Migration Validation**: Verify migration integrity
- ✅ **Database Isolation**: Clean test environment for each run
- ✅ **Performance Monitoring**: Track migration execution times
- ✅ **Transaction Support**: Atomic migration execution
- ✅ **Retry Logic**: Handle connection issues gracefully

## 🚀 Best Practice Implementation

### **1. Migration Versioning System**

**Before**: Manual migration execution without tracking
```yaml
# ❌ Old approach
- name: Setup database
  run: |
    psql -f migrations/001_schema.sql
    psql -f migrations/002_data.sql
```

**After**: Versioned migration system
```yaml
# ✅ New approach
- name: Setup database
  run: |
    node scripts/migrate.js migrate
    node scripts/migrate.js validate
```

**Benefits**:
- Tracks which migrations have been applied
- Prevents duplicate migration execution
- Enables migration rollback (future feature)
- Validates migration integrity with checksums

### **2. Database Isolation**

**Before**: Potential state pollution between test runs
```yaml
# ❌ Old approach
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_DB: timeline_game_test
```

**After**: Clean isolation with proper cleanup
```yaml
# ✅ New approach
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_DB: timeline_game_test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5

steps:
  # ... migration and test steps ...
  
  - name: Database cleanup
    if: always()
    run: node scripts/migrate.js reset
```

**Benefits**:
- Clean database state for each test run
- Prevents test interference
- Ensures consistent test environment
- Proper resource cleanup

### **3. Enhanced Error Handling**

**Before**: Basic error reporting
```javascript
// ❌ Old approach
try {
  await query(sql);
} catch (error) {
  logger.error('Migration failed:', error.message);
}
```

**After**: Comprehensive error handling with retry logic
```javascript
// ✅ New approach
async function testConnection(maxRetries = 3, retryDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW(), version()');
      client.release();
      return true;
    } catch (error) {
      if (attempt === maxRetries) {
        logger.error('Connection failed after all retries');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}
```

**Benefits**:
- Handles temporary network issues
- Provides detailed error context
- Graceful degradation
- Better debugging information

### **4. Performance Monitoring**

**Before**: No performance tracking
```javascript
// ❌ Old approach
await query(sql);
```

**After**: Performance monitoring with slow query detection
```javascript
// ✅ New approach
async function query(text, params = []) {
  const start = Date.now();
  const queryId = Math.random().toString(36).substring(7);
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 1000) {
      logger.warn(`Slow query detected (${duration}ms):`, {
        queryId,
        text: text.substring(0, 200),
        rows: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    // Enhanced error logging
  }
}
```

**Benefits**:
- Identifies performance bottlenecks
- Tracks migration execution times
- Monitors database health
- Enables performance optimization

## 📋 Migration Script Commands

### **Available Commands**

```bash
# Run all pending migrations
yarn db:migrate

# Reset database (drop and recreate)
yarn db:reset

# Show database status
yarn db:status

# Validate migration integrity
yarn db:validate
```

### **Command Examples**

```bash
# Development setup
cd timeline-backend
yarn db:migrate
yarn db:status

# Test environment
NODE_ENV=test yarn db:migrate
yarn db:validate

# Reset for clean state
yarn db:reset
```

## 🔧 GitHub Actions Configuration

### **Complete Workflow Example**

```yaml
name: Test Suite

on:
  push:
  pull_request:

jobs:
  test-backend:
    name: Backend Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: timeline_game_test
          POSTGRES_USER: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5433:5432
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Wait for database
        run: |
          echo "Waiting for PostgreSQL to be ready..."
          while ! pg_isready -h localhost -p 5433 -U postgres; do
            sleep 1
          done
          echo "PostgreSQL is ready!"

      - name: Setup test database
        run: |
          cd timeline-backend
          echo "🔍 Checking database connection..."
          node scripts/migrate.js status
          echo "🔄 Running database migrations..."
          node scripts/migrate.js migrate
          echo "✅ Verifying database setup..."
          node scripts/migrate.js status
          echo "🔍 Validating migration integrity..."
          node scripts/migrate.js validate
          echo "🎉 Database setup complete!"

      - name: Run backend tests
        run: yarn test:backend
        env:
          NODE_ENV: test
          TEST_DB_HOST: localhost
          TEST_DB_PORT: 5433
          TEST_DB_NAME: timeline_game_test
          TEST_DB_USER: postgres
          TEST_DB_PASSWORD: password

      - name: Database cleanup
        if: always()
        run: |
          cd timeline-backend
          echo "🧹 Cleaning up test database..."
          node scripts/migrate.js reset
        env:
          NODE_ENV: test
          TEST_DB_HOST: localhost
          TEST_DB_PORT: 5433
          TEST_DB_NAME: timeline_game_test
          TEST_DB_USER: postgres
          TEST_DB_PASSWORD: password
```

## 🛡️ Security Best Practices

### **1. Environment Variables**

```yaml
# ✅ Secure approach
env:
  NODE_ENV: test
  TEST_DB_HOST: localhost
  TEST_DB_PORT: 5433
  TEST_DB_NAME: timeline_game_test
  TEST_DB_USER: postgres
  TEST_DB_PASSWORD: ${{ secrets.TEST_DB_PASSWORD }}
```

### **2. Database Isolation**

```yaml
# ✅ Isolated test database
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_DB: timeline_game_test_${{ github.run_id }}
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: ${{ secrets.TEST_DB_PASSWORD }}
```

### **3. Connection Security**

```javascript
// ✅ Production configuration
production: {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
}
```

## 📊 Monitoring and Debugging

### **1. Migration Status**

```bash
# Check migration status
yarn db:status

# Output example:
📊 Database Status:
🔗 Connection: ✅ Connected
📋 Applied migrations (4):
  ✅ 000_migration_tracking.sql - 2024-01-15 10:30:00 (45ms)
  ✅ 001_initial_schema.sql - 2024-01-15 10:30:01 (120ms)
  ✅ 002_sample_data.sql - 2024-01-15 10:30:02 (85ms)
  ✅ 003_game_sessions.sql - 2024-01-15 10:30:03 (95ms)
📋 Cards table: ✅ Exists
📋 Game_sessions table: ✅ Exists
📋 Game_moves table: ✅ Exists
🎴 Total cards: 12
📁 Categories: History, Science, Technology
🎮 Total game sessions: 0
🎯 Total game moves: 0
```

### **2. Migration Validation**

```bash
# Validate migration integrity
yarn db:validate

# Output example:
🔍 Validating migration integrity...
✅ 000_migration_tracking.sql - Valid
✅ 001_initial_schema.sql - Valid
✅ 002_sample_data.sql - Valid
✅ 003_game_sessions.sql - Valid
```

### **3. Performance Monitoring**

```javascript
// Pool statistics
const stats = getPoolStats();
console.log(stats);
// Output: { totalCount: 5, idleCount: 3, waitingCount: 0 }
```

## 🚨 Troubleshooting

### **Common Issues**

**1. Migration Already Applied**
```bash
# Error: Migration already exists
# Solution: Use idempotent migrations
node scripts/migrate.js migrate
```

**2. Database Connection Failed**
```bash
# Error: Connection timeout
# Solution: Check health checks and retry logic
# The system will retry 3 times with 1-second delays
```

**3. Migration Checksum Mismatch**
```bash
# Error: Checksum validation failed
# Solution: Run validation to identify corrupted migrations
node scripts/migrate.js validate
```

### **Debug Commands**

```bash
# Check database connection
node scripts/migrate.js status

# Validate all migrations
node scripts/migrate.js validate

# Reset database for clean state
node scripts/migrate.js reset

# Check pool statistics
node -e "console.log(require('./config/database').getPoolStats())"
```

## 🔄 Future Enhancements

### **Planned Features**

1. **Migration Rollback**: Ability to undo migrations
2. **Migration Dependencies**: Handle migration dependencies
3. **Parallel Migrations**: Support for concurrent migrations
4. **Migration Testing**: Test migrations before applying
5. **Backup Integration**: Automatic backups before migrations

### **Production Considerations**

1. **Zero-Downtime Migrations**: Blue-green deployment support
2. **Migration Scheduling**: Off-peak migration execution
3. **Rollback Procedures**: Automated rollback on failure
4. **Performance Impact**: Monitor migration performance
5. **Data Validation**: Verify data integrity after migrations

## 📚 Resources

### **Documentation**
- [GitHub Actions PostgreSQL Service](https://docs.github.com/en/actions/using-containerized-services/creating-postgresql-service-containers)
- [Node.js pg Documentation](https://node-postgres.com/)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/)

### **Tools**
- [pg_isready](https://www.postgresql.org/docs/current/app-pg-isready.html)
- [PostgreSQL Health Checks](https://docs.github.com/en/actions/using-containerized-services/creating-postgresql-service-containers#health-checks)

---

**Last Updated**: 2024-01-15  
**Version**: 2.0.0  
**Status**: ✅ **Implemented** 