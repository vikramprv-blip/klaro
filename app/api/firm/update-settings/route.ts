import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, settings } = await request.json();

    // Logic to update firm settings (e.g., logo, header, WhatsApp details)

    return NextResponse.json({ message: 'Firm settings updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating firm settings: ' + error.message }, { status: 500 });
  }
}
