import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, user_id } = await request.json();

    // Logic to deactivate a firm account

    return NextResponse.json({ message: 'Firm account deactivated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deactivating account: ' + error.message }, { status: 500 });
  }
}
