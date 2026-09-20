# BookMap

A personal reading map. Every book I have read or want to read, placed by
author origin, publication year, genre and style, plus a gamified reader sheet
and the lessons that run between books.

## Run

```sh
npm install
npm run dev        # http://localhost:3000
npm run generate   # static site in .output/public
```

## Edit the library

Everything lives in `app/data/books.ts`. Add a book, set its `status`
(`read` or `want`), write a `takeaway` (read) or `why` (want), and give it
0–3 points in each stat. Then pull its cover:

```sh
node scripts/fetch-covers.mjs
```

Cross-book lessons live in `app/data/threads.ts`.
