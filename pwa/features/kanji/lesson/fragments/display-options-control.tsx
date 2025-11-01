"use client";

import { useState } from "react";
import { Button } from "@/pwa/core/components/button";
import { Card } from "@/pwa/core/components/card";
import { Badge } from "@/pwa/core/components/badge";
import { Settings, Eye, EyeOff } from "lucide-react";
import { useDisplayOptions } from "../store/display-options.store";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import { cn } from "@/pwa/core/lib/utils";

export function DisplayOptionsControl() {
  const [isOpen, setIsOpen] = useState(false);
  const { isIndonesian } = useLanguage();
  const {
    displayOptions,
    toggleFurigana,
    toggleJapanese,
    toggleMeaning,
    toggleRomanji,
    resetToDefault
  } = useDisplayOptions();

  const options = [
    {
      key: 'furigana',
      label: 'Furigana',
      description: isIndonesian ? 'Teks bantuan baca' : 'Reading guide',
      isActive: displayOptions.furigana,
      toggle: toggleFurigana,
    },
    {
      key: 'japanese',
      label: 'JP',
      description: isIndonesian ? 'Teks Jepang' : 'Japanese text',
      isActive: displayOptions.japanese,
      toggle: toggleJapanese,
    },
    {
      key: 'meaning',
      label: isIndonesian ? 'ID' : 'EN',
      description: isIndonesian ? 'Arti Indonesia' : 'English meaning',
      isActive: displayOptions.meaning,
      toggle: toggleMeaning,
    },
    {
      key: 'romanji',
      label: 'Romanji',
      description: isIndonesian ? 'Tulisan Latin' : 'Latin script',
      isActive: displayOptions.romanji,
      toggle: toggleRomanji,
    },
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
            isOpen && "bg-primary/90"
          )}
        >
          <Settings className={cn(
            "h-5 w-5 transition-transform duration-200",
            isOpen && "rotate-45"
          )} />
        </Button>
      </div>

      {/* Options Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Options Card */}
          <div className="fixed bottom-20 right-6 z-50">
            <Card className="p-4 w-72 bg-card border border-border shadow-xl">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">
                    {isIndonesian ? 'Opsi Tampilan' : 'Display Options'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToDefault}
                    className="text-xs h-6 px-2"
                  >
                    {isIndonesian ? 'Reset' : 'Reset'}
                  </Button>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {options.map((option) => (
                    <div
                      key={option.key}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                          option.isActive 
                            ? "border-primary bg-primary/10" 
                            : "border-muted-foreground/30"
                        )}>
                          {option.isActive ? (
                            <Eye className="h-4 w-4 text-primary" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary"
                              className="text-xs font-semibold px-2 py-0.5"
                            >
                              {option.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={option.toggle}
                        className="h-8 w-16 text-xs"
                      >
                        {option.isActive 
                          ? (isIndonesian ? 'Sembunyikan' : 'Hide')
                          : (isIndonesian ? 'Tampilkan' : 'Show')
                        }
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  );
}