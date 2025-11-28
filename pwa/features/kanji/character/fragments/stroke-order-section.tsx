"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { getCharacterData } from "../utils/character-data";

export function StrokeOrderSection() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const level = searchParams.get("level") || "N5";
  
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);
  
  const [strokeData, setStrokeData] = useState<any>(null);
  const [hasError, setHasError] = useState(false);

  if (!id) {
    return null;
  }

  const character = getCharacterData(id, level);
  if (!character) {
    return null;
  }

  // Load stroke data and setup HanziWriter
  useEffect(() => {
    if (!svgContainerRef.current || !character?.character) return;

    svgContainerRef.current.innerHTML = "";

    // Load stroke data for numbers
    HanziWriter.loadCharacterData(character.character)
      .then((data) => {
        setStrokeData(data);
        setHasError(false);
      })
      .catch((error) => {
        console.warn("Failed to load stroke data:", error);
        setHasError(true);
      });

    // Setup HanziWriter for animation
    try {
      const writer = HanziWriter.create(svgContainerRef.current, character.character, {
        width: 240,
        height: 240,
        padding: 20,
        showOutline: true,
        showCharacter: false,
        strokeColor: '#3b82f6',
        radicalColor: '#3b82f6',
        outlineColor: '#cbd5e1',
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 300,
      });

      writerRef.current = writer;
      setHasError(false);
    } catch (error) {
      console.warn("Failed to create animation:", error);
      setHasError(true);
    }
  }, [character?.character]);

  // Render stroke numbers outside the strokes
  useEffect(() => {
    if (!svgContainerRef.current || !strokeData) return;

    // Find the SVG element created by HanziWriter
    const svg = svgContainerRef.current.querySelector('svg');
    if (!svg) return;

    // Remove existing number labels
    const existingLabels = svg.querySelectorAll('.stroke-number-label');
    existingLabels.forEach(label => label.remove());

    const size = 240;
    const padding = 20;
    
    // Add stroke numbers positioned intelligently based on stroke path
    strokeData.medians.forEach((median: number[][], index: number) => {
      if (!median || median.length === 0) return;

      // Get the start point of the stroke for number placement
      const startPoint = median[0];
      
      // Transform coordinates to match HanziWriter's coordinate system
      const scale = (size - 2 * padding) / 1024;
      const x = startPoint[0] * scale + padding;
      const y = size - (startPoint[1] * scale + padding);

      // Calculate optimal offset based on stroke direction and position
      let offsetX = 0;
      let offsetY = 0;
      
      if (median.length > 1) {
        const secondPoint = median[1];
        const dx = secondPoint[0] - startPoint[0];
        const dy = secondPoint[1] - startPoint[1];
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
          // Normalize direction
          const normalizedDx = dx / length;
          const normalizedDy = dy / length;
          
          // Create offset perpendicular to stroke direction
          // Use smaller offset for better alignment
          const offsetDistance = 18;
          
          // Position based on quadrant and direction
          // Prioritize placing numbers in empty space
          if (Math.abs(normalizedDx) > Math.abs(normalizedDy)) {
            // Mostly horizontal stroke
            offsetX = normalizedDx > 0 ? -offsetDistance : offsetDistance;
            offsetY = -8;
          } else {
            // Mostly vertical stroke
            offsetX = -8;
            offsetY = normalizedDy > 0 ? -offsetDistance : offsetDistance;
          }
          
          // Additional adjustment: push numbers away from center
          const centerX = size / 2;
          const centerY = size / 2;
          if (x < centerX) offsetX -= 4;
          if (x > centerX) offsetX += 4;
          if (y < centerY) offsetY -= 4;
          if (y > centerY) offsetY += 4;
        }
      } else {
        // Single point stroke, use position-based offset
        const centerX = size / 2;
        const centerY = size / 2;
        offsetX = x < centerX ? -12 : 12;
        offsetY = y < centerY ? -12 : 12;
      }

      // Create text element for stroke number with background for better readability
      const textBg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      textBg.classList.add('stroke-number-label');
      textBg.setAttribute("cx", (x + offsetX).toString());
      textBg.setAttribute("cy", (y + offsetY).toString());
      textBg.setAttribute("r", "8");
      textBg.setAttribute("fill", "rgba(0, 0, 0, 0.7)");
      svg.appendChild(textBg);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.classList.add('stroke-number-label');
      text.setAttribute("x", (x + offsetX).toString());
      text.setAttribute("y", (y + offsetY).toString());
      text.setAttribute("font-size", "10");
      text.setAttribute("font-weight", "bold");
      text.setAttribute("fill", "#ef4444");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.textContent = (index + 1).toString();
      
      svg.appendChild(text);
    });
  }, [strokeData]);

  const handleClick = () => {
    if (!writerRef.current) return;
    
    // Reset and animate
    writerRef.current.hideCharacter({ duration: 0 });
    writerRef.current.animateCharacter();
  };

  // Fallback if HanziWriter fails
  if (hasError) {
    return (
      <div className="p-6 bg-background">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-lg font-semibold">Stroke Order</h2>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-48 h-48 bg-muted/20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                <span className="text-8xl font-bold text-foreground select-none">
                  {character.character}
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {character.strokes} strokes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background">
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Stroke Order</h2>

        <div className="bg-card border border-border rounded-lg p-6">
          <div 
            ref={svgContainerRef}
            onClick={handleClick}
            className="flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors rounded-lg"
          />
          <p className="text-xs text-muted-foreground text-center mt-4">
            Tap to see animation • {character.strokes} strokes
          </p>
        </div>
      </div>
    </div>
  );
}
