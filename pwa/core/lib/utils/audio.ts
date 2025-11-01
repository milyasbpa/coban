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

      // Get Japanese voices, prioritize female voices
      const voices = speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(
        (voice) => voice.lang.includes("ja") || voice.name.includes("Japanese")
      );

      // Try to find female Japanese voice first
      let selectedVoice = japaneseVoices.find(
        (voice) => 
          voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("woman") ||
          voice.name.toLowerCase().includes("kyoko") ||
          voice.name.toLowerCase().includes("otoya") ||
          voice.name.toLowerCase().includes("haruka") ||
          voice.name.toLowerCase().includes("sayaka")
      );

      // If no specific female voice found, use the first Japanese voice
      if (!selectedVoice && japaneseVoices.length > 0) {
        selectedVoice = japaneseVoices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error("Audio playback failed:", error);
  }
};
