import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to generate a summary of the notification history for the firm

    return NextResponse.json({ notification_history_summary: {} }, { status: 200 }); // Replace with actual summary data
  } catch (error) {
    return NextResponse.json({ message: 'Error generating notification history summary: ' + error.message }, { status: 500 });
  }
}
