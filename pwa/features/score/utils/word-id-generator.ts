/**
 * Utility functions for generating and parsing word IDs in the word-based scoring system
 * Word ID format: "{romanized_word}_{kanji_id}_{index}"
 * Example: "hitotsu_1_0", "ichinichi_1_1"
 */

export class WordIdGenerator {
  
  /**
   * Generate unique word ID from word text and kanji ID
   * @param word The word text (e.g., "一つ", "一日")
   * @param kanjiId Parent kanji ID (e.g., "1")
   * @param index Word index within the kanji (0-based)
   * @returns Unique word identifier
   */
  static generateWordId(word: string, kanjiId: string, index: number): string {
    // Convert Japanese word to romanized equivalent for ID
    const romanized = this.romanizeWord(word);
    return `${romanized}_${kanjiId}_${index}`;
  }
  
  /**
   * Parse word ID back into components
   * @param wordId The word identifier to parse
   * @returns Parsed components or null if invalid format
   */
  static parseWordId(wordId: string): { romanized: string; kanjiId: string; index: number } | null {
    const parts = wordId.split('_');
    if (parts.length !== 3) return null;
    
    const [romanized, kanjiId, indexStr] = parts;
    const index = parseInt(indexStr, 10);
    
    if (isNaN(index)) return null;
    
    return {
      romanized,
      kanjiId,
      index,
    };
  }
  
  /**
   * Generate word IDs for all words in a kanji
   * @param words Array of word texts
   * @param kanjiId Parent kanji ID
   * @returns Array of word IDs
   */
  static generateWordIds(words: string[], kanjiId: string): string[] {
    return words.map((word, index) => this.generateWordId(word, kanjiId, index));
  }
  
  /**
   * Check if word ID format is valid
   * @param wordId Word ID to validate
   * @returns True if valid format
   */
  static isValidWordId(wordId: string): boolean {
    return this.parseWordId(wordId) !== null;
  }
  
  /**
   * Convert Japanese word to romanized form for ID generation
   * Simple implementation - can be enhanced with proper romanization library
   * @param word Japanese word
   * @returns Romanized equivalent
   */
  private static romanizeWord(word: string): string {
    // Basic romanization mapping for common cases
    const romanizationMap: Record<string, string> = {
      // Numbers
      '一つ': 'hitotsu',
      '一日': 'ichinichi', 
      '一人': 'hitori',
      '一年': 'ichinen',
      '一本': 'ippon',
      '二つ': 'futatsu',
      '二日': 'futsuka',
      '二人': 'futari',
      '三つ': 'mittsu',
      '三日': 'mikka',
      '四つ': 'yottsu',
      '四日': 'yokka',
      '五つ': 'itsutsu',
      '五日': 'itsuka',
      '六つ': 'muttsu',
      '六日': 'muika',
      '七つ': 'nanatsu',
      '七日': 'nanoka',
      '八つ': 'yattsu',
      '八日': 'youka',
      '九つ': 'kokonotsu',
      '九日': 'kokonoka',
      '十': 'juu',
      '十日': 'tooka',
      
      // Common words
      '人': 'hito',
      '日': 'hi',
      '本': 'hon',
      '上': 'ue',
      '下': 'shita',
      '中': 'naka',
      '大': 'ookii',
      '小': 'chiisai',
      '新': 'atarashii',
      '古': 'furui',
      '来る': 'kuru',
      '行く': 'iku',
      '見る': 'miru',
      '聞く': 'kiku',
      '読む': 'yomu',
      '書く': 'kaku',
      '話す': 'hanasu',
      '食べる': 'taberu',
      '飲む': 'nomu',
      '寝る': 'neru',
      '起きる': 'okiru',
      
      // Time
      '今': 'ima',
      '今日': 'kyou',
      '明日': 'ashita',
      '昨日': 'kinou',
      '朝': 'asa',
      '昼': 'hiru',
      '夜': 'yoru',
      '時間': 'jikan',
      '分': 'fun',
      '秒': 'byou',
      
      // Family
      '父': 'chichi',
      '母': 'haha',
      '兄': 'ani',
      '姉': 'ane',
      '弟': 'otouto',
      '妹': 'imouto',
      '家族': 'kazoku',
      
      // Basic adjectives
      '良い': 'yoi',
      '悪い': 'warui',
      '高い': 'takai',
      '安い': 'yasui',
      '早い': 'hayai',
      '遅い': 'osoi',
      '暑い': 'atsui',
      '寒い': 'samui',
      '暖かい': 'atatakai',
      '涼しい': 'suzushii',
    };
    
    // Check if we have a direct mapping
    if (romanizationMap[word]) {
      return romanizationMap[word];
    }
    
    // Fallback: create a safe ID from the word
    // Replace non-ASCII characters with their Unicode codepoint
    return word
      .split('')
      .map(char => {
        if (/[a-zA-Z0-9]/.test(char)) {
          return char;
        }
        return `u${char.charCodeAt(0).toString(16)}`;
      })
      .join('')
      .toLowerCase();
  }
}