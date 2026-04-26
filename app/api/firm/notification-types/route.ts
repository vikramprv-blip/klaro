import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to retrieve the available notification types for the firm

    return NextResponse.json({ notification_types: [] }, { status: 200 }); // Replace with actual notification types data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving notification types: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
