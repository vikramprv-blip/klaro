import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, invoice_id } = await request.json();

    // Logic to archive the specific invoice for the firm

    return NextResponse.json({ message: 'Invoice archived successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error archiving invoice: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
