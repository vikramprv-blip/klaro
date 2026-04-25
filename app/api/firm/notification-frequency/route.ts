import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, frequency } = await request.json();

    // Logic to set the notification frequency for the firm

    return NextResponse.json({ message: 'Notification frequency set successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error setting notification frequency: ' + error.message }, { status: 500 });
  }
}
