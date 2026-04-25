import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, timing_details } = await request.json();

    // Logic to configure the timing for notifications for the firm

    return NextResponse.json({ message: 'Notification timing set successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error setting notification timing: ' + error.message }, { status: 500 });
  }
}
