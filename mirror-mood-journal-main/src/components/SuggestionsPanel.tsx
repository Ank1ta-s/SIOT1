import { useState, useEffect } from "react";

interface Suggestion {
  title: string;
  description: string;
}

const SuggestionBox = ({ title, description }: Suggestion) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`
        rounded-lg p-4 cursor-pointer transition-all duration-300
        ${isExpanded ? 'bg-gray-900/95' : 'bg-white/5 hover:bg-white/10'}
      `}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <h3 className="text-lg font-semibold text-white">{title || "Awaiting suggestion..."}</h3>
      {description && (
        <p className={`
          text-white/70 mt-2 whitespace-pre-line
          ${isExpanded ? 'h-auto' : 'line-clamp-2'}
        `}>
          {description}
        </p>
      )}
    </div>
  );
};

const SuggestionsPanel = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndProcessRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/results');
      const data = await response.json();
      
      if (data.recommendations) {
        // Split the recommendations string into parts
        const parts = data.recommendations.split('\n\n');
        const processedSuggestions: Suggestion[] = [];

        parts.forEach(part => {
          if (part.includes('Title:') && part.includes('Description:')) {
            const titleMatch = part.match(/Title: (.*)/);
            const descMatch = part.match(/Description: (.*)/s); // 's' flag for multiline

            if (titleMatch && descMatch) {
              processedSuggestions.push({
                title: titleMatch[1].trim(),
                description: descMatch[1].trim()
              });
            }
          }
        });

        console.log('Processed suggestions:', processedSuggestions);
        setSuggestions(processedSuggestions);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchAndProcessRecommendations();
  }, []);

  // Listen for recording completion
  useEffect(() => {
    const handleRecordingComplete = () => {
      console.log('Recording completed, fetching new suggestions...');
      fetchAndProcessRecommendations();
    };

    window.addEventListener('recordingComplete', handleRecordingComplete);
    return () => {
      window.removeEventListener('recordingComplete', handleRecordingComplete);
    };
  }, []);

  return (
    <div className="rounded-lg backdrop-blur-sm bg-white/10 p-6">
      <h2 className="text-2xl font-semibold mb-4 text-white">
        Suggestions
        {isLoading && <span className="ml-2 text-sm text-white/70">(Generating...)</span>}
      </h2>
      <div className="space-y-4">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <SuggestionBox 
              key={index}
              title={suggestion.title}
              description={suggestion.description}
            />
          ))
        ) : (
          // Show empty boxes while waiting
          Array(3).fill(null).map((_, index) => (
            <SuggestionBox 
              key={index}
              title=""
              description=""
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SuggestionsPanel;