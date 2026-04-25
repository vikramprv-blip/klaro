import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve a summary of transactions for the firm

    return NextResponse.json({ transaction_summary: {} }, { status: 200 }); // Replace with actual transaction summary data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving transaction summary: ' + error.message }, { status: 500 });
  }
}
