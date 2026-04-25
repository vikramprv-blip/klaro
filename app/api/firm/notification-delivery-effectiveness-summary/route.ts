import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to generate a summary of the effectiveness of notification delivery

    return NextResponse.json({ notification_delivery_effectiveness_summary: {} }, { status: 200 }); // Replace with actual effectiveness summary data
  } catch (error) {
    return NextResponse.json({ message: 'Error generating notification delivery effectiveness summary: ' + error.message }, { status: 500 });
  }
}
