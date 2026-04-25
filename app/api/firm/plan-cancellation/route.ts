import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id } = await request.json();

    // Logic to cancel the firm's subscription plan

    return NextResponse.json({ message: 'Plan cancelled successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error cancelling plan: ' + error.message }, { status: 500 });
  }
}
