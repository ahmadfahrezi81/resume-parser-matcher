import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Button } from './components/ui/button';

const API_BASE_URL = 'http://localhost:6767';

function App() {
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    //TODO: Add file type validation and error handling

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload successful:', response.data);
      setLoading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'application/pdf',
    multiple: false
  });

  return (
    <div className="m-auto p-[2rem] text-center">
      <div {...getRootProps()} className='border-dashed border-[5px] p-20 text-center cursor-pointer text-xl'>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className='text-xl'>Drop the files here ...</p>
        ) : (
          <p>Drag & drop or click to select files</p>
        )}
      </div>
      {file && (
        <div className='py-3'>
          <p>Selected File: {file.name}</p>
          <Button onClick={handleUpload} disabled={loading}>Upload</Button>
        </div>
      )}
    </div>
  );
}

export default App;
