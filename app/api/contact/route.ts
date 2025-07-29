import { NextRequest, NextResponse } from 'next/server';
import { ajForm } from '../../../lib/arcjet';

export async function POST(request: NextRequest) {
  try {
    // Apply Arcjet form protection
    const decision = await ajForm.protect(request);
    
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { 
            error: 'Too many contact form submissions. Please try again later.',
            type: 'rate_limit'
          },
          { status: 429 }
        );
      } else if (decision.reason.isBot()) {
        return NextResponse.json(
          { 
            error: 'Bot traffic detected. Please verify you are human.',
            type: 'bot_detected'
          },
          { status: 403 }
        );
      } else if (decision.reason.isShield()) {
        return NextResponse.json(
          { 
            error: 'Suspicious activity detected. Please try again.',
            type: 'security'
          },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { 
            error: 'Access denied.',
            type: 'access_denied'
          },
          { status: 403 }
        );
      }
    }

    const { name, email, message } = await request.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Log the contact form submission (in production, you'd send to email service)
    console.log('Contact form submission:', {
      name: name.substring(0, 50), // Truncate for logging
      email: email.substring(0, 50),
      message: message.substring(0, 200),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // TODO: In production, integrate with email service like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Nodemailer
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! I\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
