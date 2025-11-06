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
import { useKanjiScoreStore } from "../store/kanji-score.store";
import { KanjiStorageManager } from "../storage/kanji-storage";

export const KanjiResetStatisticsButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  const {
    currentUserScore,
    resetStatistics,
    isInitialized,
  } = useKanjiScoreStore();

  const handleOpenDialog = async () => {
    if (!currentUserScore || !isInitialized) return;

    setIsDialogOpen(true);
    setIsLoading(true);

    try {
      // Get analytics data
      const analytics = await KanjiStorageManager.getKanjiAnalytics(currentUserScore.userId);
      setAnalyticsData(analytics);

      // Get storage info
      const storage = await KanjiStorageManager.getStorageInfo();
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
      await resetStatistics();
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
          Reset Kanji Statistics
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reset Kanji Statistics</DialogTitle>
          <DialogDescription>
            This will permanently delete all your kanji learning progress. This action cannot be undone.
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
                    <span>Total Kanji:</span>
                    <span className="font-medium">{analyticsData.totalKanji}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Words:</span>
                    <span className="font-medium">{analyticsData.totalWords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mastered Words:</span>
                    <span className="font-medium">{analyticsData.masteredWords}</span>
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
                    <span>Kanji Records:</span>
                    <span className="font-medium">{storageInfo.kanjiStorageLength} records</span>
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