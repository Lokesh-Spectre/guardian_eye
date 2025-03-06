import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import cv2
import torch
import numpy as np
import insightface
from ultralytics import YOLO
from torchreid.utils import FeatureExtractor
from scipy.spatial.distance import cosine
from collections import deque

# Configuration
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

# Detection thresholds
FACE_THRESHOLD = 0.65
REID_THRESHOLD = 0.50
MIN_HEIGHT = 100
TRACKING_BUFFER = 25

# Feature weights
FACE_WEIGHT = 0.6
BODY_WEIGHT = 0.7
COLOR_WEIGHT = 0.3

class PersonComparator:
    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Using device: {self.device}")
        
        # Load models
        self.yolo = YOLO("yolov8x.pt")
        self.face_analyzer = insightface.app.FaceAnalysis()
        self.face_analyzer.prepare(ctx_id=0 if self.device=='cuda' else -1, det_size=(640, 640))
        self.reid_model = FeatureExtractor(model_name='osnet_x1_0', device=self.device)
        
        # Query person attributes
        self.query_face_feat = None
        self.query_body_feat = None
        self.query_color_feat = None
        self.query_gender = "unknown"
        self.query_age = 0
        self.query_dominant_color = "unknown"
        
        print("Models loaded successfully")

    def get_dominant_color(self, image, k=1):
        """Get dominant color from upper body region"""
        h, w = image.shape[:2]
        upper_body = image[:h//2, :]
        pixels = upper_body.reshape(-1, 3)
        pixels = np.float32(pixels)
        
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, 0.1)
        _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        center = np.uint8(centers)[0]
        return self.color_name(center)

    def color_name(self, bgr):
        """Convert BGR color to name approximation"""
        colors = {
            'red': [0, 0, 255],
            'blue': [255, 0, 0],
            'green': [0, 255, 0],
            'black': [0, 0, 0],
            'white': [255, 255, 255],
            'yellow': [0, 255, 255],
            'purple': [255, 0, 255],
            'orange': [0, 165, 255],
            'gray': [128, 128, 128]
        }
        min_dist = float('inf')
        color_name = 'unknown'
        for name, rgb in colors.items():
            dist = np.linalg.norm(bgr - rgb[::-1])  # Convert RGB to BGR
            if dist < min_dist:
                min_dist = dist
                color_name = name
        return color_name

    def load_query(self, image_path):
        """Load and analyze query image"""
        print(f"Processing query image: {image_path}")
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        
        # Face analysis
        faces = self.face_analyzer.get(image)
        if faces:
            face = max(faces, key=lambda x: x.det_score)
            self.query_face_feat = face.embedding / np.linalg.norm(face.embedding)
            self.query_gender = "Male" if face.gender == 1 else "Female"
            self.query_age = int(face.age)
        
        # Body features
        self.query_body_feat = self.extract_body_features(image)
        
        # Color analysis
        self.query_dominant_color = self.get_dominant_color(image)
        
        print(f"Query person attributes - Gender: {self.query_gender}, "
              f"Age: {self.query_age}, Dominant Color: {self.query_dominant_color}")

    def extract_body_features(self, image):
        """Extract ReID features"""
        resized = cv2.resize(image, (128, 256))
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        with torch.no_grad():
            features = self.reid_model([rgb])[0].cpu().numpy()
        return features / np.linalg.norm(features)

    def analyze_person(self, person_img):
        """Analyze detected person for similarity"""
        similarity_reasons = []
        total_score = 0
        weights = []
        
        # Face comparison
        faces = self.face_analyzer.get(person_img)
        face_score = 0
        current_gender = "unknown"
        current_age = 0
        
        if faces and self.query_face_feat is not None:
            face = max(faces, key=lambda x: x.det_score)
            face_feat = face.embedding / np.linalg.norm(face.embedding)
            face_score = np.dot(face_feat, self.query_face_feat)
            current_gender = "Male" if face.gender == 1 else "Female"
            current_age = int(face.age)
            
            similarity_reasons.append(f"Face: {face_score*100:.1f}%")
            total_score += face_score * FACE_WEIGHT
            weights.append(FACE_WEIGHT)

        # Body comparison
        if self.query_body_feat is not None:
            body_feat = self.extract_body_features(person_img)
            body_score = 1 - cosine(body_feat, self.query_body_feat)
            similarity_reasons.append(f"Body: {body_score*100:.1f}%")
            total_score += body_score * BODY_WEIGHT
            weights.append(BODY_WEIGHT)

        # Color comparison
        current_color = self.get_dominant_color(person_img)
        color_score = 1 if current_color == self.query_dominant_color else 0.3
        similarity_reasons.append(f"Color: {current_color}")
        total_score += color_score * COLOR_WEIGHT
        weights.append(COLOR_WEIGHT)

        # Demographic comparison
        demo_reasons = []
        if current_gender == self.query_gender:
            demo_reasons.append("gender")
        if abs(current_age - self.query_age) <= 10:
            demo_reasons.append("age")
        
        if demo_reasons:
            similarity_reasons.append("Matched " + "+".join(demo_reasons))

        # Normalize total score
        if weights:
            total_score /= sum(weights)
        else:
            total_score = 0
            
        return total_score, similarity_reasons

    def process_video(self, video_path):
        """Process video stream, track the best matching person, and record entry/exit timestamps."""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("Could not open video source")
            
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter('output.mp4', fourcc, fps, (width, height))
        
        history = deque(maxlen=30)
        
        # Variables for tracking presence
        match_present = False
        match_intervals = []
        enter_time = None
        frame_index = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Calculate current time in seconds based on frame index
            current_time = frame_index / fps
            
            # Detect people (class 0 is usually 'person')
            results = self.yolo(frame, classes=[0])
            best_match = None
            best_score = 0
            best_reasons = []
            
            for box in results[0].boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                if (y2 - y1) < MIN_HEIGHT:
                    continue
                person_img = frame[y1:y2, x1:x2]
                score, reasons = self.analyze_person(person_img)
                if score > best_score:
                    best_score = score
                    best_match = (x1, y1, x2, y2)
                    best_reasons = reasons
            
            # Update history for smoothing
            history.append(best_score)
            smoothed_score = sum(history) / len(history) if history else 0
            
            # Check if match is present (using a threshold, here 0.5)
            if best_match and smoothed_score > 0.5:
                # If the match was not previously in the frame, record entry time.
                if not match_present:
                    enter_time = current_time
                    match_present = True
                    print(f"Match entered at {enter_time:.2f} seconds")
                # Draw bounding box and info
                x1, y1, x2, y2 = best_match
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                y_pos = y1 - 10 if y1 > 30 else y2 + 20
                cv2.putText(frame, f"Match: {smoothed_score*100:.1f}%", (x1, y_pos),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                for i, reason in enumerate(best_reasons):
                    cv2.putText(frame, reason, (10, 30 + i*30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            else:
                # If previously detected but now missing, record exit time.
                if match_present:
                    exit_time = current_time
                    match_intervals.append((enter_time, exit_time))
                    match_present = False
                    print(f"Match exited at {exit_time:.2f} seconds")
            
            out.write(frame)
            cv2.imshow("Person Search", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
            frame_index += 1
        
        # If match is still present at end of video, record exit at the final time.
        if match_present:
            exit_time = frame_index / fps
            match_intervals.append((enter_time, exit_time))
            print(f"Match exited at {exit_time:.2f} seconds (end of video)")
        
        cap.release()
        out.release()
        cv2.destroyAllWindows()
        
        # Merge intervals if the gap between intervals is less than 3 seconds
        if match_intervals:
            merged_intervals = [match_intervals[0]]
            for current in match_intervals[1:]:
                last = merged_intervals[-1]
                if current[0] - last[1] < 3:
                    # Merge the intervals by extending the end time
                    merged_intervals[-1] = (last[0], current[1])
                else:
                    merged_intervals.append+(current)
        else:
            merged_intervals = []

        # Print all merged intervals when the person was present.
        print("Merged match time intervals (in seconds):")
        for idx, (start, end) in enumerate(merged_intervals, 1):
            print(f"Interval {idx}: Start = {start:.2f}s, End = {end:.2f}s")

if __name__ == "__main__":
    comparator = PersonComparator()
    
    # Provide path to query image
    query_path = r"C:\Users\dhili\Desktop\WhatsApp Image 2025-03-06 at 19.08.40_13aa51e6.jpg"  # Replace with your image path
    comparator.load_query(query_path)
    
    # Provide path to search video
    video_path = r"C:\Users\dhili\Desktop\WhatsApp Video 2025-03-06 at 19.08.37_bc724ff5.mp4"  # Replace with your video path
    comparator.process_video(video_path)
