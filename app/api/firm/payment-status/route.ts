import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to retrieve the payment status for the firm

    return NextResponse.json({ payment_status: 'paid' }, { status: 200 }); // Replace with actual payment status
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving payment status: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
