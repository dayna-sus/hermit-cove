import { getCrabStageFromProgress } from "@/lib/course-data";

interface CrabProgressProps {
  completedSuggestions: number;
  size?: "sm" | "md" | "lg" | "xl";
  showProgress?: boolean;
}

export default function CrabProgress({ 
  completedSuggestions, 
  size = "md", 
  showProgress = true 
}: CrabProgressProps) {
  const crabStage = getCrabStageFromProgress(completedSuggestions);
  
  const sizeClasses = {
    sm: "w-16 h-16 text-3xl",
    md: "w-24 h-24 text-4xl",
    lg: "w-32 h-32 text-6xl",
    xl: "w-40 h-40 text-8xl"
  };

  const progressPercent = Math.min((completedSuggestions / 42) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div 
          className={`
            ${sizeClasses[size]} 
            bg-gradient-to-br from-accent to-secondary 
            rounded-full flex items-center justify-center 
            float-animation crab-emergence shadow-lg
          `}
          data-testid="crab-visualization"
        >
          <span className="transform transition-all duration-500">
            {crabStage.emoji}
          </span>
        </div>
        
        {showProgress && (
          <div 
            className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold shadow-md"
            data-testid="progress-badge"
          >
            {Math.round(progressPercent)}%
          </div>
        )}
      </div>
      
      <div className="text-center">
        <div className="text-sm font-medium text-foreground" data-testid="stage-description">
          {crabStage.description}
        </div>
        {showProgress && (
          <div className="text-xs text-muted-foreground mt-1" data-testid="suggestion-count">
            {completedSuggestions}/42 suggestions completed
          </div>
        )}
      </div>
    </div>
  );
}
