import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, template_data } = await request.json();

    // Logic to create or update a notification template for the firm

    return NextResponse.json({ message: 'Notification template created/updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating/updating notification template: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
