import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, invoice_id } = await request.json();

    // Logic to restore the specific archived invoice for the firm

    return NextResponse.json({ message: 'Invoice restored successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error restoring invoice: ' + error.message }, { status: 500 });
  }
}
