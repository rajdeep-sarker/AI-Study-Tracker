import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API router
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, trackerData, profile, promptType, files, history } = req.body;
      
      let systemInstruction = "";
      const profileString = profile ? `User Profile: Name: ${profile.name || "N/A"}, Group: ${profile.group || "N/A"}, College: ${profile.college || "N/A"}, HSC Year: ${profile.hscYear || "N/A"}` : "";
      
      if (promptType === "advisor") {
        systemInstruction = `You are an expert academic advisor for HSC students. ${profileString}. Analyze the student's progress data if provided:
${trackerData ? JSON.stringify(trackerData) : "No data provided."}
Focus on guiding them on what to do next, highlight backlogs, and suggest a strategy. Keep it concise, engaging, and in Markdown format.
IMPORTANT: Reply in the same language the user uses. If they speak Bengali, respond in Bengali. If they speak English, respond in English. Default to English if unclear.`;
      } else if (promptType === "doubt") {
        systemInstruction = `You are a friendly and clear tutor for HSC students. ${profileString}. The user has a doubt.
You may receive class slides, main book extracts, or practice sheets as file attachments. Use them contextually.
Explain their doubt simply, referencing the provided materials/context where applicable. Use examples. Provide response in Markdown.
IMPORTANT: Reply in the same language the user uses. If they speak Bengali, respond in Bengali. If they speak English, respond in English. Default to English if unclear.`;
      }

      const contents: any[] = [];
      
      if (history && Array.isArray(history)) {
        history.forEach((msg) => {
          contents.push({
            role: msg.role === "ai" ? "model" : "user",
            parts: [{ text: msg.text }]
          });
        });
      }

      const currentParts: any[] = [];
      if (files && Array.isArray(files)) {
        files.forEach((f: any) => {
          currentParts.push({
            inlineData: {
              data: f.data,
              mimeType: f.mimeType
            }
          });
        });
      }
      
      currentParts.push({ text: message });
      
      contents.push({
        role: "user",
        parts: currentParts
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  app.post("/api/ai/generate-exam", async (req, res) => {
    try {
      const { subject, chapter, numQuestions, topic, profile } = req.body;
      
      const examSchema = {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "Question text in Bengali" },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Options in Bengali" },
                correctIndex: { type: Type.INTEGER, description: "Index of the correct option (0 to 3)" },
                explanation: { type: Type.STRING, description: "Short explanation for the correct answer in Bengali" }
              },
              required: ["question", "options", "correctIndex", "explanation"]
            }
          }
        },
        required: ["questions"]
      };

      const topicInstruction = topic ? `\nSpecific Topic Focus: ${topic}` : "";
      const profileInstruction = profile ? `\nTarget Audience: Name: ${profile.name || "N/A"}, Group: ${profile.group || "N/A"}, College: ${profile.college || "N/A"}, HSC Year: ${profile.hscYear || "N/A"}` : "";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a multiple choice exam in Bengali for HSC students. ${profileInstruction}
Subject: ${subject}
Chapter: ${chapter}${topicInstruction}
Number of questions: ${numQuestions}
Ensure the questions are academic, accurate, and suitable for HSC level. ALL questions and options MUST be in Bengali.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: examSchema,
          temperature: 0.7,
        }
      });

      if (!response.text) throw new Error("No text returned");
      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error("Gemini API Exam Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate exam" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
