import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to retrieve subscription plan details for the firm

    return NextResponse.json({ plan_details: {} }, { status: 200 }); // Replace with actual plan data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving plan details: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
