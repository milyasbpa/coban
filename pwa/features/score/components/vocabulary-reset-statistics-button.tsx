import React, { useState } from "react";
import { Button } from "@/pwa/core/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/pwa/core/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/pwa/core/components/dialog";
import { useVocabularyScoreStore } from "../store/vocabulary-score.store";
import { VocabularyStorageManager } from "../storage/vocabulary-storage";

export const VocabularyResetStatisticsButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  const {
    currentUserScore,
    resetProgress,
    isInitialized,
  } = useVocabularyScoreStore();

  const handleOpenDialog = async () => {
    if (!currentUserScore || !isInitialized) return;

    setIsDialogOpen(true);
    setIsLoading(true);

    try {
      // Get analytics data from current user score
      const allMastery = Object.values(currentUserScore.vocabularyMastery);
      const totalVocabulary = allMastery.length;
      const masteredVocabulary = allMastery.filter(
        (vocab) => vocab.masteryScore >= 90 // 90% or more is considered mastered
      ).length;
      
      // Calculate average progress
      const totalScore = allMastery.reduce((sum, vocab) => sum + vocab.masteryScore, 0);
      const averageProgress = totalVocabulary > 0 
        ? Math.round((totalScore / (totalVocabulary * 100)) * 100)
        : 0;

      setAnalyticsData({
        totalVocabulary,
        masteredVocabulary,
        averageProgress,
      });

      // Get storage info
      const storage = await VocabularyStorageManager.getStorageInfo();
      setStorageInfo(storage);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!currentUserScore) return;

    setIsLoading(true);
    try {
      await resetProgress();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to reset statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUserScore || !isInitialized) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleOpenDialog}
        >
          Reset Vocabulary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reset Vocabulary Statistics</DialogTitle>
          <DialogDescription>
            This will permanently delete all your vocabulary learning progress. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analyticsData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Vocabulary:</span>
                    <span className="font-medium">{analyticsData.totalVocabulary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mastered Vocabulary:</span>
                    <span className="font-medium">{analyticsData.masteredVocabulary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Progress:</span>
                    <span className="font-medium">{analyticsData.averageProgress}%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {storageInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Storage Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <span>Vocabulary Records:</span>
                    <span className="font-medium">{storageInfo.vocabularyStorageLength} records</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleReset}
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset All Statistics"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
