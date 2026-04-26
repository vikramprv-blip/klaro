import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, trigger_type } = await request.json();

    // Logic to trigger notifications based on the specified trigger type for the firm

    return NextResponse.json({ message: 'Notification triggered successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error triggering notification: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
