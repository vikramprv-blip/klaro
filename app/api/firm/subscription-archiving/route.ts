import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, subscription_id } = await request.json();

    // Logic to archive the specific subscription for the firm

    return NextResponse.json({ message: 'Subscription archived successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error archiving subscription: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
