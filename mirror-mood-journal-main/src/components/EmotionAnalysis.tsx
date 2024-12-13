import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Heart, Smile, Moon, Footprints, FrownIcon, SmileIcon, MehIcon } from "lucide-react";
import { useState, useEffect } from "react";

// Helper function to convert sleep time string to minutes
const convertSleepToMinutes = (sleepTime: string) => {
  const [hours, minutes] = sleepTime.split('h ');
  return parseInt(hours) * 60 + parseInt(minutes.replace('m', ''));
};

// Generate mock data for December 2023
const generateMockData = () => {
  const data: Record<string, any> = {};
  const endDate = new Date(); // Use current date as end date
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30); // Generate data for last 30 days
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    
    data[dateKey] = {
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      happiness: Math.floor(Math.random() * 100),
      heartRate: Math.floor(Math.random() * (100 - 60) + 60),
      steps: Math.floor(Math.random() * (12000 - 5000) + 5000),
      deepSleep: `${Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`,
      lightSleep: `${Math.floor(Math.random() * 5)}h ${Math.floor(Math.random() * 60)}m`,
      remSleep: `${Math.floor(Math.random() * 3)}h ${Math.floor(Math.random() * 60)}m`,
      awake: `${Math.floor(Math.random() * 60)}m`,
      deepSleepMinutes: Math.floor(Math.random() * 240),
      lightSleepMinutes: Math.floor(Math.random() * 300),
      remSleepMinutes: Math.floor(Math.random() * 180),
      emotionalState: ["happy", "sad", "neutral"][Math.floor(Math.random() * 3)],
    };
  }
  
  return data;
};

const mockData = generateMockData();

const EmotionAnalysis = ({ selectedDate }: { selectedDate?: Date }) => {
  const [currentData, setCurrentData] = useState(mockData[Object.keys(mockData)[0]]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [sentiment, setSentiment] = useState<string>('neutral');

  // Function to fetch and update data
  const fetchAndUpdateData = async () => {
    try {
      const response = await fetch('http://localhost:8000/results');
      const data = await response.json();
      
      if (data.fitbit_results) {
        setHealthData(data.fitbit_results);
      }
      
      // Update sentiment
      if (data.audio_results?.sentiment && data.audio_results.sentiment.length > 0) {
        const sentimentString = data.audio_results.sentiment[0].sentiment.toString();
        if (sentimentString.includes('POSITIVE')) {
          setSentiment('positive');
        } else if (sentimentString.includes('NEGATIVE')) {
          setSentiment('negative');
        } else if (sentimentString.includes('NEUTRAL')) {
          setSentiment('neutral');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Listen for record button events
  useEffect(() => {
    const handleRecordButtonPress = () => {
      fetchAndUpdateData();
    };

    window.addEventListener('recordButtonPressed', handleRecordButtonPress);

    return () => {
      window.removeEventListener('recordButtonPressed', handleRecordButtonPress);
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAndUpdateData();
  }, []);

  useEffect(() => {
    // If no date is selected, use current date
    const baseDate = selectedDate || new Date();
    
    // Calculate dates for the last week
    const endDate = new Date(baseDate);
    const startDate = new Date(baseDate);
    startDate.setDate(endDate.getDate() - 6); // Get 7 days of data (including current day)
    
    const weekData = [];
    
    // Generate array of last 7 days
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      if (mockData[dateKey]) {
        weekData.push({
          ...mockData[dateKey],
          deepSleepMinutes: convertSleepToMinutes(mockData[dateKey].deepSleep),
          lightSleepMinutes: convertSleepToMinutes(mockData[dateKey].lightSleep),
          remSleepMinutes: convertSleepToMinutes(mockData[dateKey].remSleep),
        });
      }
    }
    
    setChartData(weekData);

    // Update current data based on selected date or current date
    const currentDateKey = baseDate.toISOString().split('T')[0];
    const newData = mockData[currentDateKey];
    if (newData) {
      setCurrentData(newData);
    }
  }, [selectedDate]);

  const getEmotionIcon = (state: string) => {
    switch(state.toLowerCase()) {
      case "positive":
        return <SmileIcon className="w-8 h-8 mx-auto mb-2 text-green-400" />;
      case "negative":
        return <FrownIcon className="w-8 h-8 mx-auto mb-2 text-red-400" />;
      case "neutral":
        return <MehIcon className="w-8 h-8 mx-auto mb-2 text-yellow-400" />;
      default:
        return <MehIcon className="w-8 h-8 mx-auto mb-2 text-yellow-400" />;
    }
  };

  return (
    <div className="rounded-lg backdrop-blur-sm bg-white/10 p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Real-time Analysis</h2>
      </div>
      
      <div className="grid grid-cols-8 gap-4 mb-6">
        <div className="col-span-2 text-center p-4 rounded-lg bg-white/5">
          {getEmotionIcon(sentiment)}
          <p className="text-sm text-white/70">Emotion</p>
          <p className="text-lg font-semibold text-white capitalize">{sentiment}</p>
        </div>
        
        {healthData && (
          <>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <Heart className="w-8 h-8 mx-auto mb-2 text-mirror-purple" />
              <p className="text-sm text-white/70">Heart Rate</p>
              <p className="text-lg font-semibold text-white">
                {healthData.heart?.restingHeartRate || '--'} bpm
              </p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-white/5">
              <Footprints className="w-8 h-8 mx-auto mb-2 text-mirror-purple" />
              <p className="text-sm text-white/70">Steps</p>
              <p className="text-lg font-semibold text-white">
                {healthData.activity?.steps || '--'}
              </p>
            </div>

            {[
              { label: "Deep Sleep", value: healthData.sleep?.deep || '--' },
              { label: "Light Sleep", value: healthData.sleep?.light || '--' },
              { label: "REM", value: healthData.sleep?.rem || '--' },
              { label: "Awake", value: healthData.sleep?.wake || '--' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-4 rounded-lg bg-white/5">
                <Moon className="w-8 h-8 mx-auto mb-2 text-mirror-purple" />
                <p className="text-sm text-white/70">{label}</p>
                <p className="text-lg font-semibold text-white">{value} min</p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis yAxisId="left" stroke="#fff" />
            <YAxis yAxisId="right" orientation="right" stroke="#fff" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1F2C",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" name="Happiness" dataKey="happiness" stroke="#9b87f5" />
            <Line yAxisId="left" type="monotone" name="Steps" dataKey="steps" stroke="#98FB08" />
            <Line yAxisId="right" type="monotone" name="Deep Sleep (min)" dataKey="deepSleepMinutes" stroke="#4CAF50" />
            <Line yAxisId="right" type="monotone" name="Light Sleep (min)" dataKey="lightSleepMinutes" stroke="#2196F3" />
            <Line yAxisId="right" type="monotone" name="REM Sleep (min)" dataKey="remSleepMinutes" stroke="#9C27B0" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmotionAnalysis;


