import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, payment_method } = await request.json();

    // Logic to update the payment method for the firm

    return NextResponse.json({ message: 'Payment method updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating payment method: ' + error.message }, { status: 500 });
  }
}
