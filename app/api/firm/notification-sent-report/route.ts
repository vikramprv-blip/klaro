import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to generate a report of notifications that have been sent for the firm

    return NextResponse.json({ notification_sent_report: {} }, { status: 200 }); // Replace with actual sent report data
  } catch (error) {
    return NextResponse.json({ message: 'Error generating notification sent report: ' + error.message }, { status: 500 });
  }
}
