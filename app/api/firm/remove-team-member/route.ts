import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, user_id } = await request.json();

    // Logic to remove team member from firm

    return NextResponse.json({ message: 'Team member removed successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error removing team member: ' + error.message }, { status: 500 });
  }
}
