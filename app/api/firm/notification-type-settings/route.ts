import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, notification_type, settings } = await request.json();

    // Logic to set specific settings for a particular notification type for the firm

    return NextResponse.json({ message: 'Notification type settings updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating notification type settings: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
