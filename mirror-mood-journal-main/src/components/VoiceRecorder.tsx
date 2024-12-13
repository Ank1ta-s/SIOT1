import { useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleRecordingToggle = async () => {
    try {
      if (!isRecording) {
        const startResponse = await fetch('http://localhost:8000/start-recording', {
          method: 'POST',
        });
        if (!startResponse.ok) throw new Error('Failed to start recording');
        setIsRecording(true);
      } else {
        setIsRecording(false);
        setIsProcessing(true);
        
        const stopResponse = await fetch('http://localhost:8000/stop-recording', {
          method: 'POST',
        });
        if (!stopResponse.ok) throw new Error('Failed to stop recording');
        
        // Dispatch event to trigger EmotionAnalysis update
        window.dispatchEvent(new Event('recordButtonPressed'));
        
        const resultsResponse = await fetch('http://localhost:8000/results');
        const data = await resultsResponse.json();
        setSummary(data.audio_results.summary);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-lg backdrop-blur-sm bg-white/10 p-6 animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-white">Daily Voice Journal</h2>
      <div className="flex flex-col items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "w-16 h-16 rounded-full",
            isRecording && "bg-red-500/20 border-red-500"
          )}
          onClick={handleRecordingToggle}
        >
          {isRecording ? (
            <MicOff className="w-8 h-8 text-red-500" />
          ) : (
            <Mic className="w-8 h-8 text-mirror-purple" />
          )}
        </Button>
        <p className="text-white/70">
          {isRecording ? "Recording... Click to stop" : "Click to start recording"}
        </p>
        {isProcessing && (
          <div className="flex items-center gap-2 text-white/70">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing recording...</span>
          </div>
        )}
      </div>
      {summary && (
        <div className="mt-6 p-4 rounded-lg bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
          <p className="text-white/90">{summary}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;