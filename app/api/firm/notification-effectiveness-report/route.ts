import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to generate a report on the effectiveness of notifications for the firm

    return NextResponse.json({ notification_effectiveness_report: {} }, { status: 200 }); // Replace with actual effectiveness report data
  } catch (error) {
    return NextResponse.json({ message: 'Error generating notification effectiveness report: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
