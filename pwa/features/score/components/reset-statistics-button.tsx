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
import { isFeatureEnabled, devLog } from "@/pwa/core/config/env";
import { RotateCcw, Database, Trash2, AlertTriangle } from "lucide-react";

export function ResetStatisticsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    scoreStorageLength: number;
    exerciseStorageLength: number;
    analyticsStorageLength: number;
  } | null>(null);
  
  const { resetStatistics, currentUserScore } = useScoreStore();
  
  // Only show in development or when feature flag is enabled
  if (!isFeatureEnabled('showResetStatistics')) {
    return null;
  }
  
  const handleOpenDialog = async () => {
    setIsOpen(true);
    try {
      const info = await StorageManager.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      devLog('Failed to get storage info', error);
    }
  };
  
  const handleResetStatistics = async () => {
    if (!currentUserScore) {
      devLog('No user score available for reset');
      return;
    }
    
    setIsResetting(true);
    try {
      await resetStatistics();
      devLog('Statistics reset successfully');
      setIsOpen(false);
    } catch (error) {
      devLog('Failed to reset statistics', error);
    } finally {
      setIsResetting(false);
    }
  };
  
  const handleClearAllData = async () => {
    setIsResetting(true);
    try {
      await StorageManager.clearAllData();
      devLog('All data cleared successfully');
      setIsOpen(false);
      // Optionally reload the page to reset the app state
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      devLog('Failed to clear all data', error);
    } finally {
      setIsResetting(false);
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
            These tools are only available in development mode. Use with caution.
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
                  <Badge variant="secondary">{storageInfo.scoreStorageLength} records</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Exercise Storage:</span>
                  <Badge variant="secondary">{storageInfo.exerciseStorageLength} records</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Analytics Storage:</span>
                  <Badge variant="secondary">{storageInfo.analyticsStorageLength} records</Badge>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Loading storage info...</div>
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
                  <span>Total Score:</span>
                  <Badge variant="outline">{currentUserScore.overallStats.totalScore}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Exercises Completed:</span>
                  <Badge variant="outline">{currentUserScore.overallStats.totalExercisesCompleted}</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-start">
          <div className="flex flex-col gap-2 w-full">
            {/* Reset Statistics Button */}
            <Button
              variant="outline"
              onClick={handleResetStatistics}
              disabled={isResetting || !currentUserScore}
              className="w-full justify-start"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isResetting ? 'Resetting...' : 'Reset Current User Statistics'}
            </Button>
            
            {/* Clear All Data Button */}
            <Button
              variant="destructive"
              onClick={handleClearAllData}
              disabled={isResetting}
              className="w-full justify-start"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isResetting ? 'Clearing...' : 'Clear All Data (All Users)'}
            </Button>
            
            {/* Cancel Button */}
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isResetting}
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