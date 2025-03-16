
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerContext } from '@/context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const MusicPlayer = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);
  
  const { 
    currentSongId, 
    currentSongTitle, 
    currentSongArtist, 
    currentSongThumbnail,
    audioUrl,
    isPlaying,
    setIsPlaying,
    stopPlayback
  } = usePlayerContext();

  useEffect(() => {
    // Only load YouTube API if we have a song
    if (!currentSongId) return;

    // Create YouTube player when audioUrl changes
    if (playerRef.current && audioUrl) {
      playerRef.current.src = audioUrl;
    }
  }, [audioUrl, currentSongId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (playerRef.current) {
      const iframe = playerRef.current;
      const command = isPlaying ? 'pauseVideo' : 'playVideo';
      iframe.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func: command
      }), '*');
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    setCurrentTime(newTime);
    
    if (playerRef.current) {
      const iframe = playerRef.current;
      iframe.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [newTime, true]
      }), '*');
    }
  };

  const handleVolumeClick = (e: React.MouseEvent) => {
    if (!volumeRef.current) return;
    
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (playerRef.current) {
      const iframe = playerRef.current;
      iframe.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func: 'setVolume',
        args: [newVolume * 100]
      }), '*');
    }
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    if (playerRef.current) {
      const iframe = playerRef.current;
      iframe.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func: newMuteState ? 'mute' : 'unMute'
      }), '*');
    }
  };

  // Update progress bar and time display
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && duration > 0) {
        setCurrentTime((prev) => {
          const newTime = prev + 0.5;
          return newTime > duration ? 0 : newTime;
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

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
            <button onClick={stopPlayback} className="text-muted-foreground hover:text-white ml-2">
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* YouTube iframe (hidden) */}
        <iframe
          ref={playerRef}
          src={audioUrl}
          className="absolute left-0 top-0 w-0 h-0 opacity-0 invisible"
          allow="autoplay; encrypted-media"
          title="YouTube video player"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPlayer;
