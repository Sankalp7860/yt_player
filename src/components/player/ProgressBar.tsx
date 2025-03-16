
import { formatTime } from '@/utils/formatTime';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  progressRef: React.RefObject<HTMLDivElement>;
  onProgressClick: (e: React.MouseEvent) => void;
}

const ProgressBar = ({ 
  currentTime, 
  duration, 
  progressRef, 
  onProgressClick 
}: ProgressBarProps) => {
  return (
    <div className="flex items-center w-full space-x-2">
      <span className="text-xs">{formatTime(currentTime)}</span>
      <div 
        ref={progressRef}
        className="h-1.5 bg-white/20 rounded-full flex-1 cursor-pointer"
        onClick={onProgressClick}
      >
        <div 
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>
      <span className="text-xs">{formatTime(duration)}</span>
    </div>
  );
};

export default ProgressBar;
