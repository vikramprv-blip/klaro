import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to retrieve the history of notification filters applied for the firm

    return NextResponse.json({ notification_filter_history: [] }, { status: 200 }); // Replace with actual filter history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving notification filter history: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
