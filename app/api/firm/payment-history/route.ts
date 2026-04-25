import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve payment history for the firm

    return NextResponse.json({ payment_history: [] }, { status: 200 }); // Replace with actual payment history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving payment history: ' + error.message }, { status: 500 });
  }
}
