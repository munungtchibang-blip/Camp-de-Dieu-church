import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface AudioPlayerProps {
  url: string;
  title: string;
}

export default function AudioPlayer({ url, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-white/5 relative overflow-hidden group/player">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-church-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover/player:bg-church-gold/10 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-church-gold mb-1">Écouter le message</p>
            <h4 className="text-white text-sm font-black uppercase tracking-tight truncate">{title}</h4>
          </div>
          {isLoading ? (
            <Loader2 className="animate-spin text-church-blue" size={20} />
          ) : (
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{formatTime(duration - currentTime)} restant</span>
          )}
        </div>

        <audio ref={audioRef} src={url} className="hidden" />

        {/* Progress Bar */}
        <div className="mb-6 relative">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-church-gold hover:accent-church-blue transition-all"
          />
          <div className="flex justify-between mt-2">
            <span className="text-[9px] font-bold text-white/30">{formatTime(currentTime)}</span>
            <span className="text-[9px] font-bold text-white/30">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 10; }}
              className="text-white/40 hover:text-white transition-colors"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 bg-church-gold rounded-2xl flex items-center justify-center text-church-dark shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={() => { if(audioRef.current) audioRef.current.currentTime += 10; }}
              className="text-white/40 hover:text-white transition-colors"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (audioRef.current) {
                  const newMuted = !isMuted;
                  audioRef.current.muted = newMuted;
                  setIsMuted(newMuted);
                }
              }}
              className="text-white/40 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white/40 hover:accent-church-gold transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
