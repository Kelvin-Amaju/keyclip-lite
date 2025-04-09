/pages
  index.tsx         --> Notes list + add form
  /api
    /notes
      index.ts       --> GET, POST
      [id].ts        --> PUT, DELETE
    /summarize.ts    --> POST to OpenAI API
/models
  Note.ts            --> Mongoose schema
/lib
  db.ts              --> DB connection