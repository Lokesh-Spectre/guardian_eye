from ultralytics import YOLO
import torchreid
from torchreid.utils import FeatureExtractor
import cv2
import torch
import numpy as np
from scipy.spatial.distance import cosine
from facenet_pytorch import InceptionResnetV1  # Face recognition model
import os
import urllib.request
img=r"C:\Users\dhili\Desktop\WhatsApp Image 2025-03-05 at 15.48.54_b00c0d5c.jpg"
src=r"C:\Users\dhili\Desktop\WhatsApp Video 2025-03-05 at 23.17.22_884ddc77.mp4"

# Paths for face detection model files
models_dir = os.path.join(os.path.dirname(os.path.abspath(_file_)), "models")
os.makedirs(models_dir, exist_ok=True)

# Model file URLs
prototxt_url = "https://github.com/opencv/opencv/raw/master/samples/dnn/face_detector/deploy.prototxt"
caffemodel_url = "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"

# Define file paths
prototxt_path = os.path.join(models_dir, "deploy.prototxt")
caffemodel_path = os.path.join(models_dir, "res10_300x300_ssd_iter_140000.caffemodel")

# Download files if they don't exist
def download_file(url, dest_path):
    if not os.path.exists(dest_path):
        print(f"Downloading {os.path.basename(dest_path)}...")
        urllib.request.urlretrieve(url, dest_path)
        print(f"Downloaded {os.path.basename(dest_path)}")
    else:
        print(f"{os.path.basename(dest_path)} already exists.")

# Download model files
download_file(prototxt_url, prototxt_path)
download_file(caffemodel_url, caffemodel_path)


# Initialize models
yolo_model = YOLO("yolo11x.pt")
face_extractor = InceptionResnetV1(pretrained='vggface2').eval()  # Face feature extractor
device = 'cuda' if torch.cuda.is_available() else 'cpu'
face_extractor = face_extractor.to(device)

# Face detection model (OpenCV DNN)
# Update the face detector initialization to use the file paths
face_net = cv2.dnn.readNetFromCaffe(
    prototxt_path,
    caffemodel_path
)


# Configuration
REID_IMAGE_SIZE = (256, 128)
FACE_IMAGE_SIZE = (160, 160)
MIN_FACE_SIZE = 50
MIN_PERSON_HEIGHT = 100
FACE_CONFIDENCE = 0.9
FACE_SIM_WEIGHT = 0.7  # Weight for face similarity in combined score

# Initialize ReID extractor
reid_extractor = FeatureExtractor(
    model_name='osnet_x1_0',
    device=device
)

def detect_faces(image):
    """Detect faces using OpenCV's DNN face detector"""
    h, w = image.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0, 
                               (300, 300), (104.0, 177.0, 123.0))
    face_net.setInput(blob)
    detections = face_net.forward()
    
    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > FACE_CONFIDENCE:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            x1, y1, x2, y2 = box.astype("int")
            # Ensure valid coordinates and minimum size
            if (x2 - x1) > MIN_FACE_SIZE and (y2 - y1) > MIN_FACE_SIZE:
                faces.append((x1, y1, x2, y2))
    return faces

def preprocess_face(face_img):
    """Preprocess face image for FaceNet model"""
    face_img = cv2.resize(face_img, FACE_IMAGE_SIZE)
    face_img = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
    face_img = (face_img / 255.0 - 0.5) / 0.5  # Normalize to [-1, 1]
    return torch.tensor(face_img.transpose(2, 0, 1), 
                      dtype=torch.float32).unsqueeze(0).to(device)

def get_color_histogram(img):
    """Get color histogram for clothing analysis"""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1], None, [180, 256], [0, 180, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    return hist

# Process query image

query_img = cv2.imread(img)
if query_img is None:
    print(f"Error loading query image: {img}")
    exit(1)

# Detect person in query image
results = yolo_model.predict(query_img, conf=0.7, classes=[0])
query_person = None
best_area = 0
for r in results:
    for box in r.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        area = (x2 - x1) * (y2 - y1)
        if area > best_area and (y2 - y1) > MIN_PERSON_HEIGHT:
            best_area = area
            query_person = query_img[y1:y2, x1:x2]

if query_person is None:
    print("No person detected in query image")
    exit(1)

# Extract query features
query_features = {
    'face': None,
    'body': None,
    'colors': None
}

# Face features
faces = detect_faces(query_person)
if faces:
    # Take largest face
    x1f, y1f, x2f, y2f = max(faces, key=lambda f: (f[2]-f[0])*(f[3]-f[1]))
    face_img = query_person[y1f:y2f, x1f:x2f]
    if face_img.size > 0:
        with torch.no_grad():
            face_tensor = preprocess_face(face_img)
            query_features['face'] = face_extractor(face_tensor).cpu().numpy().flatten()
            query_features['face'] /= np.linalg.norm(query_features['face'])

# Body features
reid_img = cv2.resize(query_person, REID_IMAGE_SIZE)
reid_img = cv2.cvtColor(reid_img, cv2.COLOR_BGR2RGB)
query_features['body'] = reid_extractor([reid_img])[0].cpu().numpy()
query_features['body'] /= np.linalg.norm(query_features['body'])

# Color features (split upper/lower body)
h = query_person.shape[0]
upper = query_person[:h//2, :]
lower = query_person[h//2:, :]
query_features['colors'] = np.concatenate([
    get_color_histogram(upper),
    get_color_histogram(lower)
])

# Video processing
cap = cv2.VideoCapture(src)
best_match = {'similarity': 0, 'frame': None, 'box': None}

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        break

    results = yolo_model.predict(frame, conf=0.7, classes=[0])
    
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            if (y2 - y1) < MIN_PERSON_HEIGHT:
                continue
            
            person_crop = frame[y1:y2, x1:x2]
            
            # Initialize target features
            target_features = {
                'face': None,
                'body': None,
                'colors': None
            }

            # Extract face features
            faces = detect_faces(person_crop)
            if faces:
                x1f, y1f, x2f, y2f = max(faces, key=lambda f: (f[2]-f[0])*(f[3]-f[1]))
                face_img = person_crop[y1f:y2f, x1f:x2f]
                if face_img.size > 0:
                    with torch.no_grad():
                        face_tensor = preprocess_face(face_img)
                        target_features['face'] = face_extractor(face_tensor).cpu().numpy().flatten()
                        target_features['face'] /= np.linalg.norm(target_features['face'])

            # Extract body features
            reid_img = cv2.resize(person_crop, REID_IMAGE_SIZE)
            reid_img = cv2.cvtColor(reid_img, cv2.COLOR_BGR2RGB)
            target_features['body'] = reid_extractor([reid_img])[0].cpu().numpy()
            target_features['body'] /= np.linalg.norm(target_features['body'])

            # Extract color features
            h_p = person_crop.shape[0]
            upper_p = person_crop[:h_p//2, :]
            lower_p = person_crop[h_p//2:, :]
            target_features['colors'] = np.concatenate([
                get_color_histogram(upper_p),
                get_color_histogram(lower_p)
            ])

            # Calculate similarities
            similarities = []
            
            # Face similarity
            if query_features['face'] is not None and target_features['face'] is not None:
                face_sim = np.dot(query_features['face'], target_features['face'])
                similarities.append(face_sim * FACE_SIM_WEIGHT)
            
            # Body similarity
            body_sim = 1 - cosine(query_features['body'], target_features['body'])
            similarities.append(body_sim * (1 - FACE_SIM_WEIGHT))
            
            # Color similarity
            color_sim = cv2.compareHist(
                query_features['colors'].astype(np.float32),
                target_features['colors'].astype(np.float32),
                cv2.HISTCMP_BHATTACHARYYA
            )
            similarities.append((1 - color_sim) * 0.3)  # Lower weight for colors
            
            # Combined similarity score
            total_sim = sum(similarities) / len(similarities)
            
            # Update best match
            if total_sim > best_match['similarity']:
                best_match['similarity'] = total_sim
                best_match['frame'] = frame.copy()
                best_match['box'] = (x1, y1, x2, y2)

            # Visualization
            color = (0, 255, 0) if total_sim > 0.6 else (0, 0, 255)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"{total_sim:.2f}", (x1, y1-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    
    cv2.imshow("Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

# Save best match
if best_match['frame'] is not None:
    x1, y1, x2, y2 = best_match['box']
    cv2.rectangle(best_match['frame'], (x1, y1), (x2, y2), (0, 255, 255), 3)
    cv2.imwrite("best_match.jpg", best_match['frame'])
    print(f"Best similarity: {best_match['similarity']:.2f}")
else:
    print("No matches found")