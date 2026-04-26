import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, feedback_details } = await request.json();

    // Logic to collect feedback on notifications from users within the firm

    return NextResponse.json({ message: 'Notification feedback collected successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error collecting notification feedback: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
