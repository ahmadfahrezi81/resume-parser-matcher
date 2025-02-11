import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./App.css";

function App() {
    const [file, setFile] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                "http://localhost:3000/upload",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            console.log("Upload successful:", response.data);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: "application/pdf",
    });

    return (
        <div className="App">
            <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag & drop or click to select files</p>
                )}
            </div>
            {file && (
                <div>
                    <p>Selected File: {file.name}</p>
                    <button onClick={handleUpload}>Upload</button>
                </div>
            )}
        </div>
    );
}

export default App;
