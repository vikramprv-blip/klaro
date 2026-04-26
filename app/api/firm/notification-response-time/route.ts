import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to analyze the response time of notifications for the firm

    return NextResponse.json({ notification_response_time: {} }, { status: 200 }); // Replace with actual response time data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving notification response time: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
