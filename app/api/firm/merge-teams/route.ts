import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, target_firm_id } = await request.json();

    // Logic to merge two teams/firms

    return NextResponse.json({ message: 'Teams merged successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error merging teams: ' + error.message }, { status: 500 });
  }
}
