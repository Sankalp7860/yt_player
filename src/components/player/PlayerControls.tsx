
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

const PlayerControls = ({ isPlaying, onPlayPause }: PlayerControlsProps) => {
  return (
    <div className="flex items-center space-x-4 mb-1">
      <button className="text-muted-foreground hover:text-white transition-colors">
        <SkipBack size={20} />
      </button>
      <button 
        onClick={onPlayPause}
        className="bg-white text-black p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
      </button>
      <button className="text-muted-foreground hover:text-white transition-colors">
        <SkipForward size={20} />
      </button>
    </div>
  );
};

export default PlayerControls;
