"use client";

import { useState } from "react";
import { Button } from "@/pwa/core/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/pwa/core/components/dialog";
import { Badge } from "@/pwa/core/components/badge";
import { useScoreStore } from "@/pwa/features/score/store/score.store";
import { StorageManager } from "@/pwa/features/score/storage/storage";
import { devLog } from "@/pwa/core/config/env";
import { RotateCcw, Database, Trash2, AlertTriangle, Download } from "lucide-react";

export function ResetStatisticsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    scoreStorageLength: number;
    exerciseStorageLength: number;
    analyticsStorageLength: number;
  } | null>(null);
  const [userStats, setUserStats] = useState<{
    totalWords: number;
    masteredWords: number;
    totalKanji: number;
    averageProgress: number;
  } | null>(null);

  const { resetStatistics, currentUserScore, clearAllData } = useScoreStore();

  const handleOpenDialog = async () => {
    setIsOpen(true);
    try {
      // Get storage info
      const info = await StorageManager.getStorageInfo();
      setStorageInfo(info);

      // Get user analytics if user exists
      if (currentUserScore) {
        const analytics = await StorageManager.getUserAnalytics(currentUserScore.userId);
        setUserStats({
          totalWords: analytics.totalWords,
          masteredWords: analytics.masteredWords,
          totalKanji: analytics.totalKanji,
          averageProgress: analytics.averageProgress,
        });
      }
    } catch (error) {
      devLog("Failed to get storage info", error);
    }
  };

  const handleResetStatistics = async () => {
    if (!currentUserScore) {
      devLog("No user score available for reset");
      return;
    }

    setIsResetting(true);
    try {
      await resetStatistics();
      devLog("Statistics reset successfully");
      setIsOpen(false);
    } catch (error) {
      devLog("Failed to reset statistics", error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleClearAllData = async () => {
    setIsResetting(true);
    try {
      await clearAllData();
      devLog("All data cleared successfully");
      setIsOpen(false);
      // Optionally reload the page to reset the app state
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      devLog("Failed to clear all data", error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportData = async () => {
    if (!currentUserScore) {
      devLog("No user score available for export");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = await StorageManager.exportUserData(currentUserScore.userId);
      
      // Create and download file
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `coban-backup-${currentUserScore.userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      devLog("Data exported successfully");
    } catch (error) {
      devLog("Failed to export data", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
          onClick={handleOpenDialog}
        >
          <Database className="w-4 h-4 mr-2" />
          Dev Tools
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <DialogTitle>Development Tools</DialogTitle>
          </div>
          <DialogDescription>
            These tools are only available in development mode. Use with
            caution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Storage Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Storage Information</h4>
            {storageInfo ? (
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Score Storage:</span>
                  <Badge variant="secondary">
                    {storageInfo.scoreStorageLength} records
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Exercise Storage:</span>
                  <Badge variant="secondary">
                    {storageInfo.exerciseStorageLength} records
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Analytics Storage:</span>
                  <Badge variant="secondary">
                    {storageInfo.analyticsStorageLength} records
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Loading storage info...
              </div>
            )}
          </div>

          {/* User Information */}
          {currentUserScore && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Current User</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <Badge variant="outline">{currentUserScore.userId}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <Badge variant="outline">{currentUserScore.level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Kanji:</span>
                  <Badge variant="outline">
                    {userStats?.totalKanji || Object.keys(currentUserScore.kanjiMastery).length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Words:</span>
                  <Badge variant="outline">
                    {userStats?.totalWords || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Mastered Words:</span>
                  <Badge variant="outline">
                    {userStats?.masteredWords || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Average Progress:</span>
                  <Badge variant="outline">
                    {userStats?.averageProgress?.toFixed(1) || '0'}%
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <div className="flex flex-col gap-2 w-full">
            {/* Export Data Button */}
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isExporting || !currentUserScore}
              className="w-full justify-start bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export User Data (Backup)"}
            </Button>

            {/* Reset Statistics Button */}
            <Button
              variant="outline"
              onClick={handleResetStatistics}
              disabled={isResetting || !currentUserScore}
              className="w-full justify-start bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isResetting ? "Resetting..." : "Reset Current User Statistics"}
            </Button>

            {/* Clear All Data Button */}
            <Button
              variant="destructive"
              onClick={handleClearAllData}
              disabled={isResetting}
              className="w-full justify-start"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isResetting ? "Clearing..." : "Clear All Data (All Users)"}
            </Button>

            {/* Cancel Button */}
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isResetting || isExporting}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
