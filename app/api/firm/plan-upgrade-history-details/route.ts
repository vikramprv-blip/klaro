import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id, upgrade_history_id } = new URL(request.url).searchParams;

    // Logic to retrieve the details of a specific plan upgrade history entry for the firm

    return NextResponse.json({ upgrade_history_details: {} }, { status: 200 }); // Replace with actual upgrade history details
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving upgrade history details: ' + error.message }, { status: 500 });
  }
}
