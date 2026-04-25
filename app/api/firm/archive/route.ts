import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id } = await request.json();

    // Logic to archive firm data

    return NextResponse.json({ message: 'Firm data archived successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error archiving data: ' + error.message }, { status: 500 });
  }
}
