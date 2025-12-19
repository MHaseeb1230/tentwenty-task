import { NextRequest, NextResponse } from 'next/server';
import { mockTimesheets } from '@/lib/mockData';
import { Timesheet } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weekNumber = searchParams.get('weekNumber');

    if (weekNumber) {
      const timesheet = mockTimesheets.find(
        (ts) => ts.weekNumber === parseInt(weekNumber)
      );
      return NextResponse.json(timesheet || null);
    }

    return NextResponse.json(mockTimesheets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekNumber, entry } = body;

    return NextResponse.json({
      success: true,
      message: 'Timesheet entry added successfully',
      entry: {
        id: `entry-${Date.now()}`,
        ...entry,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, entry } = body;

    return NextResponse.json({
      success: true,
      message: 'Timesheet entry updated successfully',
      entry: {
        id: entryId,
        ...entry,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId } = body;

    return NextResponse.json({
      success: true,
      message: 'Timesheet entry deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

