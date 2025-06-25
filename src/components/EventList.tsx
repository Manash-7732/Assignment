
import React from 'react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface EventListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onEventDelete: (eventId: string) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onEventClick, onEventDelete }) => {
  const upcomingEvents = events
    .filter(event => event.date >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 10);

  const formatEventDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  if (upcomingEvents.length === 0) {
    return (
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Upcoming Events
        </h3>
        <p className="text-gray-500 text-center py-4">No upcoming events</p>
      </Card>
    );
  }

  return (
    <Card className="mt-6 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2" />
        Upcoming Events
      </h3>
      <div className="space-y-3">
        {upcomingEvents.map(event => (
          <div
            key={event.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onEventClick(event)}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className={cn("w-3 h-3 rounded-full", event.color?.split(' ')[0] || 'bg-blue-100')} />
                <div>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatEventDate(event.date)}</span>
                    {event.time && (
                      <>
                        <Clock className="w-3 h-3 ml-3 mr-1" />
                        <span>{event.time}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEventDelete(event.id);
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EventList;
