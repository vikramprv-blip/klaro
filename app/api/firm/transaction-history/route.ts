import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve transaction history for the firm

    return NextResponse.json({ transaction_history: [] }, { status: 200 }); // Replace with actual transaction history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving transaction history: ' + error.message }, { status: 500 });
  }
}
