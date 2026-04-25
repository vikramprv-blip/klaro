import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, reminder_type } = await request.json();

    // Logic to send a notification reminder for the firm

    return NextResponse.json({ message: 'Notification reminder sent successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error sending notification reminder: ' + error.message }, { status: 500 });
  }
}
