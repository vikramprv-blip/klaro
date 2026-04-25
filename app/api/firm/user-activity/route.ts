import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id, user_id } = new URL(request.url).searchParams;

    // Logic to fetch individual user activity for a firm

    return NextResponse.json({ user_activity: {} }, { status: 200 }); // Replace with actual user activity data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving user activity: ' + error.message }, { status: 500 });
  }
}
