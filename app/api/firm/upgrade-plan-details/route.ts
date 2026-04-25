import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id, upgrade_plan_id } = new URL(request.url).searchParams;

    // Logic to retrieve details of the upgrade plan for the firm

    return NextResponse.json({ upgrade_plan_details: {} }, { status: 200 }); // Replace with actual upgrade plan details
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving upgrade plan details: ' + error.message }, { status: 500 });
  }
}
