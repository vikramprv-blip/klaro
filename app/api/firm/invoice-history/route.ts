import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve invoice history for the firm

    return NextResponse.json({ invoice_history: [] }, { status: 200 }); // Replace with actual invoice history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving invoice history: ' + error.message }, { status: 500 });
  }
}
