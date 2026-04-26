import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to retrieve the status of notifications for the firm

    return NextResponse.json({ notification_status: 'active' }, { status: 200 }); // Replace with actual notification status
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving notification status: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
