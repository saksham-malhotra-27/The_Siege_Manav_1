# AI-Powered Object Detection Desktop Application

## Overview

This desktop application allows users to upload images or capture them using their camera and detects objects within the images using an AI model integrated in the backend. The detected object is highlighted with editable bounding box, and the object is labeled (the labels are editable as well). The label and bounding box data can be exported in various formats such as JSON, CSV, XML, and SQL.

Built using [Electron.js](https://www.electronjs.org/), the application delivers a cross-platform experience with a smooth interface for object detection, editing, and data export.

## Features

- **Upload or Capture Images**: Users can either upload an image from their local system or capture one directly using their webcam.
  
- **Object Detection with AI**: The uploaded or captured image is processed using an AI model, which detects objects and creates a bounding box around them.

- **Editable Labels and Bounding Boxes**: The detected objects are assigned labels, and bounding boxes are created around them. Both the labels and the bounding boxes are editable by the user.

- **Data Export**: After reviewing or editing, the user can export the label data and bounding box coordinates in various formats:
  - JSON
  - CSV
  - XML
  - SQL

## Usage

1. **Launch the Application**: Once the application is running, you'll see two options:
   - **Upload an Image**: Click on the upload button to select an image from your device.
   - **Capture an Image**: Use your webcam to capture a real-time image.

2. **AI-Powered Object Detection**: After uploading or capturing the image, the AI model will process it and detect objects. Bounding boxes with labels will appear around the detected objects.

3. **Edit Labels and Bounding Boxes**: The labels and bounding boxes can be manually edited by clicking on them. You can:
   - Change the label name.
   - Resize or move the bounding box.

4. **Export Data**: After editing, click on the export button and select the desired format to save the label and bounding box data (JSON, CSV, XML, or SQL).


## Technologies Used

- **Electron.js**: Cross-platform desktop app framework.
- **AI/ML**: [PyTorch](https://pytorch.org/), yoloCV, OpenCV
- **Frontend**: HTML, CSS, JavaScript, Tailwind, React.
- **Backend**: FastAPI 
- **Data Export**: JSON, CSV, XML, SQL.

## Contribution

We welcome contributions! If you would like to improve this project, please follow these steps:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-branch-name`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch-name`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, feel free to contact:
- **Your Name**: your.email@example.com
- GitHub: [your-username](https://github.com/your-username)