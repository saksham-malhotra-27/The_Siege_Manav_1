import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

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
  const [label, setLabel] = useState("");
  const [showData, setShowData] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useCamera, setUseCamera] = useState(false); // To handle camera state
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0]!);
  };


  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setUseCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], "captured-image.png", {
              type: "image/png",
            });
            setFile(newFile); // Store captured image as file
            setUseCamera(false); // Hide the camera feed
          }
        });
      }
    }
  };


  const handleSubmit = async () => {
    if (!file) return;
  
    setIsSending(true);
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/image-ai", { 
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
  
      const apiResponse = await response.json();
      
      const { Object: label, xmin, xmax, ymin, ymax } = apiResponse;
      
      setLabel(label);
      setRect({ x0: xmin, y0: ymin, x1: xmax, y1: ymax });
      setSent(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSending(false);
    }
  };
  

  useEffect(() => {
    if (file && canvasRef.current && imgRef.current && rect) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imgRef.current;

      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height);
        ctx.strokeStyle = "red";
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

  const handleCanvasMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (!sent) return;
    const { x, y } = getRelativeCoords(event);
    setIsDrawing(true);
    setRect({ x0: x, y0: y, x1: x, y1: y });
  };

  const handleCanvasMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
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
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = `${rect.x0}px`;
    tempContainer.style.top = `${rect.y0}px`;
    tempContainer.style.width = `${rect.x1 - rect.x0}px`;
    tempContainer.style.height = `${rect.y1 - rect.y0}px`;
    tempContainer.style.overflow = "hidden";

    // Clone the image and position it correctly within the container
    const clonedImg = img.cloneNode() as HTMLImageElement;
    clonedImg.style.position = "absolute";
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
          alert("Failed to export image. Please try again.");
          return;
        }

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${label}.png`;
        link.click();
        alert("Image exported successfully!");
      }, "image/png");

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

    const jsonBlob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(jsonBlob);
    link.download = `${label}.json`;
    link.click();
    alert("JSON exported successfully!");
  };

  const showJson = () => {
    if (!rect || !label) {
      console.log("No");
      return;
    }

    const data = {
      label: label,
      coordinates: rect,
    };

    const finalData = JSON.stringify(data);
    setShowData(finalData);
  };

  const showCsv = () => {
    if (!rect || !label) {
      console.log("No");
      return;
    }

    const data = {
      label: label,
      coordinates: rect,
    };

    const finalData = JSON.stringify(data);
    setShowData(finalData);

    // Parse the JSON string into an object
    const jsonObject = JSON.parse(finalData);

    // Extract the keys and values from the object
    const keys = Object.keys(jsonObject);
    const coordinatesKeys = Object.keys(jsonObject.coordinates);

    // Prepare CSV header (keys for label and coordinates)
    const csvHeader = [
      ...keys.filter((key) => key !== "coordinates"),
      ...coordinatesKeys,
    ].join(",");

    // Prepare CSV values
    const csvValues = [
      jsonObject.label,
      jsonObject.coordinates.x0,
      jsonObject.coordinates.y0,
      jsonObject.coordinates.x1,
      jsonObject.coordinates.y1,
    ].join(",");

    // Combine header and values into CSV format
    const csv = `${csvHeader}\n${csvValues}`;
    setShowData(csv);
  };
  const showXml = () => {
    if (!rect || !label) {
      console.log("No");
      return;
    }

    const data = {
      label: label,
      coordinates: rect,
    };

    const finalData = JSON.stringify(data);
    // Parse the JSON string into an object
    const jsonObject = JSON.parse(finalData);

    // Function to convert JSON to XML format
    function jsonToXml(obj: any, rootElement = "") {
      let xml = "";
      if (rootElement) {
        xml += `<${rootElement}>`;
      }

      for (const key in obj) {
        if (typeof obj[key] === "object") {
          xml += jsonToXml(obj[key], key); // Recursively handle nested objects
        } else {
          xml += `<${key}>${obj[key]}</${key}>`;
        }
      }

      if (rootElement) {
        xml += `</${rootElement}>`;
      }
      return xml;
    }

    // Convert JSON to XML
    const xmlOutput = jsonToXml(jsonObject, "root");

    setShowData(xmlOutput);
  };

  return (
    <div className="w-full pt-[10vh] min-h-[92vh] bg-slate-100 flex flex-col md:flex-row gap-2 p-2">
      <div className="flex flex-col bg-slate-200 md:basis:1/2 p-4 rounded-md md:basis-1/2">
        {file && (
          <div className="relative bg-gray-200 rounded-lg overflow-hidden mb-4">
            <img
              ref={imgRef}
              className="w-full h-auto object-contain"
              src={URL.createObjectURL(file)}
              alt="Selected File"
            />
            <canvas
              ref={canvasRef}
              id="mainca"
              className="absolute top-0 left-0 w-full h-full"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            ></canvas>
          </div>
        )}
        <div className="flex flex-col gap-2 items-center mb-4">
        
         
          <video ref={videoRef} autoPlay className="w-full h-52"></video>
          {useCamera ? (
           <div>
             <button className=" bg-blue-400 p-2 rounded-full" onClick={captureImage}>Capture Image</button>
           </div>
           ): 
           <button onClick={startCamera} className="basis-1/2 w-full bg-blue-400 h-fit p-2 rounded-md">
            Capture
          </button>
           }
          <input
            type="file"
            onChange={handleFileChange}
            className="basis-1/2 text-black"
          />
        </div>
        

        { (
          <button
            disabled={!file || isSending}
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        )}
      </div>

      <div className="flex flex-col bg-slate-200 md:basis:1/2 p-4 rounded-md md:basis-1/2">
        <div className="">
          {sent && (
            <>
              <div className="flex flex-col gap-2 w-full">
                <label className="text-black text-base font-semibold">
                  Label:
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="p-2 text-black bg-slate-100 rounded-md outline-none"
                  placeholder="Label from API"
                />
              </div>
              <div className="mt-4 text-black">
                <label className="text-sm font-semibold">Coordinates:</label>
                <div className="flex flex-row gap-2">
                  {["x0", "y0", "x1", "y1"].map((coord) => (
                    <div key={coord} className="flex items-center">
                      <span className="mr-2">{coord}:</span>
                      <input
                        type="number"
                        value={rect ? (rect as any)[coord] : 0}
                        onChange={(e) =>
                          handleCoordChange(
                            coord as keyof Rect,
                            Number(e.target.value)
                          )
                        }
                        className="p-2 text-black border bg-slate-100 rounded-md w-20"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Show Options:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={showJson}
                    className="bg-slate-900 text-white px-4 py-2 rounded-full hover:opacity-85"
                  >
                    Show Json
                  </button>
                  <button
                    onClick={showCsv}
                    className="bg-slate-800 text-white px-4 py-2 rounded-full hover:bg-slate-900"
                  >
                    Show CSV
                  </button>
                  <button
                    onClick={showXml}
                    className="bg-slate-800 text-white px-4 py-2 rounded-full hover:opacity-85"
                  >
                    Show XML
                  </button>
                  <button
                    onClick={exportAsJson}
                    className="bg-slate-800 text-white px-4 py-2 rounded-full hover:bg-slate-900  "
                  >
                    Show SQL
                  </button>
                </div>
                <div className="w-full rounded-md h-[30vh] bg-slate-300 mt-2 overflow-y-scroll">
                  {showData}
                </div>
              </div>

              <div className="mt-4 flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Export Options:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={exportAsImage}
                    className="bg-slate-900 text-white px-4 py-2 rounded-full hover:opacity-85"
                  >
                    Export Image
                  </button>
                  <button
                    onClick={exportAsJson}
                    className="bg-slate-800 text-white px-4 py-2 rounded-full hover:bg-slate-900"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={exportAsJson}
                    className="bg-slate-800 text-white px-4 py-2 rounded-full hover:bg-slate-900"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
