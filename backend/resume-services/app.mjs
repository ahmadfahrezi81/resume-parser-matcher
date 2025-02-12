import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { PDFExtract } from 'pdf.js-extract';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

// Load environment variables from .env file
dotenv.config();

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// Initialize PDF extractor
const pdfExtract = new PDFExtract();

// Initialize OpenAI - you'll need to set your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// const s3 = new S3Client({
//   region: bucketRegion,
//   credentials: {
//     accessKeyId: accessKey,
//     secretAccessKey: secretAccessKey,
//   },
// });

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

    // // Upload PDF to S3
    // const command = new PutObjectCommand({
    //   Bucket: bucketName,
    //   Key: req.file.originalname,
    //   Body: req.file.buffer,
    //   ContentType: req.file.mimetype,
    // });

    // const result = await s3.send(command);

    // if (result.$metadata.httpStatusCode !== 200) {
    //   throw new Error('Error uploading file to S3');
    // }

    // console.log('Successfully uploaded file to S3');

    // Combine all pages text
    const fullText = data.pages
      .map((page) => page.content.map((item) => item.str).join(' '))
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a resume parser. Extract relevant details from the resume text and return a structured JSON object.',
        },
        {
          role: 'user',
          content: fullText,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'extract_resume_data',
            description: 'Extracts structured resume data from a given text',
            parameters: {
              type: 'object',
              properties: {
                experience: {
                  type: 'object',
                  properties: {
                    years: {
                      type: 'number',
                      description: 'Number of years of experience',
                    },
                    titles: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'List of job titles',
                    },
                  },
                  required: ['years', 'titles'],
                },
                location: {
                  type: 'string',
                  description: "Candidate's location",
                },
                skills: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of skills',
                },
                education: {
                  type: 'array',
                  items: { type: 'string' },
                  description:
                    'List of degree only',
                },
              },
              required: ['experience', 'location', 'skills', 'education'],
            },
          },
        },
      ],
      tool_choice: 'auto', // Automatically selects the tool
    });

    const parsedData =
      completion.choices[0].message.tool_calls[0].function.arguments;
    const jsonData = JSON.parse(parsedData);
    console.log(jsonData);

    // Create resume in database
    const newResume = await prisma.resume.create({
      data: {
        experience: jsonData.experience.years,
        jobList: jsonData.experience.titles,
        location: jsonData.location,
        skills: jsonData.skills,
        education: jsonData.education,
      },
    });

    console.log('Filename: ', req.file.originalname);
    // console.log('Parsed resume:', parsedResume);

    res.status(200).json({
      message: 'Resume processed successfully',
      fileName: req.file.originalname,
      extractedData: jsonData,
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({
      message: 'Resume processed successfully',
      fileName: req.file.originalname,
      extractedData: jsonData,
      resumeId: newResume.id,
    });
  }
});


const PORT = process.env.PORT || 6767;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
