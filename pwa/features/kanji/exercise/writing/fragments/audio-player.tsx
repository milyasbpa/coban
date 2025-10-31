import { Button } from '@/pwa/core/components/button';
import { Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl?: string;
  reading: string;
}

export function AudioPlayer({ audioUrl, reading }: AudioPlayerProps) {
  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
      <Button
        variant="outline"
        size="sm"
        onClick={playAudio}
        disabled={!audioUrl}
        className="shrink-0"
      >
        <Volume2 className="h-4 w-4" />
      </Button>
      <div>
        <p className="text-sm text-muted-foreground">Dengarkan audio dan rangkai kata:</p>
        <p className="font-medium">{reading}</p>
      </div>
    </div>
  );
}