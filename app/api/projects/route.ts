import { NextRequest, NextResponse } from 'next/server';
import { mockProjects } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockProjects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

