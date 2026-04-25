import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve the payment method history for the firm

    return NextResponse.json({ payment_method_history: [] }, { status: 200 }); // Replace with actual payment method history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving payment method history: ' + error.message }, { status: 500 });
  }
}
