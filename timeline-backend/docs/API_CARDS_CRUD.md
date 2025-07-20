# Timeline Game - Cards CRUD API Documentation

## Overview

This document provides comprehensive API documentation for managing cards (historical events) in the Timeline Game. All endpoints support JSON request/response formats and include proper error handling.

**Base URL**: `http://localhost:5000/api`

## Authentication

Currently, the admin endpoints do not require authentication. In production, you should implement proper authentication (JWT tokens, API keys, etc.).

## Card Data Structure

All card endpoints use the following data structure:

```json
{
  "title": "Event Title",           // Required, max 255 characters
  "description": "Event description", // Optional, text
  "dateOccurred": "1900-01-01",    // Required, YYYY-MM-DD format
  "category": "History",           // Required, from predefined list
  "difficulty": 2                  // Required, integer 1-5
}
```

### Available Categories
- `History` - Historical events
- `Technology` - Technological advancements
- `Science` - Scientific discoveries
- `Space` - Space exploration
- `Aviation` - Aviation milestones
- `Cultural` - Cultural events
- `Military` - Military conflicts
- `Political` - Political events
- `Disaster` - Natural and man-made disasters

### Difficulty Levels
- `1` - Very Easy (1 star)
- `2` - Easy (2 stars)
- `3` - Medium (3 stars)
- `4` - Hard (4 stars)
- `5` - Very Hard (5 stars)

---

## 1. Create Card

### Endpoint
```
POST /api/admin/cards
```

### Description
Creates a new historical event card in the database.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "title": "World War II ends",
  "description": "Japan formally surrendered aboard the USS Missouri in Tokyo Bay",
  "dateOccurred": "1945-09-02",
  "category": "History",
  "difficulty": 1
}
```

### cURL Example
```bash
curl -X POST http://localhost:3001/api/admin/cards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "World War II ends",
    "description": "Japan formally surrendered aboard the USS Missouri in Tokyo Bay",
    "dateOccurred": "1945-09-02",
    "category": "History",
    "difficulty": 2
  }'
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Card created successfully",
  "data": {
    "id": 15,
    "title": "World War II ends",
    "description": "Japan formally surrendered aboard the USS Missouri in Tokyo Bay",
    "dateOccurred": "1945-09-02",
    "category": "History",
    "difficulty": 2,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "error": "Missing required fields: title, dateOccurred, category, difficulty"
}
```

#### 400 Bad Request - Invalid Difficulty
```json
{
  "success": false,
  "error": "Difficulty must be between 1 and 5"
}
```

#### 400 Bad Request - Invalid Date
```json
{
  "success": false,
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

#### 409 Conflict - Duplicate Card
```json
{
  "success": false,
  "error": "Card with this title and date already exists"
}
```

---

## 2. Get All Cards

### Endpoint
```
GET /api/admin/cards
```

### Description
Retrieves all cards with optional filtering, sorting, and pagination.

### Query Parameters
- `category` (optional) - Filter by category
- `difficulty` (optional) - Filter by difficulty level (1-5)
- `search` (optional) - Search in title and description
- `limit` (optional) - Number of cards per page (default: 50, max: 100)
- `offset` (optional) - Number of cards to skip (default: 0)
- `sortBy` (optional) - Sort field: `id`, `title`, `date_occurred`, `category`, `difficulty`, `created_at`
- `sortOrder` (optional) - Sort direction: `ASC` or `DESC` (default: `ASC`)

### cURL Examples

#### Get All Cards
```bash
curl -X GET http://localhost:3001/api/admin/cards
```

#### Get Cards with Pagination
```bash
curl -X GET "http://localhost:3001/api/admin/cards?limit=10&offset=0"
```

#### Filter by Category
```bash
curl -X GET "http://localhost:3001/api/admin/cards?category=History"
```

#### Filter by Difficulty
```bash
curl -X GET "http://localhost:3001/api/admin/cards?difficulty=2"
```

#### Search Cards
```bash
curl -X GET "http://localhost:3001/api/admin/cards?search=war"
```

#### Combined Filters
```bash
curl -X GET "http://localhost:3001/api/admin/cards?category=History&difficulty=2&limit=5&sortBy=date_occurred&sortOrder=DESC"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": 1,
        "title": "World War II ends",
        "description": "Japan formally surrendered aboard the USS Missouri in Tokyo Bay",
        "dateOccurred": "1945-09-02",
        "category": "History",
        "difficulty": 1,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## 3. Get Single Card

### Endpoint
```
GET /api/admin/cards/:id
```

### Description
Retrieves a specific card by its ID.

### Path Parameters
- `id` - Card ID (integer)

### cURL Example
```bash
curl -X GET http://localhost:3001/api/admin/cards/1
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "World War II ends",
    "description": "Japan formally surrendered aboard the USS Missouri in Tokyo Bay",
    "dateOccurred": "1945-09-02",
    "category": "History",
    "difficulty": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (404 Not Found)
```json
{
  "success": false,
  "error": "Card not found"
}
```

---

## 4. Update Card

### Endpoint
```
PUT /api/admin/cards/:id
```

### Description
Updates an existing card. Only the fields you want to update need to be included in the request body.

### Path Parameters
- `id` - Card ID (integer)

### Request Headers
```
Content-Type: application/json
```

### Request Body (Partial Update)
```json
{
  "title": "Updated Event Title",
  "difficulty": 3
}
```

### cURL Examples

#### Update Single Field
```bash
curl -X PUT http://localhost:3001/api/admin/cards/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Event Title"
  }'
```

#### Update Multiple Fields
```bash
curl -X PUT http://localhost:3001/api/admin/cards/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Event Title",
    "description": "Updated description",
    "difficulty": 3
  }'
```

#### Update All Fields
```bash
curl -X PUT http://localhost:3001/api/admin/cards/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Completely New Title",
    "description": "New description",
    "dateOccurred": "1945-09-03",
    "category": "Military",
    "difficulty": 4
  }'
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Card updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Event Title",
    "description": "Updated description",
    "dateOccurred": "1945-09-02",
    "category": "History",
    "difficulty": 3,
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid ID
```json
{
  "success": false,
  "error": "Invalid card ID"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Card not found"
}
```

#### 400 Bad Request - No Fields to Update
```json
{
  "success": false,
  "error": "No fields to update"
}
```

---

## 5. Delete Card

### Endpoint
```
DELETE /api/admin/cards/:id
```

### Description
Deletes a card from the database. This operation is permanent and cannot be undone.

### Path Parameters
- `id` - Card ID (integer)

### cURL Example
```bash
curl -X DELETE http://localhost:3001/api/admin/cards/1
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

### Error Responses

#### 400 Bad Request - Invalid ID
```json
{
  "success": false,
  "error": "Invalid card ID"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Card not found"
}
```

---

## 6. Bulk Create Cards

### Endpoint
```
POST /api/admin/cards/bulk
```

### Description
Creates multiple cards at once. Useful for importing large datasets.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "cards": [
    {
      "title": "First Event",
      "description": "Description of first event",
      "dateOccurred": "1900-01-01",
      "category": "History",
      "difficulty": 2
    },
    {
      "title": "Second Event",
      "description": "Description of second event",
      "dateOccurred": "1901-01-01",
      "category": "Technology",
      "difficulty": 3
    }
  ]
}
```

### cURL Example
```bash
curl -X POST http://localhost:3001/api/admin/cards/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "cards": [
      {
        "title": "First Event",
        "description": "Description of first event",
        "dateOccurred": "1900-01-01",
        "category": "History",
        "difficulty": 2
      },
      {
        "title": "Second Event",
        "description": "Description of second event",
        "dateOccurred": "1901-01-01",
        "category": "Technology",
        "difficulty": 3
      }
    ]
  }'
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Bulk card creation completed: 2 created, 0 failed",
  "data": {
    "created": [
      {
        "index": 0,
        "id": 16,
        "title": "First Event"
      },
      {
        "index": 1,
        "id": 17,
        "title": "Second Event"
      }
    ],
    "errors": []
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Cards array is required and must not be empty"
}
```

---

## Error Handling

All endpoints return consistent error responses with the following structure:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing rate limiting to prevent abuse.

---

## Testing Examples

### Complete CRUD Workflow

```bash
# 1. Create a card
curl -X POST http://localhost:3001/api/admin/cards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "A test event for API documentation",
    "dateOccurred": "2024-01-15",
    "category": "Technology",
    "difficulty": 2
  }'

# 2. Get all cards
curl -X GET http://localhost:3001/api/admin/cards

# 3. Get the specific card (replace {id} with the actual ID)
curl -X GET http://localhost:3001/api/admin/cards/{id}

# 4. Update the card
curl -X PUT http://localhost:3001/api/admin/cards/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Event",
    "difficulty": 3
  }'

# 5. Delete the card
curl -X DELETE http://localhost:3001/api/admin/cards/{id}
```

### Bulk Import Example

```bash
# Create a JSON file with cards
cat > cards.json << 'EOF'
{
  "cards": [
    {
      "title": "Bulk Test Event 1",
      "description": "First bulk test event",
      "dateOccurred": "2024-01-15",
      "category": "History",
      "difficulty": 1
    },
    {
      "title": "Bulk Test Event 2",
      "description": "Second bulk test event",
      "dateOccurred": "2024-01-16",
      "category": "Science",
      "difficulty": 2
    }
  ]
}
EOF

# Import the cards
curl -X POST http://localhost:3001/api/admin/cards/bulk \
  -H "Content-Type: application/json" \
  -d @cards.json
```

---

## Notes

1. **Date Format**: All dates must be in `YYYY-MM-DD` format
2. **Validation**: All endpoints include comprehensive validation
3. **Error Messages**: Error messages are user-friendly and descriptive
4. **Pagination**: The GET endpoint supports pagination for large datasets
5. **Search**: Full-text search is available on title and description fields
6. **Sorting**: Results can be sorted by any card field
7. **Bulk Operations**: Use bulk create for importing large datasets efficiently

For additional support or questions, please refer to the main API documentation or contact the development team. 