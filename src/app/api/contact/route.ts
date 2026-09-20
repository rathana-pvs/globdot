import { NextResponse } from 'next/server';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, department, subject, message, articleUrl } = body;

    // 1. Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid full name.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: 'Please provide a descriptive subject line.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Message content must be at least 10 characters in length.' },
        { status: 400 }
      );
    }

    // 2. Generate unique reference tracking ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `GD-${timestamp}-${randomSuffix}`;

    // 3. Log receipt internally (in production, this would dispatch to newsroom CRM/email)
    console.log(
      `[Contact Submission] Ref: ${referenceId} | Dept: ${department} | From: ${email.trim()} | Subject: ${subject.trim()}${
        articleUrl ? ` | URL: ${articleUrl}` : ''
      }`
    );

    return NextResponse.json({
      success: true,
      referenceId,
      message: 'Your inquiry has been logged and transmitted to the newsroom desk.',
    });
  } catch (_err: any) {
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while parsing the submission.' },
      { status: 400 }
    );
  }
}
