# Prisma Migration Workflow

## Overview

This document outlines the migration workflow for the Timeline Game backend using Prisma ORM. The workflow is designed to work alongside the existing SQL-based system during the hybrid migration phase.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Prisma CLI installed (`yarn add -D prisma`)
- Prisma Client installed (`yarn add @prisma/client`)

## Environment Setup

### Database URLs

Configure the following environment variables:

```bash
# Development
DATABASE_URL="postgresql://postgres:password@localhost:5433/timeline_game"

# Test
TEST_DATABASE_URL="postgresql://postgres:password@localhost:5433/timeline_game_test"

# Production
DATABASE_URL="postgresql://user:password@host:5432/timeline_game?sslmode=require"
```

### Feature Flags

Use environment variables to control Prisma usage:

```bash
# Enable/disable Prisma for different operations
USE_PRISMA_CARDS=true
USE_PRISMA_SESSIONS=true
USE_PRISMA_MOVES=true
USE_PRISMA_STATISTICS=hybrid
```

## Migration Commands

### Schema Management

```bash
# Generate Prisma client from schema
yarn db:generate

# Pull schema from existing database
yarn db:pull

# Push schema changes to database (development only)
yarn db:push
```

### Development Tools

```bash
# Open Prisma Studio for database management
yarn studio

# Seed database with test data
npx prisma db seed
```

### Migration Workflow

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Development Workflow

### 1. Schema Changes

1. Modify `prisma/schema.prisma`
2. Generate client: `yarn db:generate`
3. Test changes locally
4. Create migration: `npx prisma migrate dev --name description`

### 2. Code Changes

1. Update service layer with Prisma operations
2. Add feature flags for gradual rollout
3. Maintain backward compatibility with existing query builders
4. Test both Prisma and query builder paths

### 3. Testing

1. Run existing tests to ensure no regressions
2. Add Prisma-specific tests
3. Test feature flag combinations
4. Validate data consistency

## Hybrid Approach Guidelines

### When to Use Prisma

- Simple CRUD operations (create, read, update, delete)
- Basic queries with standard filtering
- Type-safe operations
- Development and testing

### When to Use Query Builders

- Complex analytics and aggregations
- Performance-critical operations
- Custom SQL requirements
- Existing proven queries

### Feature Flag Pattern

```javascript
const usePrisma = process.env.USE_PRISMA_CARDS === 'true';

if (usePrisma) {
  // Prisma operation
  const card = await prisma.cards.findUnique({ where: { id } });
} else {
  // Existing query builder
  const card = await cardQueryBuilder.selectById(id);
}
```

## Testing Strategy

### Unit Tests

- Test Prisma operations in isolation
- Mock Prisma client for unit tests
- Test error handling and edge cases

### Integration Tests

- Test complete workflows with Prisma
- Validate data consistency
- Test feature flag combinations

### Performance Tests

- Compare Prisma vs query builder performance
- Monitor query execution times
- Test connection pooling

## Troubleshooting

### Common Issues

1. **Prisma Client Connection Issues**
   - Regenerate client: `npx prisma generate`
   - Check database connection
   - Verify environment variables

2. **Schema Sync Issues**
   - Pull latest schema: `yarn db:pull`
   - Check for schema conflicts
   - Validate database state

3. **Migration Conflicts**
   - Review migration history
   - Check for manual schema changes
   - Reset and recreate if needed

### Debug Commands

```bash
# Check Prisma client status
npx prisma --version

# Validate schema
npx prisma validate

# Check database connection
npx prisma db pull

# View migration status
npx prisma migrate status
```

## Best Practices

### Code Organization

1. **Service Layer**: Keep Prisma operations in service classes
2. **Feature Flags**: Use environment variables for gradual rollout
3. **Error Handling**: Implement comprehensive error handling
4. **Logging**: Add detailed logging for debugging

### Performance

1. **Connection Pooling**: Use Prisma's built-in connection pooling
2. **Query Optimization**: Use `select` and `include` appropriately
3. **Caching**: Implement caching where beneficial
4. **Monitoring**: Monitor query performance

### Security

1. **Input Validation**: Validate all inputs before database operations
2. **SQL Injection**: Prisma handles this automatically
3. **Access Control**: Implement proper access controls
4. **Audit Logging**: Log sensitive operations

## Rollback Procedures

### Immediate Rollback

```bash
# Disable Prisma feature flags
export USE_PRISMA_CARDS=false
export USE_PRISMA_SESSIONS=false
export USE_PRISMA_MOVES=false
export USE_PRISMA_STATISTICS=false

# Restart application
yarn restart
```

### Schema Rollback

```bash
# Revert to previous migration
npx prisma migrate reset

# Or manually revert schema changes
# Update prisma/schema.prisma and regenerate
yarn db:generate
```

## Monitoring and Maintenance

### Health Checks

- Monitor Prisma client connection status
- Check query performance metrics
- Validate data consistency
- Monitor error rates

### Regular Maintenance

- Update Prisma dependencies regularly
- Review and optimize queries
- Clean up unused migrations
- Update documentation

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization) 