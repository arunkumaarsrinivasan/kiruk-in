import { NextResponse } from 'next/server';

export function POST() {
  return NextResponse.json(
    { error: 'The chatbot is no longer available.' },
    { status: 410 }
  );
}
