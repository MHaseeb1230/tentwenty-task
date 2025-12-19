'use client';

import { useState, useMemo } from 'react';
import { Timesheet } from '@/types';

interface TimesheetTableProps {
  timesheets: Timesheet[];
  onView: (timesheet: Timesheet) => void;
  onAddEntry: (timesheet: Timesheet) => void;
  onEditEntry: (timesheet: Timesheet, entryId: string) => void;
}

const getStatusColor = (status: Timesheet['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'INCOMPLETE':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'IN DRAFT':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'MISSING':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startDay = start.getDate();
  const startMonth = start.toLocaleString('default', { month: 'short' });
  const endDay = end.getDate();
  const endMonth = end.toLocaleString('default', { month: 'short' });
  const year = start.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} ${startMonth}, ${year}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${year}`;
};

const getActionLabel = (status: Timesheet['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'View';
    case 'INCOMPLETE':
      return 'Update';
    case 'IN DRAFT':
      return 'More';
    case 'MISSING':
      return 'Create';
    default:
      return 'View';
  }
};

export default function TimesheetTable({
  timesheets,
  onView,
  onAddEntry,
  onEditEntry,
}: TimesheetTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');

  const filteredTimesheets = useMemo(() => {
    let filtered = [...timesheets];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((ts) => ts.status === statusFilter);
    }

    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter((ts) => {
        const startDate = new Date(ts.startDate + 'T00:00:00');
        const endDate = new Date(ts.endDate + 'T00:00:00');
        
        switch (dateRangeFilter) {
          case 'this-week': {
            const dayOfWeek = today.getDay();
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const weekStart = new Date(today);
            weekStart.setDate(diff);
            weekStart.setHours(0, 0, 0, 0);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            
            return (startDate <= weekEnd && endDate >= weekStart);
          }
          
          case 'this-month': {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);
            
            return (startDate <= monthEnd && endDate >= monthStart);
          }
          
          case 'last-month': {
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            lastMonthEnd.setHours(23, 59, 59, 999);
            
            return (startDate <= lastMonthEnd && endDate >= lastMonthStart);
          }
          
          case 'last-3-months': {
            const threeMonthsAgo = new Date(today);
            threeMonthsAgo.setMonth(today.getMonth() - 3);
            threeMonthsAgo.setHours(0, 0, 0, 0);
            
            return (startDate >= threeMonthsAgo && startDate <= today);
          }
          
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [timesheets, statusFilter, dateRangeFilter]);

  const handleAction = (timesheet: Timesheet) => {
    if (timesheet.status === 'MISSING') {
      onAddEntry(timesheet);
    } else {
      onView(timesheet);
    }
  };

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="date-range" className="text-sm font-medium text-gray-700">
            Date Range:
          </label>
          <select
            id="date-range"
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Status:
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All</option>
            <option value="COMPLETED">Completed</option>
            <option value="INCOMPLETE">Incomplete</option>
            <option value="IN DRAFT">In Draft</option>
            <option value="MISSING">Missing</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              DATE
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              STATUS
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredTimesheets.map((timesheet) => (
            <tr key={timesheet.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {timesheet.weekNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDateRange(timesheet.startDate, timesheet.endDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(
                    timesheet.status
                  )}`}
                >
                  {timesheet.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => handleAction(timesheet)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {getActionLabel(timesheet.status)}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredTimesheets.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          No timesheets found.
        </div>
      )}

      {filteredTimesheets.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            <span>5 per page</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((page) => (
              <button
                key={page}
                className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                {page}
              </button>
            ))}
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

