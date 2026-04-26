import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {

    // Logic to retrieve details of the downgrade plan for the firm

    return NextResponse.json({ downgrade_plan_details: {} }, { status: 200 }); // Replace with actual downgrade plan details
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving downgrade plan details: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
