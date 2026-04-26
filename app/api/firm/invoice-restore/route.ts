import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, invoice_id } = await request.json();

    return NextResponse.json({ message: 'Invoice restored successfully', firm_id, invoice_id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error restoring invoice: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
