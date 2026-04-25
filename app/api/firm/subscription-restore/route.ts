import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, subscription_id } = await request.json();

    // Logic to restore the specific archived subscription for the firm

    return NextResponse.json({ message: 'Subscription restored successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error restoring subscription: ' + error.message }, { status: 500 });
  }
}
