import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id } = await request.json();

    // Logic to restore firm data from archive

    return NextResponse.json({ message: 'Firm data restored from archive successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error restoring from archive: ' + error.message }, { status: 500 });
  }
}
