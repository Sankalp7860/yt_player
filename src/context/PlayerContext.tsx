
import { createContext, useContext, useState } from 'react';
import { getAudioUrl } from '@/utils/youtubeApi';

interface PlayerContextType {
  currentSongId: string | null;
  currentSongTitle: string;
  currentSongArtist: string;
  currentSongThumbnail: string;
  audioUrl: string;
  playSong: (id: string, title: string, artist: string, thumbnail: string) => void;
  stopPlayback: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [currentSongTitle, setCurrentSongTitle] = useState('');
  const [currentSongArtist, setCurrentSongArtist] = useState('');
  const [currentSongThumbnail, setCurrentSongThumbnail] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const playSong = (id: string, title: string, artist: string, thumbnail: string) => {
    setCurrentSongId(id);
    setCurrentSongTitle(title);
    setCurrentSongArtist(artist);
    setCurrentSongThumbnail(thumbnail);
    
    // In a real app, this would use a proper method to get the audio URL
    // For this demo, we're using a fake URL generator
    setAudioUrl(getAudioUrl(id));
  };

  const stopPlayback = () => {
    setCurrentSongId(null);
    setCurrentSongTitle('');
    setCurrentSongArtist('');
    setCurrentSongThumbnail('');
    setAudioUrl('');
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSongId,
        currentSongTitle,
        currentSongArtist,
        currentSongThumbnail,
        audioUrl,
        playSong,
        stopPlayback,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};
