## Prompt

### Message

Tolong buatkan examples masing-masing kata dengan ketentuan:

1. mengikuti struktur pada vocabulary_examples.json

```
{
    "id": 1,
    "sentence": "何色が好きですか。",
    "furigana": "なにいろがすきですか。",
    "romaji": "nani iro ga suki desu ka.",
    "meanings": {
        "id": "Warna apa yang kamu suka?",
        "en": "What color do you like?"
    }
}
```
diletakkan pada field examples, jika belum ada maka bisa di buat field examples di dalam field masing-masing vocabulary
2. Isi masing-masing field:
id: incremental dari 1,2,3 setiap vocabulary selalu reset dari angka 1
sentence: menggunakan tulisan jepang asli antara itu kanji + hiragana atau katakana
furigana: field sentence diubah menjadi tidak ada tulisan kanji di sini semua di ubah menjadi hiragana atau katakana tergantung konteks
romaji: field sentence jadi tulisan latin
meanings.id: terjemahan field sentence dalam bahasa indonesia
meanings.en: terjemahan field sentence dalam bahasa inggris
3. kalimat yang di gunakan menggunakan pola kalimat dari nama folder levelnya (dari sama hingga ke termudah) semisal kasus ini N3 maka pola kalimat yang boleh digunakan adalah N3, N4, dan N5
