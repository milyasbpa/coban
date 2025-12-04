## Prompt

### Message
Tolong extract gambar berikut ke dalam file dengan ketentuan:
1. format sama seperti vocabulary.json
2. kamu letakkan tempatnya di folder n2/vocabulary, dan beri nama vocabulary_{{angka}}.json.Untuk angka nya berdasarkan file yang saya attach + 1. Untuk gambar selanjutnya maka nama file nya vocabulary_{{angka+2}}.json, dan seterusnya
3. Data yang bisa di extract adalah category.id, vocabulary.kanji, vocabulary.meanings.id, sisa field nya kamu isi sendiri berdasarkan pengetahuan mu
4. Jika di awal gambar tidak ada kategori maka saya selalu melampirkan file vocabulary sebelumnya, misalkan sekarang kamu sedang membuat vocabulary_2.json berarti kamu melihat vocabulary_1.json kategori terakhirnya apa
5. id isinya urut dari 1,2,3, dan seterusnya. Sedangkan vocabulary.id di isi urut juga sama, tetapi setiap category id di restart mulai dari 1
6. Jika ada kata formil dan tidak formil maka buat objectnya menjadi dua karena kata tersebut merupakan kata berbeda
7. Jika ada subkategori atau kategori di dalam kategori maka bisa di gabungkan saja dalam satu kategori tersebut
