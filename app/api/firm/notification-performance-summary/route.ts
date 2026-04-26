import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to summarize the performance of notifications delivered to the firm

    return NextResponse.json({ notification_performance_summary: {} }, { status: 200 }); // Replace with actual performance summary data
  } catch (error) {
    return NextResponse.json({ message: 'Error summarizing notification performance: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
