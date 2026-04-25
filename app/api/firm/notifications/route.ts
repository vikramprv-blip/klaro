import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, notification_message } = await request.json();

    // Logic to send notification to firm members

    return NextResponse.json({ message: 'Notification sent successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error sending notification: ' + error.message }, { status: 500 });
  }
}
