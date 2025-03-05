from ultralytics import YOLO
import cv2
model = YOLO("yolo11x.pt")
src=r"C:\Users\dhili\Desktop\WhatsApp Video 2025-03-05 at 14.52.56_40f06e93.mp4"
# model.predict(src, save=True, imgsz=320, conf=0.5,show=True)
cap = cv2.VideoCapture(src)

# Loop through the video frames
while cap.isOpened():
    # Read a frame from the video
    success, frame = cap.read()

    if success:
        # Run YOLO inference on the frame
        results = model.predict(frame,conf=0.7,iou=0.7,classes=[0])

        # Visualize the results on the frame
        annotated_frame = results[0].plot()

        # Display the annotated frame
        cv2.imshow("YOLO Inference", annotated_frame)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        # Break the loop if the end of the video is reached
        break

# Release the video capture object and close the display window
cap.release()
cv2.destroyAllWindows()