export const playAudio = async (text: string) => {
  try {
    // Method 1: Web Speech API (fallback)
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8; // Slower rate for better pronunciation
      utterance.pitch = 1;
      utterance.volume = 1;

      // Get Japanese voices
      const voices = speechSynthesis.getVoices();
      const japaneseVoice = voices.find(
        (voice) => voice.lang.includes("ja") || voice.name.includes("Japanese")
      );

      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }

      speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error("Audio playback failed:", error);
  }
};
