import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, notification_id } = await request.json();

    // Logic to restore a specific archived notification for the firm

    return NextResponse.json({ message: 'Notification restored successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error restoring notification: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
