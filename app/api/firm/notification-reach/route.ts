import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to measure the reach of the notifications sent to the firm

    return NextResponse.json({ notification_reach: {} }, { status: 200 }); // Replace with actual reach data
  } catch (error) {
    return NextResponse.json({ message: 'Error measuring notification reach: ' + error.message }, { status: 500 });
  }
}
