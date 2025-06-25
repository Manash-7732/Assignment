
import React from 'react';
import Calendar from '@/components/Calendar';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Event Calendar</h1>
          <p className="text-gray-600">Manage your schedule with ease</p>
        </header>
        <Calendar />
      </div>
    </div>
  );
};

export default Index;
