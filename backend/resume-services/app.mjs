import express from 'express';
import multer from 'multer';
import cors from 'cors';

const app = express();
app.use(cors());

// Set up Multer storage (files are stored in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// app.get('/api', (req, res) => {
//   return res.status(200).json({ message: 'Hello Worlds!' });
// });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('Received file:');
  console.log('Original Name:', req.file.originalname);
  console.log('MIME Type:', req.file.mimetype);
  console.log('Size (bytes):', req.file.size);

  res
    .status(200)
    .json({ message: 'File received', file: req.file.originalname });
});

const PORT = process.env.PORT || 6767;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
