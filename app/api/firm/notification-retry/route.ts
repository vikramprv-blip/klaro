import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, notification_id } = await request.json();

    // Logic to retry sending a failed notification for the firm

    return NextResponse.json({ message: 'Notification retry initiated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error retrying notification: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
