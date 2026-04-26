import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, mode } = await request.json();

    // Logic to set the notification mode (email, SMS, push, etc.) for the firm

    return NextResponse.json({ message: 'Notification mode set successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error setting notification mode: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
