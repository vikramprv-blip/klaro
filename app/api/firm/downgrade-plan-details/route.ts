import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id, downgrade_plan_id } = new URL(request.url).searchParams;

    // Logic to retrieve details of the downgrade plan for the firm

    return NextResponse.json({ downgrade_plan_details: {} }, { status: 200 }); // Replace with actual downgrade plan details
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving downgrade plan details: ' + error.message }, { status: 500 });
  }
}
