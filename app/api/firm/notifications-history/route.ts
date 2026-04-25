import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve notifications history for the firm

    return NextResponse.json({ notifications_history: [] }, { status: 200 }); // Replace with actual data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving notifications history: ' + error.message }, { status: 500 });
  }
}
