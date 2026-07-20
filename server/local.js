// Local development server: serves the API plus the built frontend in public/,
// mirroring the Vercel deployment (static files + SPA fallback).
const path = require("path");
const express = require("express");
const app = require("./app");

const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
