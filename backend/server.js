const express = require("express");
const multer = require("multer");
const cors = require("cors");
const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "gsk_free_default_key",
});

app.use(cors());
app.use(express.json());

const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "you know",
  "so",
  "basically",
  "actually",
  "literally",
  "i mean",
  "kind of",
  "sort of",
  "you see",
  "right",
  "okay",
  "well",
  "hmm",
  "ah",
  "er",
];

function analyzeText(text, segments) {
  if (!segments || segments.length === 0) {
    return {
      wpm: 0,
      filler_words: [],
      pauses: [],
      total_duration: 0,
      word_count: 0,
    };
  }

  const totalDuration = segments[segments.length - 1].end;
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;
  const wpm = totalDuration > 0 ? (wordCount / totalDuration) * 60 : 0;

  const fillerOccurrences = [];
  segments.forEach((segment) => {
    const segmentText = segment.text.toLowerCase();
    const segmentWords = segmentText.split(/\s+/);

    FILLER_WORDS.forEach((filler) => {
      const fillerParts = filler.split(" ");
      if (fillerParts.length === 1) {
        if (segmentWords.includes(filler)) {
          fillerOccurrences.push({
            word: filler,
            timestamp: segment.start,
            end: segment.end,
          });
        }
      } else {
        if (segmentText.includes(filler)) {
          fillerOccurrences.push({
            word: filler,
            timestamp: segment.start,
            end: segment.end,
          });
        }
      }
    });
  });

  const pauses = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const gap = segments[i + 1].start - segments[i].end;
    if (gap > 0.5) {
      pauses.push({
        start: segments[i].end,
        end: segments[i + 1].start,
        duration: gap,
      });
    }
  }

  return {
    wpm: Math.round(wpm * 100) / 100,
    filler_words: fillerOccurrences,
    pauses: pauses,
    total_duration: Math.round(totalDuration * 100) / 100,
    word_count: wordCount,
  };
}

app.get("/api/", (req, res) => {
  res.json({ message: "PitchSense AI - Real-Time Speech-to-Score Engine" });
});

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const newFilePath = filePath + ".webm";

    fs.renameSync(filePath, newFilePath);

    const fileStream = fs.createReadStream(newFilePath);

    const transcription = await groq.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
    });

    fs.unlinkSync(newFilePath);

    const segments = transcription.segments || [];
    const analysis = analyzeText(transcription.text, segments);

    res.json({
      text: transcription.text,
      ...analysis,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        fs.unlinkSync(req.file.path + ".webm");
      } catch (e) {}
    }
    res.status(500).json({
      error: error.message,
      details: error.response?.data || "No additional details",
    });
  }
});

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const PORT = process.env.PORT || 8001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
