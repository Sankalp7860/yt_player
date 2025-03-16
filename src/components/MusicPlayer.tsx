
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerContext } from '@/context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { YouTubePlayer } from '@/types/youtube';

const MusicPlayer = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerInstanceRef = useRef<YouTubePlayer | null>(null);
  
  const { 
    currentSongId, 
    currentSongTitle, 
    currentSongArtist, 
    currentSongThumbnail,
    isPlaying,
    setIsPlaying,
    stopPlayback
  } = usePlayerContext();

  // Load YouTube API
  useEffect(() => {
    if (!currentSongId) return;
    
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }
    
    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, [currentSongId]);

  const initializePlayer = () => {
    if (!currentSongId || !window.YT || !window.YT.Player) return;
    
    try {
      // Create a container for the player if it doesn't exist
      let playerContainer = document.getElementById('youtube-player-container');
      if (!playerContainer) {
        playerContainer = document.createElement('div');
        playerContainer.id = 'youtube-player-container';
        playerContainer.style.position = 'absolute';
        playerContainer.style.left = '-9999px';
        playerContainer.style.top = '-9999px';
        document.body.appendChild(playerContainer);
      }
      
      // Create new player instance
      playerInstanceRef.current = new window.YT.Player(playerContainer, {
        height: '0',
        width: '0',
        videoId: currentSongId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          showinfo: 0,
          rel: 0
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };

  const onPlayerReady = (event: any) => {
    setPlayerReady(true);
    
    // Set initial volume
    event.target.setVolume(volume * 100);
    
    // Get duration
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);
    
    // Start playing
    if (isPlaying) {
      event.target.playVideo();
    }
    
    // Start progress tracking
    startProgressTracking();
  };

  const onPlayerStateChange = (event: any) => {
    // YT.PlayerState.PLAYING = 1
    if (event.data === 1 && !isPlaying) {
      setIsPlaying(true);
    }
    
    // YT.PlayerState.PAUSED = 2
    if (event.data === 2 && isPlaying) {
      setIsPlaying(false);
    }
    
    // YT.PlayerState.ENDED = 0
    if (event.data === 0) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube player error:', event);
    stopPlayback();
  };

  const startProgressTracking = () => {
    const interval = setInterval(() => {
      if (playerInstanceRef.current && playerReady) {
        try {
          const currentTimeValue = playerInstanceRef.current.getCurrentTime();
          setCurrentTime(currentTimeValue);
        } catch (error) {
          console.error('Error getting current time:', error);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  };

  useEffect(() => {
    const interval = startProgressTracking();
    return () => clearInterval(interval);
  }, [playerReady]);

  // Handle play/pause
  useEffect(() => {
    if (!playerInstanceRef.current || !playerReady) return;
    
    try {
      if (isPlaying) {
        playerInstanceRef.current.playVideo();
      } else {
        playerInstanceRef.current.pauseVideo();
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  }, [isPlaying, playerReady]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current || !duration || !playerInstanceRef.current || !playerReady) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    try {
      playerInstanceRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (error) {
      console.error('Error seeking to time:', error);
    }
  };

  const handleVolumeClick = (e: React.MouseEvent) => {
    if (!volumeRef.current || !playerInstanceRef.current || !playerReady) return;
    
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    try {
      playerInstanceRef.current.setVolume(newVolume * 100);
      if (newVolume === 0) {
        playerInstanceRef.current.mute();
      } else {
        playerInstanceRef.current.unMute();
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const toggleMute = () => {
    if (!playerInstanceRef.current || !playerReady) return;
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    try {
      if (newMuteState) {
        playerInstanceRef.current.mute();
      } else {
        playerInstanceRef.current.unMute();
        playerInstanceRef.current.setVolume(volume * 100);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
            <button 
              onClick={toggleMute} 
              className="text-muted-foreground hover:text-white transition-colors"
            >
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
