import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve the history of notification statuses for the firm

    return NextResponse.json({ notification_status_history: [] }, { status: 200 }); // Replace with actual status history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving notification status history: ' + error.message }, { status: 500 });
  }
}
