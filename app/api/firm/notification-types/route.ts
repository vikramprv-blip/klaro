import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve the available notification types for the firm

    return NextResponse.json({ notification_types: [] }, { status: 200 }); // Replace with actual notification types data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving notification types: ' + error.message }, { status: 500 });
  }
}
