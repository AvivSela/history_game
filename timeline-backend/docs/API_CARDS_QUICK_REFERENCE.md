# Cards CRUD API - Quick Reference

## Base URL
```
http://localhost:5000/api
```

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/cards` | Create a single card |
| `GET` | `/admin/cards` | Get all cards (with filters) |
| `GET` | `/admin/cards/:id` | Get a specific card |
| `PUT` | `/admin/cards/:id` | Update a card |
| `DELETE` | `/admin/cards/:id` | Delete a card |
| `POST` | `/admin/cards/bulk` | Create multiple cards |

## Quick cURL Examples

### Create Card
```bash
curl -X POST http://localhost:3001/api/admin/cards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Event Title",
    "description": "Event description",
    "dateOccurred": "1900-01-01",
    "category": "History",
    "difficulty": 2
  }'
```

### Get All Cards
```bash
curl -X GET http://localhost:3001/api/admin/cards
```

### Get Cards with Filters
```bash
curl -X GET "http://localhost:3001/api/admin/cards?category=History&difficulty=2&limit=10"
```

### Get Single Card
```bash
curl -X GET http://localhost:3001/api/admin/cards/1
```

### Update Card
```bash
curl -X PUT http://localhost:3001/api/admin/cards/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "difficulty": 3
  }'
```

### Delete Card
```bash
curl -X DELETE http://localhost:3001/api/admin/cards/1
```

### Bulk Create Cards
```bash
curl -X POST http://localhost:3001/api/admin/cards/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "cards": [
      {
        "title": "Event 1",
        "dateOccurred": "1900-01-01",
        "category": "History",
        "difficulty": 2
      },
      {
        "title": "Event 2",
        "dateOccurred": "1901-01-01",
        "category": "Technology",
        "difficulty": 3
      }
    ]
  }'
```

## Query Parameters (GET /admin/cards)

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | string | Filter by category | `?category=History` |
| `difficulty` | number | Filter by difficulty (1-5) | `?difficulty=2` |
| `search` | string | Search in title/description | `?search=war` |
| `limit` | number | Cards per page (max 100) | `?limit=20` |
| `offset` | number | Cards to skip | `?offset=40` |
| `sortBy` | string | Sort field | `?sortBy=date_occurred` |
| `sortOrder` | string | Sort direction (ASC/DESC) | `?sortOrder=DESC` |

## Card Categories
- `History`, `Technology`, `Science`, `Space`, `Aviation`
- `Cultural`, `Military`, `Political`, `Disaster`

## Difficulty Levels
- `1` - Very Easy (1 star)
- `2` - Easy (2 stars)
- `3` - Medium (3 stars)
- `4` - Hard (4 stars)
- `5` - Very Hard (5 stars)

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description"
}
```

## HTTP Status Codes
- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## Testing Script
```bash
# Test complete CRUD workflow
# 1. Create
curl -X POST http://localhost:3001/api/admin/cards \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","dateOccurred":"2024-01-15","category":"History","difficulty":2}'

# 2. List
curl -X GET http://localhost:3001/api/admin/cards

# 3. Get specific (replace {id})
curl -X GET http://localhost:3001/api/admin/cards/{id}

# 4. Update (replace {id})
curl -X PUT http://localhost:3001/api/admin/cards/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Test"}'

# 5. Delete (replace {id})
curl -X DELETE http://localhost:3001/api/admin/cards/{id}
```

For detailed documentation, see `API_CARDS_CRUD.md` 