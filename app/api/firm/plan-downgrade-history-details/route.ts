import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id, downgrade_history_id } = new URL(request.url).searchParams;

    // Logic to retrieve the details of a specific plan downgrade history entry for the firm

    return NextResponse.json({ downgrade_history_details: {} }, { status: 200 }); // Replace with actual downgrade history details
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving downgrade history details: ' + error.message }, { status: 500 });
  }
}
