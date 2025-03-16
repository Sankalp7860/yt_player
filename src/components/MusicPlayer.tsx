
import { useRef } from 'react';
import { X } from 'lucide-react';
import { usePlayerContext } from '@/context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';

// Components
import PlayerControls from '@/components/player/PlayerControls';
import ProgressBar from '@/components/player/ProgressBar';
import VolumeControl from '@/components/player/VolumeControl';

const MusicPlayer = () => {
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentSongId, 
    currentSongTitle, 
    currentSongArtist, 
    currentSongThumbnail,
    isPlaying,
    setIsPlaying,
    stopPlayback
  } = usePlayerContext();

  const {
    currentTime,
    duration,
    volume,
    isMuted,
    handlePlayPause,
    handleProgressClick,
    handleVolumeClick,
    toggleMute
  } = useYouTubePlayer({
    videoId: currentSongId,
    isPlaying,
    setIsPlaying
  });

  const handleProgressBarClick = (e: React.MouseEvent) => {
    handleProgressClick(e, progressRef);
  };

  const handleVolumeBarClick = (e: React.MouseEvent) => {
    handleVolumeClick(e, volumeRef);
  };

  if (!currentSongId) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 p-3 z-50"
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          {/* Song info */}
          <div className="flex items-center space-x-3">
            <img 
              src={currentSongThumbnail} 
              alt={currentSongTitle}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="hidden sm:block">
              <h4 className="text-sm font-medium truncate max-w-[150px]">{currentSongTitle}</h4>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">{currentSongArtist}</p>
            </div>
          </div>
          
          {/* Player controls */}
          <div className="flex flex-col items-center flex-1 max-w-md px-4">
            <PlayerControls 
              isPlaying={isPlaying} 
              onPlayPause={handlePlayPause} 
            />
            
            <ProgressBar 
              currentTime={currentTime}
              duration={duration}
              progressRef={progressRef}
              onProgressClick={handleProgressBarClick}
            />
          </div>
          
          {/* Volume control */}
          <div className="hidden sm:flex items-center space-x-3">
            <VolumeControl 
              volume={volume}
              isMuted={isMuted}
              volumeRef={volumeRef}
              onVolumeClick={handleVolumeBarClick}
              onToggleMute={toggleMute}
            />
            <button 
              onClick={stopPlayback} 
              className="text-muted-foreground hover:text-white ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPlayer;
