
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  volumeRef: React.RefObject<HTMLDivElement>;
  onVolumeClick: (e: React.MouseEvent) => void;
  onToggleMute: () => void;
}

const VolumeControl = ({ 
  volume, 
  isMuted, 
  volumeRef, 
  onVolumeClick, 
  onToggleMute 
}: VolumeControlProps) => {
  return (
    <div className="flex items-center space-x-3">
      <button 
        onClick={onToggleMute} 
        className="text-muted-foreground hover:text-white transition-colors"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      <div 
        ref={volumeRef}
        className="h-1.5 bg-white/20 rounded-full w-24 cursor-pointer"
        onClick={onVolumeClick}
      >
        <div 
          className={cn("h-full rounded-full", isMuted ? "bg-muted" : "bg-blue-500")}
          style={{ width: `${volume * 100}%` }}
        />
      </div>
    </div>
  );
};

export default VolumeControl;
