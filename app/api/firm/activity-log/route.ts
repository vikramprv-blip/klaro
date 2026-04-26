import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");
    // Logic to fetch firm activity log
    return NextResponse.json({ activity_log: [] }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : 'Unknown error';
    return NextResponse.json({ message: 'Error retrieving activity log: ' + message }, { status: 500 });
  }
}
