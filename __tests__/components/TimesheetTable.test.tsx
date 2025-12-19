import { render, screen } from '@testing-library/react';
import TimesheetTable from '@/components/TimesheetTable';
import { Timesheet } from '@/types';

const mockTimesheets: Timesheet[] = [
  {
    id: '1',
    weekNumber: 1,
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    status: 'COMPLETED',
    entries: [],
  },
  {
    id: '2',
    weekNumber: 2,
    startDate: '2024-01-08',
    endDate: '2024-01-14',
    status: 'INCOMPLETE',
    entries: [],
  },
];

const mockHandlers = {
  onView: jest.fn(),
  onAddEntry: jest.fn(),
  onEditEntry: jest.fn(),
};

describe('TimesheetTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders timesheet table with correct columns', () => {
    render(
      <TimesheetTable
        timesheets={mockTimesheets}
        onView={mockHandlers.onView}
        onAddEntry={mockHandlers.onAddEntry}
        onEditEntry={mockHandlers.onEditEntry}
      />
    );

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('DATE')).toBeInTheDocument();
    expect(screen.getByText('STATUS')).toBeInTheDocument();
    expect(screen.getByText('ACTIONS')).toBeInTheDocument();
  });

  it('displays timesheet data correctly', () => {
    render(
      <TimesheetTable
        timesheets={mockTimesheets}
        onView={mockHandlers.onView}
        onAddEntry={mockHandlers.onAddEntry}
        onEditEntry={mockHandlers.onEditEntry}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('INCOMPLETE')).toBeInTheDocument();
  });

  it('shows correct action labels based on status', () => {
    render(
      <TimesheetTable
        timesheets={mockTimesheets}
        onView={mockHandlers.onView}
        onAddEntry={mockHandlers.onAddEntry}
        onEditEntry={mockHandlers.onEditEntry}
      />
    );

    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('displays empty state when no timesheets', () => {
    render(
      <TimesheetTable
        timesheets={[]}
        onView={mockHandlers.onView}
        onAddEntry={mockHandlers.onAddEntry}
        onEditEntry={mockHandlers.onEditEntry}
      />
    );

    expect(screen.getByText('No timesheets found.')).toBeInTheDocument();
  });
});

