import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, new_owner_id } = await request.json();

    // Logic to transfer firm ownership to a new user

    return NextResponse.json({ message: 'Ownership transferred successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error transferring ownership: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
