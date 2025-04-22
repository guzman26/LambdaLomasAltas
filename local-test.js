// Simple script to test Lambda handlers directly
// This doesn't go through the Lambda infrastructure but tests the business logic

// Set environment variables
process.env.PALLETS_TABLE = 'Pallets';
process.env.HUEVOS_TABLE = 'Huevos';

// Import the handler functions to test
const { handler } = require('./index');

// Test event for movePallet
const testEvent = {
  httpMethod: "POST",
  path: "/movePallet",
  body: JSON.stringify({
    codigo: "123456789001",
    ubicacion: "BODEGA"
  })
};

// Run the test
async function runTest() {
  try {
    console.log("Testing /movePallet endpoint...");
    console.log("Input:", JSON.stringify(testEvent, null, 2));
    
    const result = await handler(testEvent);
    
    console.log("\nResult:");
    console.log(JSON.stringify(result, null, 2));
    
    console.log("\nTest completed!");
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

runTest(); 