import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { firm_id } = new URL(request.url).searchParams;

    // Logic to retrieve the history of notification settings for the firm

    return NextResponse.json({ notification_settings_history: [] }, { status: 200 }); // Replace with actual notification settings history data
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving notification settings history: ' + error.message }, { status: 500 });
  }
}
