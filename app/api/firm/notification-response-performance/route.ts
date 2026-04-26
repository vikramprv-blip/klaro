import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to measure the response performance of notifications for the firm

    return NextResponse.json({ notification_response_performance: {} }, { status: 200 }); // Replace with actual response performance data
  } catch (error) {
    return NextResponse.json({ message: 'Error measuring notification response performance: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
