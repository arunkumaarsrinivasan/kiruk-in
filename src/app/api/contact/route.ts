import { NextRequest, NextResponse } from 'next/server';
import { ajForm } from '@/lib/arcjet';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { ContactSubmission } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Apply Arcjet form protection (skip if not configured)
    if (ajForm) {
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
    }

    let body: unknown;
    try {
      const text = await request.text();
      if (!text?.trim()) {
        return NextResponse.json(
          { error: 'Request body is required.' },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { name, email, message } = body as Record<string, unknown>;

    // Basic validation
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof message !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
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

    // Prepare contact submission data
    const submissionData: ContactSubmission = {
      name: name.substring(0, 50), // Truncate for safety
      email: email.substring(0, 50),
      message: message.substring(0, 2000), // Reasonable limit
      user_agent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      status: 'new'
    };

    // Save to Supabase database
    const { data: _data, error } = await supabaseAdmin
      .from('contact_submissions')
      .insert([submissionData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save contact submission');
    }

    // Log successful submission


    // TODO: In production, integrate with email service like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Nodemailer



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
