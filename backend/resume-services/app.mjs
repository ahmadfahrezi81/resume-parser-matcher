import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { PDFExtract } from 'pdf.js-extract';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());

// Initialize PDF extractor
const pdfExtract = new PDFExtract();

// Initialize OpenAI - you'll need to set your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set up Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Extract text from PDF
    const data = await pdfExtract.extractBuffer(req.file.buffer);

    // Combine all pages text
    const fullText = data.pages
      .map((page) => page.content.map((item) => item.str).join(' '))
      .join('\n');

    // Process with OpenAI to extract structured information
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a resume parser. Extract the following information in JSON format:
            - Work experience (including company names, positions, dates, and descriptions)
            - Skills (technical and soft skills)
            - Education
            - Contact information
            Return only the JSON, no other text.`,
        },
        {
          role: 'user',
          content: fullText,
        },
      ],
      model: 'gpt-3.5-turbo',
    });

    // Get the parsed JSON response
    const parsedResume = JSON.parse(completion.choices[0].message.content);

    console.log('Successfully processed resume');

    console.log('Filename: ', req.file.originalname);
    console.log('Parsed resume:', parsedResume);

    res.status(200).json({
      message: 'Resume processed successfully',
      fileName: req.file.originalname,
      extractedData: parsedResume,
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({
      error: 'Error processing resume',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 6767;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
