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

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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
    const { prompt, systemInstruction } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction 
        }
      });
      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  app.post("/api/ai/subtitles", async (req, res) => {
    const { title, preacher, description, passages } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          {
            role: "user",
            parts: [{ text: `En tant qu'assistant de l'église CDD Kinshasa, génère une transcription textuelle structurée (sous-titres / résumé détaillé par points) pour la prédication suivante :
              Titre : ${title}
              Prédicateur : ${preacher}
              Versets : ${passages || 'N/A'}
              Description : ${description || 'N/A'}
              
              La transcription doit être inspirante, détaillée et structurée comme un sermon retranscrit. Utilise un ton prophétique et bienveillant. Inclus des temps (ex: [00:00]) fictifs pour donner l'impression d'une retranscription réelle du sermon.` }]
          }
        ]
      });

      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Gemini Subtitle Error:", error);
      res.status(500).json({ error: "Erreur lors de la génération des sous-titres IA." });
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
