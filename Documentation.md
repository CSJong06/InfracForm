### Making a Request

To make a request to the Playlab API, you'll need to use your API key for authentication. Use your API key and project ID to create a new conversation. Here's an example using `Node.js` and the `axios` library.

const axios = require("axios");

const API_KEY = "your_api_key_here";
const PROJECT_ID = "your_project_id_here";
const API_BASE_URL = "https://www.playlab.ai/api/v1";

async function createConversation() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects/${PROJECT_ID}/conversations`,
      {},
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.conversation.id;
  } catch (error) {
    console.error("Error creating conversation:", error.response?.data || error.message);
    throw error;
  }
}

// Usage
createConversation().then((conversationId) => {
  console.log("New conversation created with ID:", conversationId);
});

Once you have a conversation ID, you can send messages and receive streaming responses. The Playlab API uses server-sent events (SSE) for streaming responses, which allows for real-time display of AI responses. Here's how to handle this with axios:

async function sendMessage(conversationId, message) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects/${PROJECT_ID}/conversations/${conversationId}/messages`,
      { input: { message: message } },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    return new Promise((resolve, reject) => {
      let fullContent = "";
      response.data.on("data", (chunk) => {
        const lines = chunk.toString().split("\n");
        lines.forEach((line) => {
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.delta) {
                fullContent += data.delta;
                process.stdout.write(data.delta); // This will print the response in real-time
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        });
      });

      response.data.on("end", () => {
        console.log("\n"); // Add a newline after the streamed response
        resolve(fullContent);
      });

      response.data.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
    throw error;
  }
}

// Usage
const conversationId = "your_conversation_id_here";
sendMessage(conversationId, "Hello, AI!").then((response) => {
  console.log("Full AI response:", response);
});

### Complete Example

Here's a complete example that creates a conversation and allows for an interactive chat session:

### Setup

Create a new directory for your project and navigate to it:
mkdir playlab-chat-example
cd playlab-chat-example

Initialize a new Node.js project:

```bash
npm init -y
```

Install the required packages:

```bash
npm install axios readline
```

### Requirements

Before running this example, ensure you have:

1. Node.js installed (version 14.0.0 or later recommended)
2. The following npm packages installed in your project:
    - axios
    - readline

- readline

### Code

Create a new file named `playlab-chat.js` in your project directory and add the following code:

const axios = require("axios");
const readline = require("readline");

const API_KEY = "your_api_key_here";
const PROJECT_ID = "your_project_id_here";
const API_BASE_URL = "https://www.playlab.ai/api/v1";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// [Include the createConversation and sendMessage functions from above here]

async function startChat() {
  console.log("Creating a new conversation...");
  const conversationId = await createConversation();
  console.log(`Conversation created with ID: ${conversationId}`);
  console.log(
    "You can start chatting now. Type your messages and press Enter to send."
  );
  console.log('Type "exit" to end the conversation.\n');

  rl.setPrompt("You: ");
  rl.prompt();

  rl.on("line", async (input) => {
    if (input.toLowerCase() === "exit") {
      console.log("Ending conversation. Goodbye!");
      rl.close();
      process.exit(0);
    }

    console.log("\nAI: ");
    await sendMessage(conversationId, input);
    console.log("\n");

    rl.prompt();
  });
}

startChat();

### Usage

To use this example:

1. Replace `'your_api_key_here'` and `'your_project_id_here'` with your actual API key and project ID in the `playlab-chat.js` file.
2. Open a terminal, navigate to your project directory, and run the script:

```bash
node playlab-chat.js
```

This will start an interactive chat session where you can send messages to the AI and receive responses in real-time.

# Beta API Documentation

## Create Conversation

```
POST /projects/{PROJECT_ID}/conversations
```

### Headers

- `content-type` (required)

  You can use `application/json` or `application/x-www-form-urlencoded`

- `authorization` (required)

  Expected format `Bearer {API_KEY}`

### Body Parameters

#### For `application/json`

- `instructionVariables` (optional)

  An object containing the instruction variables for the conversation.

  ```json
  {
    "instructionVariables": {
      "variable1": "value1",
      "variable2": "value2"
    }
  }
  ```

#### For `application/x-www-form-urlencoded`

- `instructionVariables` (optional)

  A list of the instruction variables for the conversation.

  ```
  instructionVariables.variable1=value1&
  instructionVariables.variable2=value2
  ```

### Responses

- `200 OK`

  Conversation created successfully.

  Example:

  ```json
  {
    "conversation": {
      "id": "clzilskag0006j77wtm6c5xjy",
      "name": null,
      "provider": "openai",
      "mode lName": "gpt-40-2024-05-13",
      "maxTokens": 4000,
      "temperature": 0.7,
      "contextStrategy": "lifo",
      "isImageInputEnabled": false,
      "isImageInputWithPeopleEnabled": false,
      "instructionVariableValues": [],
      "inputTokenCount": 0,
      "outputTokenCount": 0,
      "createdAt": "2024-08-06T15:57:04.1212",
      "updatedAt": "2024-08-06T15:57:04.1212",
      "userId": null,
      "datasetId": "clzh4odv60003tv43qvj6abin",
      "promptId": "clzh4odub0000tv43jdxzrgk5",
      "projectId": "clzcsxmoa001agbo6t95rf01j"
    }
  }
  ```

- `401 Unauthorized`

  Examples:

  ```json
  {
    "error": "Authorization header required."
  }
  ```

  ```json
  {
    "error": "Bearer token required."
  }
  ```

  ```json
  {
    "error": "Invalid API key."
  }
  ```

  ```json
  {
    "error": "Expired API key."
  }
  ```

- `400 Bad Request`

  Example:

  ```json
  {
    "error": {
      "issues": [
        {
          "code": "invalid_type",
          "expected": "object",
          "received": "string",
          "path": ["instructionVariables"],
          "message": "Expected object, received string"
        }
      ]
    }
  }
  ```

## Send Message in a Conversation

```
POST /projects/{PROJECT_ID}/conversations/{CONVERSATION_ID}/messages
```

### Headers

- `content-type` (required)

  You can use `application/json`, `application/x-www-form-urlencoded` or `multipart/form-data`.

- `authorization` (required)

  Expected format `Bearer {API_KEY}`

### Body Parameters

#### For `application/json`

- `input.message` (required)

  Message to send in the conversation.

  Example:

  ```json
  {
    "input": {
      "message": "Message"
    }
  }
  ```

#### For `application/x-www-form-urlencoded`

- `input.message` (required)

  Message to send in the conversation.

  Example:

  ```
  input.message=Message
  ```

#### For `multipart/form-data`

- `input.message` (optional)

  Message to send in the conversation.

- `file` (required)

  File to send in the conversation.

- `originalFileName` (required)

  Original name of the file.

  Curl example:

  ```
  curl -X POST http://localhost:3000/api/v1/projects/clzcsxmoa001agbo6t95rf01j/conversations/clziksy1g000fzrwovo7cxdle/messages \
    -H "Authorization: Bearer sk-pl-v1-org.OHGv-TvhEICz3_ZXNJByH5HLs5SDTdVqsDOLGyIoQmQ" \
    -F "input.message=Some message" \
    -F "originalFileName=example.txt" \
    -F "file=@/Users/{USER_NAME}/Desktop/example.txt;type=text/plain" \
    --verbose
  ```

### Responses

- `200 OK`

  Message sent successfully.

  Streams the assistant response with the `content-type` header set to `text/plain`.

- `401 Unauthorized`

  Example:

  ```json
  {
    "error": "Invalid API key."
  }
  ```

- `400 Bad Request`

## List Messages in a Conversation

```
GET /projects/{PROJECT_ID}/conversations/{CONVERSATION_ID}/messages
```

### Headers

- `authorization` (required)

  Expected format `Bearer {API_KEY}`

### Query Parameters

None

### Responses

- `200 OK`

  List of messages.

  Example:

  ```json
  {
    "messages": [
      {
        "id": "clziktmt8000jzrwohd0nsyo0",
        "content": "Message A",
        "originalContent": null,
        "tokenCount": 2,
        "source": "provider",
        "rating": null,
        "createdAt": "2024-08-06T15:29:53.8522",
        "updatedAt": "2024-08-06T15:29:57.066Z",
        "userId": null,
        "conversationId": "clziksy1g000fzrwovo7cxdle",
        "projectId": "clzcsxmoa001agbo6t95rf01j"
      },
      {
        "id": "clziku065000kzrwozheexfap",
        "content": "Message B",
        "originalContent": null,
        "tokenCount": 2,
        "source": "user",
        "rating": null,
        "createdAt": "2024-08-06T15:30:11.1652",
        "updatedAt": "2024-08-06T15:30:11. 165Z",
        "userId": null,
        "conversationId": "clziksy1g000fzrwovo7cxdle",
        "projectId": "clzcsxmoa001agbo6t95rf01j"
      }
    ]
  }
  ```

- `401 Unauthorized`

  Example:

  ```json
  {
    "error": "Invalid API key."
  }
  ```

## Workflow Example

Below is a list of cURL examples for all possible API calls. To get started, first create a new API key through the user interface and make your app public. Make sure to retrieve the app/project ID and the generated API key. Once you have these, you can use the cURL examples provided below.

```sh
# Create a new conversation with application/json
curl -X POST "http://localhost:3000/api/v1/projects/clzn3dowb001gphvsusvd4r69/conversations" \
-H "Authorization: Bearer sk-pl-v1-org.XXXX" \
-H "Content-Type: application/json" \
-d '{}'

# Create a new conversation with x-www-form-urlencoded
curl -X POST "http://localhost:3000/api/v1/projects/clzn3dowb001gphvsusvd4r69/conversations" \
-H "Authorization: Bearer sk-pl-v1-org.XXXX" \
-H "Content-Type: application/x-www-form-urlencoded" \
-d ""

# Send a message in a conversation with application/json
curl -X POST "http://localhost:3000/api/v1/projects/clzn3dowb001gphvsusvd4r69/conversations/clzn4kkhj0007x968gb0fbf1d/messages" \
-H "Authorization: Bearer sk-pl-v1-org.XXXX" \
-H "Content-Type: application/json" \
-d '{"input":{"message":"Message"}}'

# Send a message in a conversation with x-www-form-urlencoded
curl -X POST "http://localhost:3000/api/v1/projects/clzn3dowb001gphvsusvd4r69/conversations/clzn4kkhj0007x968gb0fbf1d/messages" \
-H "Authorization: Bearer sk-pl-v1-org.XXXX" \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "input.message=Message"

# Send a message in a conversation with multipart/form-data with a file
curl -X POST "http://localhost:3000/api/v1/projects/clzn3dowb001gphvsusvd4r69/conversations/clzn4kkhj0007x968gb0fbf1d/messages" \
-H "Authorization: Bearer sk-pl-v1-org.XXXX" \
-H "Content-Type: multipart/form-data" \
-F "input.message=Message" \
-F "file=@/Users/lukaszjagodzinski/Desktop/example.txt" \
-F "originalFileName=example.txt"

# List messages in a conversation
curl -X GET "http://localhost:3000/api/v1/projects/clzn3dowb001gphvsusvd4r69/conversations/clzn4kkhj0007x968gb0fbf1d/messages" \
-H "Authorization: Bearer sk-pl-v1-org.XXXX"
```
