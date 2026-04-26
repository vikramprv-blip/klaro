import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, notification_type, preference } = await request.json();

    // Logic to update the notification preferences for the firm

    return NextResponse.json({ message: 'Notification preferences updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating notification preferences: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
