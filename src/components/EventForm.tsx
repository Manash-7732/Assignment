
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Calendar, Clock, Repeat, Palette, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event, RecurrenceType } from '@/types/calendar';

interface EventFormProps {
  event?: Event | null;
  selectedDate?: Date | null;
  onSubmit: (event: Omit<Event, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  selectedDate,
  onSubmit,
  onDelete,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: selectedDate || new Date(),
    time: '',
    color: 'bg-blue-100 text-blue-800',
    recurrenceType: 'none' as RecurrenceType,
    recurrenceInterval: 1,
    recurrenceEndDate: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        date: event.date,
        time: event.time || '',
        color: event.color || 'bg-blue-100 text-blue-800',
        recurrenceType: event.recurrence?.type || 'none',
        recurrenceInterval: event.recurrence?.interval || 1,
        recurrenceEndDate: event.recurrence?.endDate ? format(event.recurrence.endDate, 'yyyy-MM-dd') : '',
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const eventData: Omit<Event, 'id'> = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      color: formData.color,
      recurrence: formData.recurrenceType !== 'none' ? {
        type: formData.recurrenceType,
        interval: formData.recurrenceInterval,
        endDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : undefined,
      } : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onSubmit(eventData);
  };

  const colorOptions = [
    { value: 'bg-blue-100 text-blue-800', label: 'Blue', preview: 'bg-blue-100' },
    { value: 'bg-green-100 text-green-800', label: 'Green', preview: 'bg-green-100' },
    { value: 'bg-yellow-100 text-yellow-800', label: 'Yellow', preview: 'bg-yellow-100' },
    { value: 'bg-red-100 text-red-800', label: 'Red', preview: 'bg-red-100' },
    { value: 'bg-purple-100 text-purple-800', label: 'Purple', preview: 'bg-purple-100' },
    { value: 'bg-pink-100 text-pink-800', label: 'Pink', preview: 'bg-pink-100' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {event ? 'Edit Event' : 'Create Event'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <div className="flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <Input
                  id="date"
                  type="date"
                  value={format(formData.date, 'yyyy-MM-dd')}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter event description"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex items-center mt-1">
                <Palette className="w-4 h-4 mr-2 text-gray-500" />
                <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded mr-2 ${option.preview}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Recurrence</Label>
              <div className="flex items-center mt-1">
                <Repeat className="w-4 h-4 mr-2 text-gray-500" />
                <Select value={formData.recurrenceType} onValueChange={(value: RecurrenceType) => setFormData(prev => ({ ...prev, recurrenceType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.recurrenceType !== 'none' && (
              <>
                <div>
                  <Label htmlFor="interval">Repeat Every</Label>
                  <div className="flex items-center mt-1 space-x-2">
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      value={formData.recurrenceInterval}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) }))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">
                      {formData.recurrenceType === 'daily' ? 'day(s)' :
                       formData.recurrenceType === 'weekly' ? 'week(s)' :
                       formData.recurrenceType === 'monthly' ? 'month(s)' : 'day(s)'}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.recurrenceEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {event ? 'Update Event' : 'Create Event'}
              </Button>
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  className="px-3"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default EventForm;
