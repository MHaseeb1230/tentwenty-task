import { mockUsers, mockProjects, mockWorkTypes, mockTimesheets } from '@/lib/mockData';

describe('Mock Data', () => {
  describe('mockUsers', () => {
    it('should have at least one user', () => {
      expect(mockUsers.length).toBeGreaterThan(0);
    });

    it('should have users with required fields', () => {
      mockUsers.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('password');
        expect(user).toHaveProperty('name');
      });
    });
  });

  describe('mockProjects', () => {
    it('should have at least one project', () => {
      expect(mockProjects.length).toBeGreaterThan(0);
    });

    it('should have projects with required fields', () => {
      mockProjects.forEach((project) => {
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
      });
    });
  });

  describe('mockWorkTypes', () => {
    it('should have at least one work type', () => {
      expect(mockWorkTypes.length).toBeGreaterThan(0);
    });

    it('should have work types with required fields', () => {
      mockWorkTypes.forEach((workType) => {
        expect(workType).toHaveProperty('id');
        expect(workType).toHaveProperty('name');
      });
    });
  });

  describe('mockTimesheets', () => {
    it('should have timesheets', () => {
      expect(mockTimesheets.length).toBeGreaterThan(0);
    });

    it('should have timesheets with required fields', () => {
      mockTimesheets.forEach((timesheet) => {
        expect(timesheet).toHaveProperty('id');
        expect(timesheet).toHaveProperty('weekNumber');
        expect(timesheet).toHaveProperty('startDate');
        expect(timesheet).toHaveProperty('endDate');
        expect(timesheet).toHaveProperty('status');
        expect(timesheet).toHaveProperty('entries');
        expect(Array.isArray(timesheet.entries)).toBe(true);
      });
    });

    it('should have valid status values', () => {
      const validStatuses = ['COMPLETED', 'INCOMPLETE', 'IN DRAFT', 'MISSING'];
      mockTimesheets.forEach((timesheet) => {
        expect(validStatuses).toContain(timesheet.status);
      });
    });
  });
});

