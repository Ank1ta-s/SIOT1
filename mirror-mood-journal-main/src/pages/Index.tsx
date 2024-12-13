import MoodGrid from "@/components/MoodGrid";
import EmotionAnalysis from "@/components/EmotionAnalysis";
import VoiceRecorder from "@/components/VoiceRecorder";
import SuggestionsPanel from "@/components/SuggestionsPanel";
import { useState } from "react";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <div className="min-h-screen bg-mirror-background text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Emotional Wellbeing Diary</h1>
          <p className="text-white/70">Your daily companion for emotional awareness</p>
        </header>
        
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-8">
            <VoiceRecorder />
            <EmotionAnalysis selectedDate={selectedDate} />
            <div className="grid grid-cols-2 gap-8">
              <MoodGrid onDateSelect={handleDateSelect} />
              <SuggestionsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;