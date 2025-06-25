
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EventForm from './EventForm';
import EventList from './EventList';
import { Event, RecurrenceType } from '@/types/calendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { cn } from '@/lib/utils';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const { events, addEvent, updateEvent, deleteEvent } = useCalendarEvents();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventForm(true);
    setEditingEvent(null);
  };

  const handleEventClick = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleEventSubmit = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    setShowEventForm(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  const handleEventDelete = (eventId: string) => {
    deleteEvent(eventId);
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleDragStart = (event: Event) => {
    setDraggedEvent(event);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (draggedEvent && !isSameDay(draggedEvent.date, targetDate)) {
      updateEvent(draggedEvent.id, { ...draggedEvent, date: targetDate });
    }
    setDraggedEvent(null);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="p-6 shadow-lg">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="hover:bg-blue-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-semibold text-gray-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="hover:bg-blue-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setShowEventForm(true);
              setEditingEvent(null);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-500 bg-gray-50 rounded-lg">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[120px] p-2 border rounded-lg cursor-pointer transition-colors",
                  isCurrentMonth ? "bg-white hover:bg-blue-50" : "bg-gray-50 text-gray-400",
                  isCurrentDay && "ring-2 ring-blue-500 bg-blue-50"
                )}
                onClick={() => handleDateClick(day)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isCurrentDay && "text-blue-600"
                )}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs p-1 rounded cursor-pointer truncate transition-transform hover:scale-105",
                        event.color || "bg-blue-100 text-blue-800"
                      )}
                      draggable
                      onDragStart={() => handleDragStart(event)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          event={editingEvent}
          selectedDate={selectedDate}
          onSubmit={handleEventSubmit}
          onDelete={editingEvent ? () => handleEventDelete(editingEvent.id) : undefined}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
            setSelectedDate(null);
          }}
        />
      )}

      {/* Event List Sidebar */}
      <EventList
        events={events}
        onEventClick={handleEventClick}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
};

export default Calendar;
