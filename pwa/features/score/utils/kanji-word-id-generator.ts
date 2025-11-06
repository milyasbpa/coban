/**
 * Simple utility untuk generate kanji word IDs
 * Format: "{romanized_word}_{kanji_id}_{index}"
 */

export class KanjiWordIdGenerator {
  
  /**
   * Generate unique word ID dari word text dan kanji ID
   */
  static generateWordId(word: string, kanjiId: string, index: number): string {
    const romanized = this.romanizeWord(word);
    return `${romanized}_${kanjiId}_${index}`;
  }
  
  /**
   * Convert Japanese word ke romanized form untuk ID generation
   * Simple implementation dengan basic mapping
   */
  private static romanizeWord(word: string): string {
    // Basic romanization mapping untuk common cases
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