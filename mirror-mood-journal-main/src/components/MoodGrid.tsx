import { useEffect, useState } from 'react';

interface MoodGridProps {
  onDateSelect?: (date: Date | undefined) => void;
}

interface DayData {
  emotion: string;
  steps: number;
  deep_sleep: number;
  rem_sleep: number;
  light_sleep: number;
}

const MoodGrid = ({ onDateSelect }: MoodGridProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<{ [key: string]: DayData }>({});
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);

  // Fetch calendar data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        console.log('Fetched data:', data);
        if (data && data.data) {
          setCalendarData(data.data);
          console.log('Calendar data set:', data.data);
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };

    fetchData();
  }, []);

  // Helper function to get emotion color
  const getEmotionColor = (emotion: string): string => {
    console.log('Getting color for emotion:', emotion);
    switch (emotion?.toLowerCase()) {
      case 'positive':
        return 'bg-green-500/30'; // 30% opacity green
      case 'neutral':
        return 'bg-yellow-500/30'; // 30% opacity yellow
      case 'negative':
        return 'bg-red-500/30'; // 30% opacity red
      default:
        return 'bg-transparent';
    }
  };

  // Helper function to get days in month
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Add this helper function to format dates consistently
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date click
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(clickedDate);
    
    const dateKey = formatDateKey(clickedDate);
    console.log('Clicked date key:', dateKey);
    console.log('Available data:', calendarData);
    const dayData = calendarData[dateKey];
    console.log('Found day data:', dayData);
    setSelectedDayData(dayData || null);

    if (onDateSelect) {
      onDateSelect(clickedDate);
    }
  };

  // Render calendar days
  const renderDays = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentMonth);
    
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateKey = formatDateKey(currentDate);
      const dayData = calendarData[dateKey];
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth.getMonth();
      
      const emotionColor = dayData ? getEmotionColor(dayData.emotion) : '';
      
      days.push(
        <div
          key={day}
          className={`p-2 rounded cursor-pointer ${
            isSelected ? 'bg-blue-500 text-white' : emotionColor
          } text-white`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  // Handle month navigation
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  return (
    <div className="rounded-lg backdrop-blur-sm bg-white/10 p-6 animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-white">Mood Calendar</h2>
      
      {/* Month Navigation */}
      <div className="flex justify-between w-full mb-4">
        <button onClick={() => changeMonth('prev')} className="text-white">Previous</button>
        <span className="text-white">
          {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
        </span>
        <button onClick={() => changeMonth('next')} className="text-white">Next</button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {renderDays()}
      </div>

      {/* Selected Date Info */}
      {selectedDate && selectedDayData && (
        <div className="mt-4 text-white">
          <p className="text-lg font-semibold mb-2">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1">
                <span className="font-medium">Emotion:</span> {selectedDayData.emotion}
              </p>
              <p className="mb-1">
                <span className="font-medium">Steps:</span> {selectedDayData.steps.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="mb-1">
                <span className="font-medium">Deep Sleep:</span> {selectedDayData.deep_sleep} min
              </p>
              <p className="mb-1">
                <span className="font-medium">REM Sleep:</span> {selectedDayData.rem_sleep} min
              </p>
              <p className="mb-1">
                <span className="font-medium">Light Sleep:</span> {selectedDayData.light_sleep} min
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodGrid;