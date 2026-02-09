# Chatbot AI Integration Guide

The chatbot is now ready to be integrated with an AI API. Follow these steps to connect it to your preferred AI service.

## Quick Setup

1. Open `web/src/components/Chatbot.tsx`
2. Find the `getAIResponse()` function
3. Replace `'YOUR_AI_API_ENDPOINT'` with your actual API endpoint
4. Add your API key in the Authorization header

## Popular AI API Options

### Option 1: OpenAI GPT (Recommended)

**Endpoint:** `https://api.openai.com/v1/chat/completions`

**Get API Key:** https://platform.openai.com/api-keys

**Implementation:**
```typescript
const getAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for Velocity car rental service. Help users with questions about rentals, pricing, vehicle availability, and booking process. Be friendly and concise.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return "I'm having trouble connecting right now. Please try again in a moment!";
  }
};
```

**Pricing:** ~$0.002 per 1K tokens (very affordable)

---

### Option 2: Google Gemini (Free Tier Available)

**Endpoint:** `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`

**Get API Key:** https://makersuite.google.com/app/apikey

**Implementation:**
```typescript
const getAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR_GEMINI_API_KEY',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful assistant for Velocity car rental service. User question: ${userMessage}`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return "I'm having trouble connecting right now. Please try again!";
  }
};
```

**Pricing:** Free tier: 60 requests per minute

---

### Option 3: Anthropic Claude

**Endpoint:** `https://api.anthropic.com/v1/messages`

**Get API Key:** https://console.anthropic.com/

**Implementation:**
```typescript
const getAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_ANTHROPIC_API_KEY',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `You are a helpful assistant for Velocity car rental service. ${userMessage}`
        }]
      })
    });

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    return "I'm having trouble connecting right now. Please try again!";
  }
};
```

---

### Option 4: Local/Self-Hosted (Free but requires setup)

**Hugging Face Inference API:**

```typescript
const getAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_HUGGINGFACE_TOKEN',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `You're a car rental assistant. ${userMessage}`,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();
    return data[0].generated_text;
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    return "I'm having trouble connecting right now. Please try again!";
  }
};
```

---

## Security Best Practices

⚠️ **Important:** Never commit API keys directly in your code!

### Use Environment Variables:

1. Create a `.env` file in the `web` folder:
```env
VITE_AI_API_KEY=your_api_key_here
VITE_AI_API_ENDPOINT=your_endpoint_here
```

2. Add `.env` to `.gitignore`

3. Access in your code:
```typescript
const API_KEY = import.meta.env.VITE_AI_API_KEY;
const API_ENDPOINT = import.meta.env.VITE_AI_API_ENDPOINT;
```

### Backend Proxy (Most Secure):

For production, create a backend endpoint that:
1. Receives user messages
2. Calls the AI API with your secret key
3. Returns the response

This keeps your API key secure on the server.

---

## Testing the Chatbot

1. Start your development server: `npm run dev`
2. Click the chat icon at the bottom right
3. Type a message like "What cars do you have available?"
4. The AI should respond with relevant information

---

## Current Implementation

The chatbot currently:
- ✅ Has a working UI with user and bot messages
- ✅ Shows typing indicator while waiting for AI response
- ✅ Auto-scrolls to latest message
- ✅ Handles errors gracefully with fallback messages
- ✅ Disabled input during loading
- ✅ Character limit (1000 chars)
- ✅ Responsive design
- ⏳ Needs AI API configuration (follow steps above)

---

## Troubleshooting

**Error: CORS issues**
- Use a backend proxy or enable CORS on your API
- Some AI providers have CORS restrictions for browser requests

**Error: Rate limit exceeded**
- Implement request throttling
- Consider upgrading your API plan

**Error: API key invalid**
- Check if your API key is correct
- Ensure environment variables are loaded properly
- Verify the API key hasn't expired

---

## Need Help?

- OpenAI Docs: https://platform.openai.com/docs
- Gemini Docs: https://ai.google.dev/docs
- Claude Docs: https://docs.anthropic.com
