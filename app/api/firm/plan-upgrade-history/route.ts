import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve the plan upgrade history for the firm

    return NextResponse.json({ upgrade_history: [] }, { status: 200 }); // Replace with actual upgrade history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving plan upgrade history: ' + error.message }, { status: 500 });
  }
}
