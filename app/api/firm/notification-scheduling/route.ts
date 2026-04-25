import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, notification_time, notification_type } = await request.json();

    // Logic to schedule notifications for the firm at a specified time

    return NextResponse.json({ message: 'Notification scheduled successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error scheduling notification: ' + error.message }, { status: 500 });
  }
}
