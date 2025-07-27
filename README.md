# 🛡️ AI-Powered Smart Surveillance System

> A real-time crime detection and tracking solution using AI-powered surveillance, built by **Team Guardian Eye**.

## 👥 Team Members
- Abinav S
- Dhilip
- Lokeshwaran

## 🚀 Overview

The **AI-Powered Smart Surveillance System** addresses the inefficiencies of manual CCTV monitoring by automating the process of suspect detection, tracking, and alert generation across city-wide camera networks.

This project was built under the **Open Innovation** track to enhance real-time crime investigation and improve public safety using computer vision and AI.

---

## 🧠 Problem Statement

Monitoring crime using traditional CCTV systems is manual, time-consuming, and lacks scalability. This project aims to:
- Automate object and person detection.
- Enable cross-camera tracking.
- Provide real-time alerts for suspicious activity.

---

## 🎯 Proposed Solution

We designed an **AI-driven surveillance system** that:
- Integrates multiple CCTV feeds into a unified platform.
- Uses object detection and facial recognition to identify suspects.
- Tracks individuals across different locations using smart tracking.
- Triggers alerts when suspicious behavior is detected.

---

## 🛠️ Tech Stack

### 🔍 AI / Machine Learning
- **YOLO** – Real-time object detection.
- **DeepSORT** – Multi-object tracking.
- **dlib + OpenCV** – Face detection and recognition.

### 🌐 Backend
- **NestJS** – Scalable backend framework.
- **Prisma** – Database ORM.
- **SQLite** – Lightweight relational database.

### 🖥️ Frontend
- **React.js** – Interactive UI for monitoring and control dashboard.

---

## 🧱 System Architecture

1. **CCTV Integration**  
   Centralized collection of multiple camera feeds into the backend.

2. **Object Detection**  
   YOLO detects humans and other objects of interest in real-time.

3. **Cross-Camera Tracking**  
   DeepSORT maintains tracking IDs of individuals across frames and locations.

4. **Face Recognition**  
   dlib + OpenCV recognize known or flagged faces.

5. **Alert System**  
   Suspicious movements or entries trigger live alerts for authorities.

---

## 🔐 Real-World Applications

### 🎯 Target Users
- Law enforcement agencies
- Security firms
- Smart city projects

### 🌍 Market Relevance
- Rising need for automated surveillance in crime-prone zones.
- Enhances efficiency of investigation with faster response time.

---

## 🌱 Future Enhancements

- Integration with **city-wide public camera networks**.
- Add **vehicle tracking** using ANPR (Automatic Number Plate Recognition).
- Improve **alert intelligence** using anomaly detection.
- Deploy on edge devices for **low-latency real-time processing**.

---


## 🏆 Impact Summary

- ✅ **Innovation**: Smart surveillance combining detection, tracking, and alerting.  
- ✅ **Feasibility**: Compatible with existing infrastructure.  
- ✅ **Technical Depth**: Combines deep learning, facial recognition, and scalable backend.  
- ✅ **Social Impact**: Assists in crime prevention and enhances public safety.

---

## 📎 License
This project is open-source and licensed under the [MIT License](LICENSE).

---

