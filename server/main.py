from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from bson import ObjectId
from pymongo import MongoClient
from passlib.context import CryptContext
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import torch
import cv2
import numpy as np
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import numpy as np
import requests
import tempfile
from dotenv import load_dotenv

from fastapi.middleware.cors import CORSMiddleware



# Load environment variables from a .env file
load_dotenv()
# Configuration for Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Setup MongoDB client and database
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["inject"]
users_collection = db["users"]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Secret key and JWT settings
SECRET_KEY = os.getenv("SECRET_KEY")  # Replace with a strong secret key
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods or specify like ["GET", "POST"]
    allow_headers=["*"],
)

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[int] = None):
    to_encode = data.copy()
    to_encode.update({"exp": expires_delta})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegister):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = {
        "email": user.email,
        "password": hashed_password
    }
    users_collection.insert_one(new_user)
    return {"msg": "User registered successfully"}

@app.post("/signin")
async def login_user(user: UserLogin):
    existing_user = users_collection.find_one({"email": user.email})
    if not existing_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if not verify_password(user.password, existing_user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
async def get_current_user(token: str = Depends(verify_token)):
    return {"email": token}


# Load the YOLOv5 model from the ultralytics/yolov5 repository
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
# Function to detect objects in an image



def detect_objects_in_image(image_url):
    # Load the image using OpenCV
    response = requests.get(image_url)
    xmin,xmax,ymin,ymax,confidence,class_name = '','','','','',''
    if response.status_code != 200:
        print("Error: Failed to download image.")
        success = False 
        return success, xmin,xmax,ymin,ymax,confidence,class_name
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        # Write the image content to the temporary file
        temp_file.write(response.content)
        temp_file.flush()  # Ensure the file is written
        
        # Use the name of the temp file for loading the image
        temp_file_name = temp_file.name

    image = cv2.imread(temp_file_name)
    if image is None:
        print("Error: Could not load image.")
        success = False 
        return success, xmin,xmax,ymin,ymax,confidence,class_name
    else: 
        print("found")
     # Perform inference on the image (run the model)
    results = model(image)


    # Get the bounding boxes, confidence scores, and class labels
    detected_objects = results.xyxy[0]  # Bounding boxes in [xmin, ymin, xmax, ymax] format
      # Check if there are any detected objects
  
    if detected_objects is None or detected_objects.shape[0] == 0:
        print("No objects detected.")
        return False, xmin,xmax,ymin,ymax,confidence,class_name
    

    obj = detected_objects[0]
    xmin, ymin, xmax, ymax, confidence, class_id = obj[:6]
    class_name = model.names[int(class_id)]
    print("Final Results")
    print(f"Object: {class_name}")
    print(f"Accuracy: {confidence:.2f}")
    print(f"x0: {xmin}")
    print(f"x1: {xmax}")
    print(f"y0: {ymin}")    
    print(f"y1: {ymax}")

    # Draw bounding box and label on the image
    cv2.rectangle(image, (int(xmin), int(ymin)), (int(xmax), int(ymax)), (0, 255, 0), 2)
    label = f"{class_name} {confidence:.2f}"
    cv2.putText(image, label, (int(xmin), int(ymin) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    # Optionally, save the image with bounding boxes
    cv2.imwrite("output_image.jpg", image)

    # Crop the region of interest (ROI) from the image
    xmin, ymin, xmax, ymax = int(xmin), int(ymin), int(xmax), int(ymax)
    cropped_image = image[ymin:ymax, xmin:xmax]
    
    # Save the cropped image to a file
    cv2.imwrite("output_image_cropped.jpg", cropped_image)
    cv2.imshow(f"Cropped {class_name}", cropped_image)
    return True,xmin,xmax,ymin,ymax,confidence,class_name

class ImageLocation(BaseModel):
    image_path: str  

@app.post("/image-ai")
async def get_image_metadata(file: UploadFile = File(...)):
    # Upload the image to Cloudinary
    upload_result = cloudinary.uploader.upload(file.file)
    secure_url = upload_result["secure_url"]

    # Process the image using the secure URL
    

    success, xmin, xmax, ymin, ymax, confidence, class_name= detect_objects_in_image(secure_url)
    
    if success == False:
        return JSONResponse(content={"success": False})
    else:
        return JSONResponse(content={
            "secure_url": secure_url,
            "Object": class_name,
            "xmin": xmin,
            "xmax": xmax,
            "ymin": ymin,
            "ymax": ymax
        })


