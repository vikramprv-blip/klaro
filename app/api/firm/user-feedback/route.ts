import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, user_id, feedback } = await request.json();

    // Logic to handle user feedback submission for the firm

    return NextResponse.json({ message: 'User feedback submitted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error submitting feedback: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
