import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const firm_id = new URL(request.url).searchParams.get("firm_id");

    // Logic to fetch usage statistics for the firm

    return NextResponse.json({ usage_stats: {} }, { status: 200 }); // Replace with actual usage stats
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving usage stats: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
