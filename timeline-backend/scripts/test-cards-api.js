#!/usr/bin/env node

/**
 * Test Cards API Script
 * 
 * This script tests all the card CRUD endpoints to ensure they work correctly
 * Usage: node scripts/test-cards-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_URL = `${BASE_URL}/admin/cards`;

// Test data
const testCard = {
  title: 'API Test Event',
  description: 'This is a test event created by the API test script',
  dateOccurred: '2024-01-15',
  category: 'Technology',
  difficulty: 2
};

const updatedCard = {
  title: 'Updated API Test Event',
  description: 'This event has been updated by the API test script',
  difficulty: 3
};

/**
 * Make API request with error handling
 */
async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Test creating a card
 */
async function testCreateCard() {
  console.log('\n🧪 Testing CREATE card...');
  
  const result = await makeRequest('POST', ADMIN_URL, testCard);
  
  if (result.success) {
    console.log('✅ Card created successfully');
    console.log(`   ID: ${result.data.data.id}`);
    console.log(`   Title: ${result.data.data.title}`);
    return result.data.data.id;
  } else {
    console.log('❌ Failed to create card');
    console.log(`   Error: ${result.error.error || result.error}`);
    return null;
  }
}

/**
 * Test getting all cards
 */
async function testGetAllCards() {
  console.log('\n🧪 Testing GET all cards...');
  
  const result = await makeRequest('GET', ADMIN_URL);
  
  if (result.success) {
    console.log('✅ Retrieved all cards successfully');
    console.log(`   Total cards: ${result.data.data.pagination.total}`);
    console.log(`   Cards in response: ${result.data.data.cards.length}`);
    return result.data.data.cards;
  } else {
    console.log('❌ Failed to get cards');
    console.log(`   Error: ${result.error.error || result.error}`);
    return [];
  }
}

/**
 * Test getting a specific card
 */
async function testGetCard(cardId) {
  console.log(`\n🧪 Testing GET card ${cardId}...`);
  
  const result = await makeRequest('GET', `${ADMIN_URL}/${cardId}`);
  
  if (result.success) {
    console.log('✅ Retrieved card successfully');
    console.log(`   Title: ${result.data.data.title}`);
    console.log(`   Category: ${result.data.data.category}`);
    return result.data.data;
  } else {
    console.log('❌ Failed to get card');
    console.log(`   Error: ${result.error.error || result.error}`);
    return null;
  }
}

/**
 * Test updating a card
 */
async function testUpdateCard(cardId) {
  console.log(`\n🧪 Testing UPDATE card ${cardId}...`);
  
  const result = await makeRequest('PUT', `${ADMIN_URL}/${cardId}`, updatedCard);
  
  if (result.success) {
    console.log('✅ Card updated successfully');
    console.log(`   New title: ${result.data.data.title}`);
    console.log(`   New difficulty: ${result.data.data.difficulty}`);
    return result.data.data;
  } else {
    console.log('❌ Failed to update card');
    console.log(`   Error: ${result.error.error || result.error}`);
    return null;
  }
}

/**
 * Test filtering cards
 */
async function testFilterCards() {
  console.log('\n🧪 Testing card filtering...');
  
  const filters = [
    '?category=Technology',
    '?difficulty=2',
    '?search=test',
    '?limit=5',
    '?sortBy=date_occurred&sortOrder=DESC'
  ];
  
  for (const filter of filters) {
    console.log(`   Testing filter: ${filter}`);
    const result = await makeRequest('GET', `${ADMIN_URL}${filter}`);
    
    if (result.success) {
      console.log(`   ✅ Filter ${filter} works`);
    } else {
      console.log(`   ❌ Filter ${filter} failed: ${result.error.error || result.error}`);
    }
  }
}

/**
 * Test bulk create cards
 */
async function testBulkCreate() {
  console.log('\n🧪 Testing bulk create cards...');
  
  const bulkData = {
    cards: [
      {
        title: 'Bulk Test Event 1',
        description: 'First bulk test event',
        dateOccurred: '2024-01-16',
        category: 'History',
        difficulty: 1
      },
      {
        title: 'Bulk Test Event 2',
        description: 'Second bulk test event',
        dateOccurred: '2024-01-17',
        category: 'Science',
        difficulty: 2
      }
    ]
  };
  
  const result = await makeRequest('POST', `${ADMIN_URL}/bulk`, bulkData);
  
  if (result.success) {
    console.log('✅ Bulk create successful');
    console.log(`   Created: ${result.data.data.created.length} cards`);
    console.log(`   Errors: ${result.data.data.errors.length}`);
    return result.data.data.created.map(card => card.id);
  } else {
    console.log('❌ Bulk create failed');
    console.log(`   Error: ${result.error.error || result.error}`);
    return [];
  }
}

/**
 * Test deleting a card
 */
async function testDeleteCard(cardId) {
  console.log(`\n🧪 Testing DELETE card ${cardId}...`);
  
  const result = await makeRequest('DELETE', `${ADMIN_URL}/${cardId}`);
  
  if (result.success) {
    console.log('✅ Card deleted successfully');
    return true;
  } else {
    console.log('❌ Failed to delete card');
    console.log(`   Error: ${result.error.error || result.error}`);
    return false;
  }
}

/**
 * Test error cases
 */
async function testErrorCases() {
  console.log('\n🧪 Testing error cases...');
  
  const errorTests = [
    {
      name: 'Create card with missing fields',
      method: 'POST',
      url: ADMIN_URL,
      data: { title: 'Incomplete Card' }
    },
    {
      name: 'Create card with invalid difficulty',
      method: 'POST',
      url: ADMIN_URL,
      data: { ...testCard, difficulty: 10 }
    },
    {
      name: 'Get non-existent card',
      method: 'GET',
      url: `${ADMIN_URL}/99999`
    },
    {
      name: 'Update non-existent card',
      method: 'PUT',
      url: `${ADMIN_URL}/99999`,
      data: { title: 'Updated' }
    },
    {
      name: 'Delete non-existent card',
      method: 'DELETE',
      url: `${ADMIN_URL}/99999`
    }
  ];
  
  for (const test of errorTests) {
    console.log(`   Testing: ${test.name}`);
    const result = await makeRequest(test.method, test.url, test.data);
    
    if (!result.success && result.status >= 400 && result.status < 500) {
      console.log(`   ✅ Expected error: ${result.error.error || result.error}`);
    } else {
      console.log(`   ❌ Unexpected result: ${result.success ? 'Success' : 'Error'}`);
    }
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Cards API Tests...');
  console.log(`Base URL: ${BASE_URL}`);
  
  try {
    // Test server connection
    console.log('\n🔍 Testing server connection...');
    const healthCheck = await makeRequest('GET', `${BASE_URL}/health`);
    if (healthCheck.success) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server is not responding');
      console.log('   Make sure the server is running on http://localhost:3001');
      process.exit(1);
    }
    
    // Run CRUD tests
    const cardId = await testCreateCard();
    
    if (cardId) {
      await testGetAllCards();
      await testGetCard(cardId);
      await testUpdateCard(cardId);
      await testFilterCards();
      
      // Test bulk create
      const bulkIds = await testBulkCreate();
      
      // Test error cases
      await testErrorCases();
      
      // Clean up - delete test cards
      console.log('\n🧹 Cleaning up test data...');
      await testDeleteCard(cardId);
      
      for (const id of bulkIds) {
        await testDeleteCard(id);
      }
      
      console.log('✅ Cleanup completed');
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\nTest interrupted. Exiting...');
  process.exit(0);
});

// Run the tests
if (require.main === module) {
  runTests().catch((error) => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  makeRequest,
  testCreateCard,
  testGetAllCards,
  testGetCard,
  testUpdateCard,
  testDeleteCard,
  testBulkCreate,
  testFilterCards,
  testErrorCases
}; 