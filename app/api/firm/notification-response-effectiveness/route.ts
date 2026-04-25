import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to measure the effectiveness of user response to notifications for the firm

    return NextResponse.json({ notification_response_effectiveness: {} }, { status: 200 }); // Replace with actual response effectiveness data
  } catch (error) {
    return NextResponse.json({ message: 'Error measuring notification response effectiveness: ' + error.message }, { status: 500 });
  }
}
