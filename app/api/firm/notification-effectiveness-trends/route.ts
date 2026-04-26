import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to analyze the effectiveness trends for notifications

    return NextResponse.json({ notification_effectiveness_trends: {} }, { status: 200 }); // Replace with actual effectiveness trends data
  } catch (error) {
    return NextResponse.json({ message: 'Error analyzing notification effectiveness trends: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
