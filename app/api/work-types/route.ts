import { NextRequest, NextResponse } from 'next/server';
import { mockWorkTypes } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockWorkTypes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

