import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, notification_queue } = await request.json();

    // Logic to add notifications to the queue for the firm

    return NextResponse.json({ message: 'Notification added to queue successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding notification to queue: ' + error.message }, { status: 500 });
  }
}
