import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to fetch plan history for the firm

    return NextResponse.json({ plan_history: [] }, { status: 200 }); // Replace with actual plan history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving plan history: ' + error.message }, { status: 500 });
  }
}
