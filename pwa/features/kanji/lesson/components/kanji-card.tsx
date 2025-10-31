"use client";

import { Badge } from "@/pwa/core/components/badge";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Volume2 } from "lucide-react";
import { KanjiDetail } from "../utils/kanji";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { useKanjiSelection } from "../store/kanji-selection.store";
import { useDisplayOptions } from "../store/display-options.store";
import { cn } from "@/pwa/core/lib/utils";

interface KanjiCardProps {
  kanji: KanjiDetail;
  index: number;
}

export function KanjiCard({ kanji, index }: KanjiCardProps) {
  const { isIndonesian } = useLanguage();
  const { isSelectionMode, selectedKanjiIds, toggleKanjiSelection } = useKanjiSelection();
  const { displayOptions } = useDisplayOptions();
  const isSelected = selectedKanjiIds.has(kanji.id);

  const handleAudioPlay = async (text: string, wordInfo?: string) => {
    try {
      // Method 1: Web Speech API (fallback)  
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.8; // Slower rate for better pronunciation
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Get Japanese voices
        const voices = speechSynthesis.getVoices();
        const japaneseVoice = voices.find(voice => 
          voice.lang.includes('ja') || voice.name.includes('Japanese')
        );
        
        if (japaneseVoice) {
          utterance.voice = japaneseVoice;
        }
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
      // Fallback: Just log the word
      console.log('Playing audio for:', wordInfo || text, '- pronunciation:', text);
    }
  };

  const handleCardClick = () => {
    if (isSelectionMode) {
      toggleKanjiSelection(kanji.id);
    }
  };

  const kanjiMeaning = isIndonesian ? kanji.meanings.id : kanji.meanings.en;

  return (
    <Card 
      className={cn(
        "p-4 space-y-0 bg-card border transition-all duration-200 cursor-pointer gap-2",
        isSelectionMode && "hover:shadow-md",
        isSelected && "border-primary bg-primary/5 shadow-md",
        !isSelected && "border-border shadow-sm hover:shadow-md"
      )}
      onClick={handleCardClick}
    >
      {/* Main layout - flex start */}
      <div className="flex gap-3 items-start">
        {/* Index and Kanji on same row */}
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {index}
          </span>
          
          <div className="flex flex-col items-center space-y-1">
            {/* Kanji character display */}
            <div className="w-16 h-16 bg-linear-to-br from-amber-100 to-amber-200 dark:from-amber-200/20 dark:to-amber-300/20 rounded-lg flex items-center justify-center border border-amber-200/50 shadow-inner">
              <span className="text-2xl font-bold text-amber-900 dark:text-amber-100 select-none">
                {kanji.character}
              </span>
            </div>
            
            {/* Kanji meaning */}
            {displayOptions.meaning && (
              <div className="text-xs font-medium text-muted-foreground text-center">
                {kanjiMeaning}
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Readings */}
        <div className="flex-1 space-y-2">
          {/* KUN reading */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5"
            >
              KUN
            </Badge>
            <span className="text-sm font-medium text-foreground">
              {kanji.readings.kun.length > 0 
                ? kanji.readings.kun.map((reading) => `${reading.furigana} (${reading.romanji})`).join("、")
                : "—"
              }
            </span>
          </div>
          
          {/* ON reading */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-0.5"
            >
              ON
            </Badge>
            <span className="text-sm font-medium text-foreground">
              {kanji.readings.on.length > 0 
                ? kanji.readings.on.map((reading) => `${reading.furigana} (${reading.romanji})`).join("、")
                : "—"
              }
            </span>
          </div>
        </div>
      </div>

      {/* Words Section Badge */}
      <div className="flex items-center gap-2 pt-2">
        <Badge 
          variant="secondary" 
          className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5"
        >
          {isIndonesian ? 'Kata' : 'Words'}
        </Badge>
        <div className="flex-1 h-px bg-border/20"></div>
      </div>

      {/* Example words */}
      <div className="space-y-1.5 pt-1">
        {kanji.examples.map((example, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_auto] gap-2 items-center text-sm">
            {/* Word content with fixed layout */}
            <div className="grid grid-cols-[auto_1fr] gap-2 items-baseline min-w-0">
              {/* Left side - Word and readings */}
              <div className="flex items-baseline gap-1 shrink-0">
                {displayOptions.japanese && (
                  <span className="font-semibold text-foreground">
                    {example.word}
                  </span>
                )}
                {displayOptions.furigana && (
                  <span className="text-muted-foreground text-xs">
                    【{example.furigana}】
                  </span>
                )}
                {displayOptions.romanji && (
                  <span className="text-muted-foreground">
                    ({example.romanji})
                  </span>
                )}
              </div>
              
              {/* Right side - Colon and meaning with consistent alignment */}
              {displayOptions.meaning && (
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-muted-foreground shrink-0">:</span>
                  <span className="text-muted-foreground truncate">
                    {isIndonesian ? example.meaning_id : example.meaning_en}
                  </span>
                </div>
              )}
            </div>
            
            {/* Audio button for each word */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAudioPlay(example.furigana, example.word);
              }}
              className="w-6 h-6 p-0 rounded-full bg-muted hover:bg-accent/20 border border-border transition-colors shrink-0"
            >
              <Volume2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}