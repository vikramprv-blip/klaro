import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, schedule_time } = await request.json();

    // Logic to set up a notification schedule for the firm

    return NextResponse.json({ message: 'Notification schedule set successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error setting notification schedule: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
