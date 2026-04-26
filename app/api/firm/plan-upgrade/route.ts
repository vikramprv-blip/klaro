import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firm_id, new_plan_id } = await request.json();

    // Logic to upgrade firm plan to a new plan

    return NextResponse.json({ message: 'Plan upgraded successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error upgrading plan: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
