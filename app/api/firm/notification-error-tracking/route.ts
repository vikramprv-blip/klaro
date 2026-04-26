import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to track errors in notifications sent to the firm

    return NextResponse.json({ notification_error_tracking: {} }, { status: 200 }); // Replace with actual error tracking data
  } catch (error) {
    return NextResponse.json({ message: 'Error tracking notification errors: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
