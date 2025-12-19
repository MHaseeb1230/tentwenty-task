'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Timesheet } from '@/types';
import TimesheetTable from '@/components/TimesheetTable';
import TimesheetModal from '@/components/TimesheetModal';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<{ timesheet: Timesheet; entryId?: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTimesheets();
    }
  }, [status]);

  const fetchTimesheets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/timesheets');
      
      if (!response.ok) {
        throw new Error('Failed to fetch timesheets');
      }

      const data = await response.json();
      setTimesheets(data);
    } catch (err) {
      setError('Failed to load timesheets. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTimesheet = (timesheet: Timesheet) => {
    setSelectedTimesheet(timesheet);
    setIsModalOpen(true);
  };

  const handleAddEntry = (timesheet: Timesheet) => {
    setSelectedEntry({ timesheet });
    setIsModalOpen(true);
  };

  const handleEditEntry = (timesheet: Timesheet, entryId: string) => {
    setSelectedEntry({ timesheet, entryId });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTimesheet(null);
    setSelectedEntry(null);
  };

  const handleEntrySaved = (newEntry?: any, isEdit?: boolean, entryId?: string, timesheetId?: string) => {
    const currentTimesheetId = timesheetId || selectedTimesheet?.id || selectedEntry?.timesheet?.id;
    if (newEntry && currentTimesheetId) {
      setTimesheets((prev) => {
        return prev.map((ts) => {
          if (ts.id === currentTimesheetId) {
            let updatedEntries = [...ts.entries];
            
            if (isEdit && entryId) {
              updatedEntries = updatedEntries.map((e) =>
                e.id === entryId ? { ...e, ...newEntry } : e
              );
            } else {
              updatedEntries.push({
                id: `entry-${Date.now()}`,
                ...newEntry,
              });
            }
            
            const totalHours = updatedEntries.reduce((sum, e) => sum + e.hours, 0);
            let newStatus: Timesheet['status'];
            if (totalHours === 0) {
              newStatus = 'MISSING';
            } else if (totalHours >= 40) {
              newStatus = 'COMPLETED';
            } else {
              newStatus = 'INCOMPLETE';
            }
            
            return {
              ...ts,
              entries: updatedEntries,
              status: newStatus,
            };
          }
          return ts;
        });
      });
    } else {
      fetchTimesheets();
    }
    handleModalClose();
  };

  const handleEntryDeleted = (entryId: string) => {
    setTimesheets((prev) => {
      return prev.map((ts) => {
        if (!ts.entries.some((e) => e.id === entryId)) {
          return ts;
        }
        
        const updatedEntries = ts.entries.filter((e) => e.id !== entryId);
        
        const totalHours = updatedEntries.reduce((sum, e) => sum + e.hours, 0);
        let newStatus: Timesheet['status'];
        if (totalHours === 0) {
          newStatus = 'MISSING';
        } else if (totalHours >= 40) {
          newStatus = 'COMPLETED';
        } else {
          newStatus = 'INCOMPLETE';
        }
        
        return {
          ...ts,
          entries: updatedEntries,
          status: newStatus,
        };
      });
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ticktock</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-2">Timesheets</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Your Timesheets</h3>
              </div>

              {error && (
                <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <TimesheetTable
                timesheets={timesheets}
                onView={handleViewTimesheet}
                onAddEntry={handleAddEntry}
                onEditEntry={handleEditEntry}
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  3
                </div>
                <h4 className="font-bold text-gray-900">Statuses</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>completed</strong> = 40 hours added by the user</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>incomplete</strong> = less than 40 hours added by the user</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>missing</strong> = no hours added by the user</span>
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-yellow-300">
                <p className="text-xs text-yellow-800 font-medium">TenTwenty Developers</p>
              </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          © 2024 timesheet. All rights reserved.
        </footer>
      </div>

      {isModalOpen && (
        <TimesheetModal
          timesheet={selectedTimesheet || selectedEntry?.timesheet}
          entryId={selectedEntry?.entryId}
          onClose={handleModalClose}
          onSave={handleEntrySaved}
          onDeleteEntry={handleEntryDeleted}
          onEditEntry={(entryId) => {
            if (selectedTimesheet) {
              handleEditEntry(selectedTimesheet, entryId);
            } else if (selectedEntry?.timesheet) {
              handleEditEntry(selectedEntry.timesheet, entryId);
            }
          }}
        />
      )}
    </div>
  );
}

