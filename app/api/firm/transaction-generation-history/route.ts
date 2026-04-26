import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to retrieve the transaction generation history for the firm

    return NextResponse.json({ transaction_generation_history: [] }, { status: 200 }); // Replace with actual transaction generation history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving transaction generation history: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
