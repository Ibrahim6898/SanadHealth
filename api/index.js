// Vercel Serverless Function entry point
// This wraps the existing Express app so it works as a Vercel function

import app from "../server/src/app.js";

export default app;
