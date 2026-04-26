import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to retrieve subscription history for the firm

    return NextResponse.json({ subscription_history: [] }, { status: 200 }); // Replace with actual subscription history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving subscription history: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
