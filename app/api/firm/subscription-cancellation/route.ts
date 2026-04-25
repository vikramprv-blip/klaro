import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id } = await request.json();

    // Logic to cancel the firm's subscription

    return NextResponse.json({ message: 'Subscription cancelled successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error cancelling subscription: ' + error.message }, { status: 500 });
  }
}
