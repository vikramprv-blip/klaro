import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { invite_id } = await request.json();

    // Logic to deactivate invite

    return NextResponse.json({ message: 'Invite deactivated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deactivating invite: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
