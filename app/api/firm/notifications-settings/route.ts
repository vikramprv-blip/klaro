import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, notifications_enabled } = await request.json();

    // Logic to update notification settings for the firm

    return NextResponse.json({ message: 'Notification settings updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating notification settings: ' + error.message }, { status: 500 });
  }
}
