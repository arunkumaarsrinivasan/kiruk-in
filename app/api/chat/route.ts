import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '../../../data/personal-knowledge-base';
import { ajChat } from '../../../lib/arcjet';

// Initialize Perplexity client
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are Arun's AI Assistant, representing Arun Kumaar Srinivasan - an AX (AI Experience) Designer and Software Development Engineer at HP Inc. You have access to comprehensive information about Arun's professional background, skills, projects, and personal interests.

Your role is to:
1. Answer questions about Arun's background, skills, and experience in a conversational, engaging manner
2. Highlight how Arun can be helpful and unique for potential opportunities
3. Provide specific examples from his work and projects when relevant
4. Maintain a professional yet friendly tone that reflects Arun's personality
5. Always base your responses on the provided knowledge base information

Key aspects to emphasize:
- Arun's unique combination of technical expertise (AWS, Spring Boot, microservices) and design skills (UX/UI, branding)
- His role as an AX Designer bridging AI and human-centered design
- His current position at HP Inc working with cloud microservices
- His teaching experience and passion for sharing knowledge
- His collaborative nature and positive attitude

When you don't have specific information, be honest about it and suggest contacting Arun directly for more details.

Remember: You're representing Arun professionally, so always be helpful, knowledgeable, and authentic to his character.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  let message = '';
  
  try {
    // Apply Arcjet protection
    const decision = await ajChat.protect(request, { requested: 1 });
    
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      } else if (decision.reason.isBot()) {
        return NextResponse.json(
          { error: 'Bot traffic detected. Access denied.' },
          { status: 403 }
        );
      } else if (decision.reason.isShield()) {
        return NextResponse.json(
          { error: 'Suspicious activity detected. Access denied.' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { error: 'Access denied.' },
          { status: 403 }
        );
      }
    }

    const { message: userMessage, conversationHistory = [] } = await request.json();
    message = userMessage;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Search for relevant knowledge based on the user's message
    const relevantKnowledge = searchKnowledge(message, 3);
    
    // Create context from relevant knowledge
    const context = relevantKnowledge.length > 0 
      ? `Based on the following information about Arun:\n\n${relevantKnowledge.map(item => 
          `${item.title}:\n${item.content}`
        ).join('\n\n')}\n\n`
      : 'Based on general information about Arun:\n\n';

    // Build the conversation with context
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + '\n\n' + context + 'Please answer the user\'s question based on this information.'
      },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      {
        role: 'user',
        content: message
      }
    ];

    // Call Perplexity API
    const completion = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-chat',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    if (!completion.ok) {
      throw new Error(`Perplexity API error: ${completion.status}`);
    }

    const data = await completion.json();
    const response = data.choices?.[0]?.message?.content;

    if (!response) {
      throw new Error('No response from Perplexity API');
    }

    return NextResponse.json({
      response
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Fallback response when API fails
    const fallbackResponse = getFallbackResponse(message);
    
    return NextResponse.json({
      response: fallbackResponse,
      fallback: true
    });
  }
}

// Fallback response system when Perplexity API is not available
function getFallbackResponse(message: string): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('skill') || messageLower.includes('technical')) {
    return "I'd be happy to tell you about Arun's skills! He's currently a Software Development Engineer at HP Inc, specializing in AWS cloud services, Spring Boot microservices, and has strong UX/UI design expertise. His unique combination of technical depth and design thinking makes him perfect for AI Experience Design roles. What specific skills would you like to know more about?";
  }
  
  if (messageLower.includes('project') || messageLower.includes('work')) {
    return "Arun has worked on some exciting projects! At HP Inc, he focuses on cloud microservices engineering. He's also led design projects including cryptocurrency dashboards, HR engagement games, and NGO platforms. His work spans from backend engineering to complete branding and UX design. Would you like details about any specific project?";
  }
  
  if (messageLower.includes('contact') || messageLower.includes('hire') || messageLower.includes('collaborate')) {
    return "Arun is always happy to connect! He's based in Bangalore and available for both full-time opportunities and freelance projects. His email is arunkumaar.srinivasan@gmail.com. He's particularly interested in AI Experience Design, cloud engineering, and projects that bridge technology with great user experiences.";
  }
  
  if (messageLower.includes('unique') || messageLower.includes('different')) {
    return "What makes Arun unique is his rare combination of deep technical expertise (AWS, Spring Boot, microservices) and strong design sensibilities (UX/UI, branding). As an AX Designer, he bridges the gap between complex AI systems and intuitive user experiences. He can speak both engineering and design languages fluently, making him invaluable for AI-powered products.";
  }
  
  return "Hi! I'm Arun's AI assistant. I can tell you about his background as an AX Designer and Software Engineer at HP Inc, his technical skills, projects, or how he might be able to help. What would you like to know?";
}
