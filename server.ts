import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  const isProduction = process.env.NODE_ENV === "production";
  console.log(`Starting server in ${isProduction ? "production" : "development"} mode`);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV,
      isProduction 
    });
  });

  // AI Routes
  app.post("/api/ai/generate", async (req, res) => {
    console.log("AI Generate Request received:", req.body.prompt?.substring(0, 50) + "...");
    const { prompt, systemInstruction } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing from process.env");
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction,
      });

      const response = await model.generateContent(prompt);
      const result = await response.response;
      const text = result.text();

      console.log("AI Generation successful");
      res.json({ text: text || "" });
    } catch (error: any) {
      // Extract code and message
      const isQuotaError = error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED");
      
      if (isQuotaError) {
        console.warn("Gemini API Quota reached (429)");
      } else {
        console.error("Gemini API Error details:", error);
      }
      
      let errorMessage = error.message || "Failed to generate content";
      let statusCode = 500;

      if (isQuotaError) {
        statusCode = 429;
        errorMessage = "Quota Gemini atteint. Veuillez réessayer demain ou configurer votre propre clé API.";
      }

      res.status(statusCode).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (!isProduction) {
    console.log("Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files from dist...");
    const distPath = path.join(__dirname, "dist");
    if (path.extname(__filename) === '.cjs') {
      // In bundled CJS, __dirname is already set correctly by esbuild
      app.use(express.static(distPath));
    } else {
      app.use(express.static(distPath));
    }
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
