import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [sent, setSent] = useState(false);
  const [label, setLabel] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0]!);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append('file', file);

    // Simulate API response for now
    setTimeout(() => {
      const apiResponse = {
        label: 'Sample Label from API',
        coordinates: {
          x0: 50,
          y0: 50,
          x1: 200,
          y1: 300,
        },
      };

      setLabel(apiResponse.label);
      setRect(apiResponse.coordinates);
      setSent(true);
      setIsSending(false);
    }, 1000);
  };

  useEffect(() => {
    if (file && canvasRef.current && imgRef.current && rect) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imgRef.current;

      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x0, rect.y0, rect.x1 - rect.x0, rect.y1 - rect.y0);
      }
    }
  }, [rect, file]);

  const getRelativeCoords = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imgRef.current || !canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const imgRect = img.getBoundingClientRect();
    const offsetX = event.clientX - imgRect.left;
    const offsetY = event.clientY - imgRect.top;

    return {
      x: Math.max(0, Math.min(offsetX, img.width)),
      y: Math.max(0, Math.min(offsetY, img.height)),
    };
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sent) return;
    const { x, y } = getRelativeCoords(event);
    setIsDrawing(true);
    setRect({ x0: x, y0: y, x1: x, y1: y });
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !rect) return;
    const { x, y } = getRelativeCoords(event);
    setRect((prevRect) => (prevRect ? { ...prevRect, x1: x, y1: y } : null));
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleCoordChange = (field: keyof Rect, value: number) => {
    if (rect && value >= 0) {
      setRect((prevRect) => ({
        ...prevRect!,
        [field]: Math.min(Math.max(value, 0), rect.y1), // Ensure within bounds
      }));
    }
  };

  const exportAsImage = () => {
    if (!rect || !label || !imgRef.current) return;
  
    const img = imgRef.current;
  
    // Wrap the image in a temporary container to limit the screenshot to the selected region
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = `${rect.x0}px`;
    tempContainer.style.top = `${rect.y0}px`;
    tempContainer.style.width = `${rect.x1 - rect.x0}px`;
    tempContainer.style.height = `${rect.y1 - rect.y0}px`;
    tempContainer.style.overflow = 'hidden';
  
    // Clone the image and position it correctly within the container
    const clonedImg = img.cloneNode() as HTMLImageElement;
    clonedImg.style.position = 'absolute';
    clonedImg.style.left = `-${rect.x0}px`;
    clonedImg.style.top = `-${rect.y0}px`;
  
    tempContainer.appendChild(clonedImg);
    document.body.appendChild(tempContainer);
  
    // Use html2canvas to capture the screenshot
    html2canvas(tempContainer, {
      useCORS: true, // Enables cross-origin images (if necessary)
    }).then((canvas) => {
      // Convert the canvas to an image and trigger download
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to export image. Please try again.');
          return;
        }
  
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${label}.png`;
        link.click();
        alert('Image exported successfully!');
      }, 'image/png');
  
      // Clean up the temporary container
      document.body.removeChild(tempContainer);
    });
  };
  
  

  const exportAsJson = () => {
    if (!rect || !label) return;

    const data = {
      label: label,
      coordinates: rect,
    };

    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(jsonBlob);
    link.download = `${label}.json`;
    link.click();
    alert('JSON exported successfully!');
  };

  return (
    <div className="text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-4">
          <input type="file" onChange={handleFileChange} className="text-black" />
          {file && (
            <div className="relative bg-gray-200 rounded-lg overflow-hidden">
              <img
                ref={imgRef}
                className="w-full h-auto object-contain"
                src={URL.createObjectURL(file)}
                alt="Selected File"
              />
              <canvas
                ref={canvasRef}
                id='mainca'
                className="absolute top-0 left-0 w-full h-full"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
              ></canvas>
            </div>
          )}
          {!sent && (
            <button
              disabled={!file || isSending}
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          )}
          {sent && (
            <>
              <div className="flex flex-col gap-2 w-full">
                <label className="text-black text-sm">Label (from API):</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="p-2 text-black border border-gray-300 rounded-md"
                  placeholder="Label from API"
                />
              </div>
              <div className="mt-4 text-black">
                <label className="text-sm font-semibold">Coordinates:</label>
                <div className="flex flex-col space-y-2">
                  {['x0', 'y0', 'x1', 'y1'].map((coord) => (
                    <div key={coord} className="flex items-center">
                      <span className="mr-2">{coord}:</span>
                      <input
                        type="number"
                        value={rect ? (rect as any)[coord] : 0}
                        onChange={(e) => handleCoordChange(coord as keyof Rect, Number(e.target.value))}
                        className="p-2 text-black border border-gray-300 rounded-md w-20"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 space-x-2">
                <button
                  onClick={exportAsImage}
                  className="bg-red-500 text-white px-4 py-2 rounded-full"
                >
                  Export as Image
                </button>
                <button
                  onClick={exportAsJson}
                  className="bg-green-500 text-white px-4 py-2 rounded-full"
                >
                  Export as JSON
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
