import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id } = await request.json();

    // Logic to reset the notification settings for the firm to default values

    return NextResponse.json({ message: 'Notification settings reset successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error resetting notification settings: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
