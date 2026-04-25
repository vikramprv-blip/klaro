import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, reason } = await request.json();

    // Logic to process refund request for the firm

    return NextResponse.json({ message: 'Refund request submitted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error submitting refund request: ' + error.message }, { status: 500 });
  }
}
