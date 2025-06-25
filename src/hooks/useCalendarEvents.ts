
import { useState, useEffect } from 'react';
import { Event, CalendarEvent, RecurrenceType } from '@/types/calendar';
import { addDays, addWeeks, addMonths, isBefore, isAfter } from 'date-fns';

const STORAGE_KEY = 'calendar-events';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    if (savedEvents) {
      try {
        const parsedEvents: CalendarEvent[] = JSON.parse(savedEvents);
        const eventsWithDates = parsedEvents.map(event => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));
        setEvents(expandRecurringEvents(eventsWithDates));
      } catch (error) {
        console.error('Error loading events from localStorage:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever events change
  const saveEvents = (eventsToSave: Event[]) => {
    const baseEvents = eventsToSave.filter(event => !event.id.includes('-recurring-'));
    const eventsForStorage: CalendarEvent[] = baseEvents.map(event => ({
      ...event,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsForStorage));
  };

  const expandRecurringEvents = (baseEvents: Event[]): Event[] => {
    const expandedEvents: Event[] = [...baseEvents];
    const today = new Date();
    const futureLimit = new Date();
    futureLimit.setFullYear(today.getFullYear() + 2);

    baseEvents.forEach(event => {
      if (event.recurrence && event.recurrence.type !== 'none') {
        const instances = generateRecurringInstances(event, futureLimit);
        expandedEvents.push(...instances);
      }
    });

    return expandedEvents;
  };

  const generateRecurringInstances = (baseEvent: Event, limit: Date): Event[] => {
    const instances: Event[] = [];
    const { recurrence } = baseEvent;
    
    if (!recurrence || recurrence.type === 'none') return instances;

    let currentDate = new Date(baseEvent.date);
    let instanceCount = 0;
    const maxInstances = 365; // Prevent infinite loops

    while (isBefore(currentDate, limit) && instanceCount < maxInstances) {
      let nextDate: Date;

      switch (recurrence.type) {
        case 'daily':
          nextDate = addDays(currentDate, recurrence.interval || 1);
          break;
        case 'weekly':
          nextDate = addWeeks(currentDate, recurrence.interval || 1);
          break;
        case 'monthly':
          nextDate = addMonths(currentDate, recurrence.interval || 1);
          break;
        case 'custom':
          nextDate = addDays(currentDate, recurrence.interval || 7);
          break;
        default:
          return instances;
      }

      if (recurrence.endDate && isAfter(nextDate, recurrence.endDate)) {
        break;
      }

      instances.push({
        ...baseEvent,
        id: `${baseEvent.id}-recurring-${instanceCount}`,
        date: nextDate,
      });

      currentDate = nextDate;
      instanceCount++;
    }

    return instances;
  };

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedEvents = [...events, newEvent];
    const expandedEvents = expandRecurringEvents(updatedEvents.filter(e => !e.id.includes('-recurring-')));
    setEvents(expandedEvents);
    saveEvents(expandedEvents);
  };

  const updateEvent = (id: string, eventData: Partial<Event>) => {
    const baseId = id.split('-recurring-')[0];
    const updatedEvents = events.map(event => {
      if (event.id === baseId || event.id.startsWith(`${baseId}-recurring-`)) {
        return { ...event, ...eventData, id: event.id, updatedAt: new Date() };
      }
      return event;
    });

    const baseEvents = updatedEvents.filter(e => !e.id.includes('-recurring-'));
    const expandedEvents = expandRecurringEvents(baseEvents);
    setEvents(expandedEvents);
    saveEvents(expandedEvents);
  };

  const deleteEvent = (id: string) => {
    const baseId = id.split('-recurring-')[0];
    const filteredEvents = events.filter(event => 
      event.id !== baseId && !event.id.startsWith(`${baseId}-recurring-`)
    );
    setEvents(filteredEvents);
    saveEvents(filteredEvents);
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
  };
};
