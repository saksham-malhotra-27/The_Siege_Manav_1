import React, { useState, useRef, useEffect } from 'react';

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null); // Rectangle coordinates
  const [isDrawing, setIsDrawing] = useState(false); // To track if the user is drawing
  const [sent, setSent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0]!);
  };

  const handleSubmit = async () => {
    if (!file) {
      return;
    }

    setIsSending(true);
    
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('https://your-backend-api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        console.log('File uploaded successfully');
        setSent(true); // Update state to "sent"
      } else {
        console.error('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (file && canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imgRef.current;
      
      // Set canvas dimensions based on the image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx && rect) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the rectangle on top of the image
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x0, rect.y0, rect.x1 - rect.x0, rect.y1 - rect.y0);
      }
    }
  }, [rect, file]); // Re-render canvas when rect changes

  // Get relative coordinates with respect to the image
  const getRelativeCoords = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!imgRef.current || !canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const img = imgRef.current;
    
    const imgRect = img.getBoundingClientRect();

    const offsetX = event.clientX - imgRect.left; // Get mouse x relative to image
    const offsetY = event.clientY - imgRect.top;  // Get mouse y relative to image

    // Return coordinates only if within image bounds
    return {
      x: Math.max(0, Math.min(offsetX, img.width)),
      y: Math.max(0, Math.min(offsetY, img.height)),
    };
  };

  // Handle start of rectangle drawing
  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const { x, y } = getRelativeCoords(event);
    setIsDrawing(true); // Start drawing the rectangle
    setRect({
      x0: x,
      y0: y,
      x1: x,
      y1: y
    });
  };

  // Handle mouse movement and updating rectangle while the mouse is down
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing || !rect) return;

    const { x, y } = getRelativeCoords(event);
    setRect(prevRect => prevRect ? {
      ...prevRect,
      x1: x,
      y1: y
    } : null);
  };

  // Handle end of rectangle drawing
  const handleCanvasMouseUp = () => {
    setIsDrawing(false); // Stop drawing
  };

  return (
    <div className="text-white  flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-20 justify-center">
          <div className=' flex flex-col items-center gap-4 '>
          {!sent && (
            <>
              <input type="file" onChange={handleFileChange} className="text-black" />
              {file && (
                <div className="w-full max-w-md relative bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    ref={imgRef}
                    className="w-full h-auto object-contain"
                    src={URL.createObjectURL(file)}
                    alt="Selected File"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                  ></canvas>
                </div>
              )}
              <button
                disabled={!file || isSending}
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </>
          )}
          </div>
          
          {/* Coordinates displayed in a separate div below the send button */}
          {rect && (
            <div className="text-black mt-4">
              <p>Rectangle Coordinates:</p>
              <p>x0: {rect.x0.toFixed(2)}, y0: {rect.y0.toFixed(2)}</p>
              <p>x1: {rect.x1.toFixed(2)}, y1: {rect.y1.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
