'use client';

import { useState, useEffect } from 'react';
import { Timesheet, TimesheetEntry, Project, WorkType } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

function EntryItem({
  entry,
  onEdit,
  onDelete,
  timesheet,
}: {
  entry: TimesheetEntry;
  onEdit: () => void;
  onDelete: () => void;
  timesheet: Timesheet;
}) {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.entry-menu')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{entry.taskDescription}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{entry.hours} hrs</p>
          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded">
            {entry.projectName}
          </span>
        </div>
        <div className="relative entry-menu">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TimesheetModalProps {
  timesheet: Timesheet | null | undefined;
  entryId?: string;
  onClose: () => void;
  onSave: (entry?: any, isEdit?: boolean, entryId?: string, timesheetId?: string) => void;
  onEditEntry?: (entryId: string) => void;
  onDeleteEntry?: (entryId: string) => void;
}

const entrySchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  typeOfWork: z.string().min(1, 'Type of work is required'),
  taskDescription: z.string().min(1, 'Task description is required'),
  hours: z.number().min(0.5, 'Hours must be at least 0.5').max(24, 'Hours cannot exceed 24'),
  date: z.string().min(1, 'Date is required'),
});

type EntryFormData = z.infer<typeof entrySchema>;

export default function TimesheetModal({
  timesheet,
  entryId,
  onClose,
  onSave,
  onEditEntry,
  onDeleteEntry,
}: TimesheetModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewMode, setIsViewMode] = useState(!entryId && timesheet !== null);

  const existingEntry = entryId && timesheet
    ? timesheet.entries.find((e) => e.id === entryId)
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      projectName: existingEntry?.projectName || '',
      typeOfWork: existingEntry?.typeOfWork || '',
      taskDescription: existingEntry?.taskDescription || '',
      hours: existingEntry?.hours || 1,
      date: existingEntry?.date || timesheet?.startDate || '',
    },
  });

  const hours = watch('hours');

  useEffect(() => {
    fetchProjects();
    fetchWorkTypes();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchWorkTypes = async () => {
    try {
      const response = await fetch('/api/work-types');
      if (response.ok) {
        const data = await response.json();
        setWorkTypes(data);
      }
    } catch (err) {
      console.error('Failed to fetch work types:', err);
    }
  };

  const onSubmit = async (data: EntryFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (entryId) {
        const response = await fetch('/api/timesheets', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entryId,
            entry: data,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update entry');
        }
      } else {
        const response = await fetch('/api/timesheets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            weekNumber: timesheet?.weekNumber,
            entry: data,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create entry');
        }
      }

      onSave(data, !!entryId, entryId, timesheet?.id);
    } catch (err) {
      setError('Failed to save entry. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementHours = () => {
    const currentHours = hours || 1;
    if (currentHours < 24) {
      setValue('hours', Math.min(currentHours + 0.5, 24));
    }
  };

  const decrementHours = () => {
    const currentHours = hours || 1;
    if (currentHours > 0.5) {
      setValue('hours', Math.max(currentHours - 0.5, 0.5));
    }
  };

  if (!timesheet) {
    return null;
  }

  const entriesByDate = timesheet?.entries.reduce((acc, entry) => {
    const dateKey = entry.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, TimesheetEntry[]>) || {};

  const totalHours = timesheet?.entries.reduce((sum, entry) => sum + entry.hours, 0) || 0;
  const targetHours = 40;
  const progressPercentage = Math.min((totalHours / targetHours) * 100, 100);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startDay = startDate.getDate();
    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const endDay = endDate.getDate();
    const endMonth = endDate.toLocaleString('default', { month: 'short' });
    const year = startDate.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth}, ${year}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${year}`;
  };

  const formatDayLabel = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'short', day: 'numeric' });
  };

  if (isViewMode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  This week's timesheet
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDateRange(timesheet.startDate, timesheet.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {totalHours}/{targetHours} hrs
                  </p>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-2 bg-orange-500 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            {Object.keys(entriesByDate).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(entriesByDate)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([date, entries]) => (
                    <div key={date} className="flex gap-4">
                      <div className="w-20 flex-shrink-0">
                        <p className="font-bold text-gray-900">{formatDayLabel(date)}</p>
                      </div>

                      <div className="flex-1 space-y-3">
                        {entries.map((entry) => (
                          <EntryItem
                            key={entry.id}
                            entry={entry}
                            timesheet={timesheet}
                            onEdit={() => {
                              setIsViewMode(false);
                              if (onEditEntry) {
                                onEditEntry(entry.id);
                              }
                            }}
                            onDelete={() => {
                              if (confirm('Are you sure you want to delete this entry?')) {
                                if (onDeleteEntry) {
                                  onDeleteEntry(entry.id);
                                } else {
                                  fetch('/api/timesheets', {
                                    method: 'DELETE',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ entryId: entry.id }),
                                  }).then(() => onSave());
                                }
                              }
                            }}
                          />
                        ))}
                        <button
                          onClick={() => {
                            setIsViewMode(false);
                            setValue('date', date);
                          }}
                          className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="text-xl">+</span>
                          <span>Add new task</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No entries found for this week.</p>
                <button
                  onClick={() => setIsViewMode(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Entry
                </button>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Entry</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project <span className="text-red-500">*</span>
              </label>
              <select
                {...register('projectName')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white"
              >
                <option value="">Project Name</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectName && (
                <p className="mt-1 text-sm text-red-600">{errors.projectName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Work <span className="text-red-500">*</span>
              </label>
              <select
                {...register('typeOfWork')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white"
              >
                <option value="">Bug Fix</option>
                {workTypes.map((workType) => (
                  <option key={workType.id} value={workType.name}>
                    {workType.name}
                  </option>
                ))}
              </select>
              {errors.typeOfWork && (
                <p className="mt-1 text-sm text-red-600">{errors.typeOfWork.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('taskDescription')}
                placeholder="What was done..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900 bg-white"
              />
              {errors.taskDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.taskDescription.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('date')}
                min={timesheet.startDate}
                max={timesheet.endDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={decrementHours}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  −
                </button>
                <input
                  type="number"
                  {...register('hours', { valueAsNumber: true })}
                  min="0.5"
                  max="24"
                  step="0.5"
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white font-semibold"
                />
                <button
                  type="button"
                  onClick={incrementHours}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  +
                </button>
              </div>
              {errors.hours && (
                <p className="mt-1 text-sm text-red-600">{errors.hours.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : entryId ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

