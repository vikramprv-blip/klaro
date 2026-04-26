import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, transaction_id } = await request.json();

    // Logic to restore the specific archived transaction for the firm

    return NextResponse.json({ message: 'Transaction restored successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error restoring transaction: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
