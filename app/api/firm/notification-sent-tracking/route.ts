import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to track notifications that were sent for the firm

    return NextResponse.json({ notification_sent_tracking: {} }, { status: 200 }); // Replace with actual sent tracking data
  } catch (error) {
    return NextResponse.json({ message: 'Error tracking sent notifications: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
