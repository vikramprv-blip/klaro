import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id } = await request.json();

    // Logic to renew the firm's subscription plan

    return NextResponse.json({ message: 'Plan renewed successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error renewing plan: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
