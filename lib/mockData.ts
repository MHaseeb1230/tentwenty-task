import { User, Timesheet, Project, WorkType } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@ticktock.com',
    password: 'password123',
    name: 'John Doe',
  },
  {
    id: '2',
    email: 'user@ticktock.com',
    password: 'password123',
    name: 'Jane Smith',
  },
];

export const mockProjects: Project[] = [
  { id: '1', name: 'Homepage Development' },
  { id: '2', name: 'API Integration' },
  { id: '3', name: 'Bug Fixes' },
  { id: '4', name: 'UI/UX Design' },
  { id: '5', name: 'Database Optimization' },
];

export const mockWorkTypes: WorkType[] = [
  { id: '1', name: 'Bug Fix' },
  { id: '2', name: 'Feature Development' },
  { id: '3', name: 'Code Review' },
  { id: '4', name: 'Testing' },
  { id: '5', name: 'Documentation' },
];

function getWeekDateRange(weekNumber: number, year: number = 2025): { startDate: string; endDate: string } {
  const jan1 = new Date(year, 0, 1);
  const daysOffset = (weekNumber - 1) * 7;
  const startDate = new Date(jan1);
  startDate.setDate(jan1.getDate() + daysOffset - jan1.getDay() + 1); // Start on Monday
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // End on Sunday
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

function getCurrentWeek(): { weekNumber: number; startDate: string; endDate: string } {
  const today = new Date();
  const year = today.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const daysSinceJan1 = Math.floor((today.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((daysSinceJan1 + jan1.getDay() + 1) / 7);
  
  const currentDay = today.getDay();
  const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    weekNumber,
    startDate: monday.toISOString().split('T')[0],
    endDate: sunday.toISOString().split('T')[0],
  };
}

function createWeekTimesheet(
  weekNumber: number,
  startDate: string,
  endDate: string,
  hoursPerDay: number = 8,
  numDays: number = 5
): Timesheet {
  const entries = Array.from({ length: numDays }, (_, entryIndex) => {
    const entryDate = new Date(startDate);
    entryDate.setDate(entryDate.getDate() + entryIndex);
    
    return {
      id: `entry-${weekNumber}-${entryIndex}`,
      date: entryDate.toISOString().split('T')[0],
      projectName: mockProjects[entryIndex % mockProjects.length].name,
      typeOfWork: mockWorkTypes[entryIndex % mockWorkTypes.length].name,
      taskDescription: 'Homepage Development',
      hours: hoursPerDay,
    };
  });
  
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  let status: Timesheet['status'];
  if (totalHours === 0) {
    status = 'MISSING';
  } else if (totalHours >= 40) {
    status = 'COMPLETED';
  } else {
    status = 'INCOMPLETE';
  }
  
  return {
    id: `timesheet-${weekNumber}`,
    weekNumber,
    startDate,
    endDate,
    status,
    entries,
  };
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

export const mockTimesheets: Timesheet[] = (() => {
  const timesheets: Timesheet[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let weekCounter = 1;
  
  const currentWeekMonday = getMonday(new Date(today));
  const currentWeekSunday = new Date(currentWeekMonday);
  currentWeekSunday.setDate(currentWeekMonday.getDate() + 6);
  
  timesheets.push(createWeekTimesheet(
    weekCounter++,
    currentWeekMonday.toISOString().split('T')[0],
    currentWeekSunday.toISOString().split('T')[0],
    8, // 8 hours per day = 40 hours total
    5
  ));
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartMonday = getMonday(monthStart);
  
  const prevWeekMonday = new Date(monthStartMonday);
  prevWeekMonday.setDate(monthStartMonday.getDate() - 7);
  const prevWeekSunday = new Date(prevWeekMonday);
  prevWeekSunday.setDate(prevWeekMonday.getDate() + 6);
  
  if (prevWeekMonday.getMonth() === today.getMonth()) {
    timesheets.push(createWeekTimesheet(
      weekCounter++,
      prevWeekMonday.toISOString().split('T')[0],
      prevWeekSunday.toISOString().split('T')[0],
      6, // Less than 40 hours = INCOMPLETE
      4
    ));
  }
  
  const nextWeekMonday = new Date(currentWeekMonday);
  nextWeekMonday.setDate(currentWeekMonday.getDate() + 7);
  const nextWeekSunday = new Date(nextWeekMonday);
  nextWeekSunday.setDate(nextWeekMonday.getDate() + 6);
  
  if (nextWeekMonday.getMonth() === today.getMonth()) {
    timesheets.push(createWeekTimesheet(
      weekCounter++,
      nextWeekMonday.toISOString().split('T')[0],
      nextWeekSunday.toISOString().split('T')[0],
      7, // Less than 40 hours = INCOMPLETE
      4
    ));
  }
  
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 15);
  const lastMonthMonday1 = getMonday(lastMonth);
  const lastMonthSunday1 = new Date(lastMonthMonday1);
  lastMonthSunday1.setDate(lastMonthMonday1.getDate() + 6);
  
  timesheets.push(createWeekTimesheet(
    weekCounter++,
    lastMonthMonday1.toISOString().split('T')[0],
    lastMonthSunday1.toISOString().split('T')[0],
    8, // 40 hours = COMPLETED
    5
  ));
  
  const lastMonthMonday2 = new Date(lastMonthMonday1);
  lastMonthMonday2.setDate(lastMonthMonday1.getDate() - 7);
  const lastMonthSunday2 = new Date(lastMonthMonday2);
  lastMonthSunday2.setDate(lastMonthMonday2.getDate() + 6);
  
  timesheets.push(createWeekTimesheet(
    weekCounter++,
    lastMonthMonday2.toISOString().split('T')[0],
    lastMonthSunday2.toISOString().split('T')[0],
    0, // 0 hours = MISSING
    0
  ));
  
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, 15);
  const oneMonthAgoMonday = getMonday(oneMonthAgo);
  const oneMonthAgoSunday = new Date(oneMonthAgoMonday);
  oneMonthAgoSunday.setDate(oneMonthAgoMonday.getDate() + 6);
  
  timesheets.push(createWeekTimesheet(
    weekCounter++,
    oneMonthAgoMonday.toISOString().split('T')[0],
    oneMonthAgoSunday.toISOString().split('T')[0],
    8, // 40 hours = COMPLETED
    5
  ));
  
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 15);
  const twoMonthsAgoMonday = getMonday(twoMonthsAgo);
  const twoMonthsAgoSunday = new Date(twoMonthsAgoMonday);
  twoMonthsAgoSunday.setDate(twoMonthsAgoMonday.getDate() + 6);
  
  timesheets.push(createWeekTimesheet(
    weekCounter++,
    twoMonthsAgoMonday.toISOString().split('T')[0],
    twoMonthsAgoSunday.toISOString().split('T')[0],
    5, // Less than 40 hours = INCOMPLETE
    3
  ));
  
  const exactlyThreeMonthsAgo = new Date(today);
  exactlyThreeMonthsAgo.setMonth(today.getMonth() - 3);
  const exactlyThreeMonthsAgoMonday = getMonday(exactlyThreeMonthsAgo);
  const exactlyThreeMonthsAgoSunday = new Date(exactlyThreeMonthsAgoMonday);
  exactlyThreeMonthsAgoSunday.setDate(exactlyThreeMonthsAgoMonday.getDate() + 6);
  
  timesheets.push(createWeekTimesheet(
    weekCounter++,
    exactlyThreeMonthsAgoMonday.toISOString().split('T')[0],
    exactlyThreeMonthsAgoSunday.toISOString().split('T')[0],
    7, // Less than 40 hours = INCOMPLETE
    4
  ));
  
  const draftWeekMonday = new Date(lastMonthMonday1);
  draftWeekMonday.setDate(lastMonthMonday1.getDate() + 7);
  const draftWeekSunday = new Date(draftWeekMonday);
  draftWeekSunday.setDate(draftWeekMonday.getDate() + 6);
  
  const draftWeek = createWeekTimesheet(
    weekCounter++,
    draftWeekMonday.toISOString().split('T')[0],
    draftWeekSunday.toISOString().split('T')[0],
    6, // Less than 40 hours
    4
  );
  draftWeek.status = 'IN DRAFT';
  timesheets.push(draftWeek);
  
  return timesheets;
})();

