import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();

    // Logic to send WhatsApp message using API

    return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error sending message: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
