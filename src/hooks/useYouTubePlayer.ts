
import { useState, useEffect, useRef } from 'react';
import { YouTubePlayer, YouTubePlayerState } from '@/types/youtube';

interface UseYouTubePlayerProps {
  videoId: string | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

interface UseYouTubePlayerReturn {
  playerReady: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playerInstanceRef: React.MutableRefObject<YouTubePlayer | null>;
  handlePlayPause: () => void;
  handleProgressClick: (e: React.MouseEvent, progressRef: React.RefObject<HTMLDivElement>) => void;
  handleVolumeClick: (e: React.MouseEvent, volumeRef: React.RefObject<HTMLDivElement>) => void;
  toggleMute: () => void;
  setVolume: (newVolume: number) => void;
}

export const useYouTubePlayer = ({
  videoId,
  isPlaying,
  setIsPlaying
}: UseYouTubePlayerProps): UseYouTubePlayerReturn => {
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const playerInstanceRef = useRef<YouTubePlayer | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
  // Load YouTube API
  useEffect(() => {
    if (!videoId) return;
    
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
  }, [videoId]);

  const initializePlayer = () => {
    if (!videoId || !window.YT || !window.YT.Player) return;
    
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
        videoId: videoId,
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
  };

  const onPlayerStateChange = (event: any) => {
    // YT.PlayerState.PLAYING = 1
    if (event.data === YouTubePlayerState.PLAYING && !isPlaying) {
      setIsPlaying(true);
    }
    
    // YT.PlayerState.PAUSED = 2
    if (event.data === YouTubePlayerState.PAUSED && isPlaying) {
      setIsPlaying(false);
    }
    
    // YT.PlayerState.ENDED = 0
    if (event.data === YouTubePlayerState.ENDED) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube player error:', event);
    setIsPlaying(false);
  };

  // Start progress tracking
  useEffect(() => {
    const trackProgress = () => {
      if (playerInstanceRef.current && playerReady) {
        try {
          const currentTimeValue = playerInstanceRef.current.getCurrentTime();
          setCurrentTime(currentTimeValue);
        } catch (error) {
          console.error('Error getting current time:', error);
        }
      }
    };
    
    // Clear existing interval if it exists
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    
    // Set new interval
    progressIntervalRef.current = window.setInterval(trackProgress, 1000);
    
    // Cleanup on unmount
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
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

  const handleProgressClick = (e: React.MouseEvent, progressRef: React.RefObject<HTMLDivElement>) => {
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

  const handleVolumeClick = (e: React.MouseEvent, volumeRef: React.RefObject<HTMLDivElement>) => {
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

  return {
    playerReady,
    currentTime,
    duration,
    volume,
    isMuted,
    playerInstanceRef,
    handlePlayPause,
    handleProgressClick,
    handleVolumeClick,
    toggleMute,
    setVolume
  };
};
