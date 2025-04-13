import dbConnect from "@/lib/db";
import Note from "@/models/Notes";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { RateLimiterMemory } from "rate-limiter-flexible";
import NodeCache from "node-cache";

// Rate limiter: 50 requests per minute per IP
const rateLimiter = new RateLimiterMemory({
  points: 50,
  duration: 60, // seconds
});

// Cache for summaries: 1-hour TTL
const summaryCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // Normalize clientIp to a single string
  const xForwardedFor = req.headers["x-forwarded-for"];
  const clientIp = (
    Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : typeof xForwardedFor === "string"
      ? xForwardedFor.split(",")[0].trim()
      : req.socket.remoteAddress || "unknown"
  ) as string;

  if (req.method === "GET") {
    try {
      await rateLimiter.consume(clientIp);
      const notes = await Note.find().sort({ createdAt: -1 });
      return res.status(200).json(notes);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Rate limit")) {
        console.warn("Rate limit exceeded for IP:", clientIp);
        return res.status(429).json({ error: "Too many requests, try again later" });
      }
      console.error("GET error:", error);
      return res.status(500).json({ error: "Failed to fetch notes" });
    }
  }

  if (req.method === "POST") {
    try {
      await rateLimiter.consume(clientIp);
      const { content, tags = [] } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      // Input validation: Limit content length
      if (content.length > 10000) {
        return res.status(400).json({ error: "Content exceeds 10,000 characters" });
      }

      // Check cache for summary
      const cacheKey = `summary:${content}`;
      let summary = summaryCache.get<string>(cacheKey);
      if (summary) {
        console.log("Cache hit for summary:", cacheKey);
      } else {
        try {
          const summaryResponse = await axios.post(
            process.env.NODE_ENV === "production"
              ? process.env.SUMMARIZE_API_URL || "https://your-production-url/api/notes/summarize"
              : "http://localhost:3000/api/notes/summarize",
            { content },
            { timeout: 10000 }
          );
          summary = summaryResponse.data.summary || "";
          if (summary) {
            summaryCache.set(cacheKey, summary);
            console.log("Generated and cached summary:", summary);
          }
        } catch (summaryError: any) {
          console.error("Summary generation error:", {
            message: summaryError.message,
            response: summaryError.response?.data,
            status: summaryError.response?.status,
          });
          summary = "Summary unavailable due to API error";
        }
      }

      const newNote = await Note.create({
        content,
        summary,
        tags,
        createdAt: new Date(),
      });

      return res.status(201).json(newNote);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Rate limit")) {
        console.warn("Rate limit exceeded for IP:", clientIp);
        return res.status(429).json({ error: "Too many requests, try again later" });
      }
      console.error("POST error:", error);
      return res.status(400).json({ error: "Failed to create note" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}