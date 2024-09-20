import React, { useState } from 'react';

function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0]!);
  };

  const handleSubmit = async () => {
    if (!file) {
      return;
    }

    setIsSending(true);

    // Replace this with your actual API call
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('https://your-backend-api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        console.log('File uploaded successfully');
      } else {
        console.error('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="text-white h-screen flex flex-col sm:flex-row">
      <div className="flex flex-col justify-between px-2 h-full w-full sm:w-1/2">
        <div className="text-black justify-center items-center gap-2 flex flex-col before:">
          <input type="file" onChange={handleFileChange} />
          <div>
          {file && (
          <div className="mt-4">
            <img
              className="object-cover  rounded-lg"
              src={URL.createObjectURL(file)}
              alt="Selected File"
            />
          </div>
        )}
          </div>
        <button disabled={!file || isSending} onClick={handleSubmit} className=' bg-blue-500 w-fit  px-2 rounded-full '>
            Send
        </button>
        </div>
        
        
      </div>
      <div className="text-black sm:w-1/2">Hello</div>
    </div>
  );
}

export default Home;