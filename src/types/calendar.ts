
export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  color?: string;
  recurrence?: {
    type: RecurrenceType;
    interval?: number;
    daysOfWeek?: number[];
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface CalendarEvent extends Omit<Event, 'date' | 'createdAt' | 'updatedAt'> {
  date: string;
  createdAt: string;
  updatedAt: string;
}
