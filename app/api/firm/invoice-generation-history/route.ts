import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve the invoice generation history for the firm

    return NextResponse.json({ invoice_generation_history: [] }, { status: 200 }); // Replace with actual invoice generation history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving invoice generation history: ' + error.message }, { status: 500 });
  }
}
