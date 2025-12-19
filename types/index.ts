export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
}

export type TimesheetStatus = 'COMPLETED' | 'INCOMPLETE' | 'IN DRAFT' | 'MISSING';

export interface Timesheet {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: TimesheetStatus;
  entries: TimesheetEntry[];
}

export interface TimesheetEntry {
  id: string;
  date: string;
  projectName: string;
  typeOfWork: string;
  taskDescription: string;
  hours: number;
}

export interface Project {
  id: string;
  name: string;
}

export interface WorkType {
  id: string;
  name: string;
}

