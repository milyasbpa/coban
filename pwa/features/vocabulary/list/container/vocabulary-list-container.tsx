"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/pwa/core/components/button";
import { VocabularyItemCard } from "../components/vocabulary-item-card";
import { VocabularyService, VocabularyWord } from "@/pwa/core/services/vocabulary";

export function VocabularyListContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get categoryId and level from URL params
  const categoryIdFromUrl = searchParams.get('categoryId') || '1';
  const levelFromUrl = searchParams.get('level') || 'N5';
  
  const [vocabularyList, setVocabularyList] = useState<VocabularyWord[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVocabulary = async () => {
      setLoading(true);
      try {
        const categoryId = parseInt(categoryIdFromUrl);
        const category = VocabularyService.getVocabularyByCategory(categoryId, levelFromUrl);
        
        if (category) {
          setVocabularyList(category.vocabulary);
          setCategoryName(category.category.en);
        } else {
          setVocabularyList([]);
          setCategoryName('Unknown Category');
        }
      } catch (error) {
        console.error('Error loading vocabulary:', error);
        setVocabularyList([]);
        setCategoryName('Error');
      } finally {
        setLoading(false);
      }
    };

    loadVocabulary();
  }, [categoryIdFromUrl, levelFromUrl]);

  const handleBack = () => {
    router.back();
  };

  const handleVocabularyClick = (vocabulary: VocabularyWord) => {
    console.log(`Clicked vocabulary: ${vocabulary.kanji}`);
    // TODO: Navigate to vocabulary detail page or show modal
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading vocabulary...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div className="text-center">
          <h1 className="text-lg font-semibold">{categoryName}</h1>
          <p className="text-sm text-muted-foreground">{levelFromUrl} • {vocabularyList.length} words</p>
        </div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Vocabulary List */}
      <div className="p-4 pb-20 bg-background min-h-screen">
        <div className="max-w-2xl mx-auto space-y-1">
          {vocabularyList.length > 0 ? (
            vocabularyList.map((vocabulary, index) => (
              <VocabularyItemCard
                key={vocabulary.id}
                vocabulary={vocabulary}
                index={index + 1}
                onClick={handleVocabularyClick}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No vocabulary data available for this category
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-lg">
        <div className="flex items-center justify-center h-full">
          <div className="flex gap-3">
            <Button 
              variant="default" 
              size="sm"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg"
            >
              Hiragana
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg"
            >
              JP
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground px-4 py-2 rounded-lg"
            >
              EN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}