import React from 'react';
import { Play, Maximize2, Volume2, Settings, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

export default function VideoPlayer({ videoUrl, title, className }: VideoPlayerProps) {
  // Extract YouTube video ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl);

  if (!videoId) {
    return (
      <div className={cn("bg-slate-900 rounded-[32px] flex flex-col items-center justify-center p-12 text-center", className)}>
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white/40 mb-6">
          <Play size={32} />
        </div>
        <h3 className="text-white font-black uppercase tracking-tight mb-2">Source vidéo non supportée</h3>
        <p className="text-white/40 text-xs font-medium max-w-xs">{videoUrl}</p>
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 flex items-center gap-2 text-church-blue text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
        >
          Ouvrir dans un nouvel onglet
          <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      <div className="aspect-video bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl relative border border-white/5">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1&showinfo=0&controls=1`}
          title={title || "Sermon Video"}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      
      {/* Visual Accents */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-church-blue/10 rounded-full blur-2xl -z-10 group-hover:bg-church-blue/20 transition-all duration-700" />
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-church-gold/10 rounded-full blur-2xl -z-10 group-hover:bg-church-gold/20 transition-all duration-700" />
    </div>
  );
}
