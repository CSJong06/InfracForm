import { NextResponse } from 'next/server'; // Import Next.js response handler for API routes
import axios from 'axios'; // Import axios for making HTTP requests to external AI API

const API_KEY = process.env.API_KEY; // Get API key from environment variables for AI service authentication
const PROJECT_ID = process.env.PROJECT_ID; // Get project ID from environment variables for AI service configuration
const API_BASE_URL = "https://www.playlab.ai/api/v1"; // Base URL for the AI service API endpoints

export async function POST(request) { // Handle POST requests for AI message processing
  try {
    const { message } = await request.json(); // Extract message from request body for AI processing

    // Create a new conversation
    const conversationResponse = await axios.post( // Create new conversation session with AI service
      `${API_BASE_URL}/projects/${PROJECT_ID}/conversations`, // Endpoint for creating new conversations
      {}, // Empty body for conversation creation
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`, // Include API key in authorization header
          "Content-Type": "application/json", // Specify JSON content type
        },
      }
    );

    const conversationId = conversationResponse.data.conversation.id; // Extract conversation ID from response for message sending

    // Send the message and get the response
    const response = await axios.post( // Send user message to AI service and get streaming response
      `${API_BASE_URL}/projects/${PROJECT_ID}/conversations/${conversationId}/messages`, // Endpoint for sending messages to conversation
      { input: { message } }, // Send message in the expected input format
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`, // Include API key in authorization header
          "Content-Type": "application/json", // Specify JSON content type
        },
        responseType: "stream", // Request streaming response for real-time data processing
      }
    );

    // Process the streaming response
    let fullContent = ""; // Initialize empty string to accumulate complete AI response
    for await (const chunk of response.data) { // Iterate through streaming response chunks asynchronously
      const lines = chunk.toString().split("\n"); // Convert chunk to string and split by newlines to process each line
      for (const line of lines) { // Process each line in the chunk
        if (line.startsWith("data:")) { // Check if line contains server-sent event data
          try {
            const data = JSON.parse(line.slice(5)); // Parse JSON data after removing "data:" prefix
            if (data.delta) { // Check if response contains delta (incremental content)
              fullContent += data.delta; // Append delta content to accumulate full response
            }
          } catch (e) { // Catch JSON parsing errors gracefully
            // Ignore parsing errors // Continue processing other lines even if one fails to parse
          }
        }
      }
    }

    return NextResponse.json({ response: fullContent }); // Return complete AI response to client
  } catch (error) { // Catch any errors that occur during AI processing
    console.error('Error processing AI request:', error); // Log the main error for debugging
    // Add more detailed error logging
    if (error.response) { // Check if error contains response data from AI service
      console.error('Error response data:', error.response.data); // Log detailed error response data
      console.error('Error response status:', error.response.status); // Log HTTP status code from AI service
      console.error('Error response headers:', error.response.headers); // Log response headers for debugging
      console.error('Request headers:', { // Log request headers for debugging (with partial API key for security)
        Authorization: `Bearer ${API_KEY?.substring(0, 10)}...`, // Show only first 10 characters of API key
        "Content-Type": "application/json" // Show content type header
      });
    }
    return NextResponse.json( // Return error response to client
      { error: 'Failed to process AI request', details: error.message }, // Include error message for debugging
      { status: 500 } // Return 500 Internal Server Error status code
    );
  }
} 