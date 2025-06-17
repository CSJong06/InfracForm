import { NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.API_KEY;
const PROJECT_ID = process.env.PROJECT_ID;
const API_BASE_URL = "https://www.playlab.ai/api/v1";

export async function POST(request) {
  try {
    // Debug logging
    console.log('API Configuration:', {
      hasApiKey: !!API_KEY,
      apiKeyLength: API_KEY?.length,
      hasProjectId: !!PROJECT_ID,
      projectIdLength: PROJECT_ID?.length,
      apiBaseUrl: API_BASE_URL
    });

    const { message } = await request.json();

    // Create a new conversation
    const conversationResponse = await axios.post(
      `${API_BASE_URL}/projects/${PROJECT_ID}/conversations`,
      {},
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const conversationId = conversationResponse.data.conversation.id;

    // Send the message and get the response
    const response = await axios.post(
      `${API_BASE_URL}/projects/${PROJECT_ID}/conversations/${conversationId}/messages`,
      { input: { message } },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    // Process the streaming response
    let fullContent = "";
    for await (const chunk of response.data) {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        if (line.startsWith("data:")) {
          try {
            const data = JSON.parse(line.slice(5));
            if (data.delta) {
              fullContent += data.delta;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }

    return NextResponse.json({ response: fullContent });
  } catch (error) {
    console.error('Error processing AI request:', error);
    // Add more detailed error logging
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      console.error('Request headers:', {
        Authorization: `Bearer ${API_KEY?.substring(0, 10)}...`,
        "Content-Type": "application/json"
      });
    }
    return NextResponse.json(
      { error: 'Failed to process AI request', details: error.message },
      { status: 500 }
    );
  }
} 