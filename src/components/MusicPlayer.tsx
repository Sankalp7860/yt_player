
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerContext } from '@/context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentSongId, 
    currentSongTitle, 
    currentSongArtist, 
    currentSongThumbnail,
    audioUrl
  } = usePlayerContext();

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      setIsPlaying(true);
    }
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  const handleVolumeClick = (e: React.MouseEvent) => {
    if (volumeRef.current) {
      const rect = volumeRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      setVolume(Math.max(0, Math.min(1, percent)));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
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
            <div className="flex items-center space-x-4 mb-1">
              <button className="text-muted-foreground hover:text-white transition-colors">
                <SkipBack size={20} />
              </button>
              <button 
                onClick={handlePlayPause}
                className="bg-white text-black p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              </button>
              <button className="text-muted-foreground hover:text-white transition-colors">
                <SkipForward size={20} />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="flex items-center w-full space-x-2">
              <span className="text-xs">{formatTime(currentTime)}</span>
              <div 
                ref={progressRef}
                className="h-1.5 bg-white/20 rounded-full flex-1 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs">{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Volume control */}
          <div className="hidden sm:flex items-center space-x-3">
            <button onClick={toggleMute} className="text-muted-foreground hover:text-white transition-colors">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div 
              ref={volumeRef}
              className="h-1.5 bg-white/20 rounded-full w-24 cursor-pointer"
              onClick={handleVolumeClick}
            >
              <div 
                className={cn("h-full rounded-full", isMuted ? "bg-muted" : "bg-blue-500")}
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={handleTimeUpdate}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPlayer;
