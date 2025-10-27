# ==================== 2. 匯入模組 ====================
import os
from pathlib import Path
import pandas as pd
import random
import cv2
import numpy as np
import matplotlib.pyplot as plt
from ultralytics import YOLO
from IPython.display import display
from google.colab import files
from google.colab import drive
import os

drive.mount('/content/drive',force_remount=True)

# ==================== 4. 設定資料夾路徑 ====================
train_path = "/content/drive/MyDrive/DATA-Train/Dark_Circles/train/images"
val_path = "/content/drive/MyDrive/DATA-Train/Dark_Circles/valid/images"
test_path = "/content/drive/MyDrive/DATA-Train/Dark_Circles/test/images"


# ==================== 6. 載入並訓練模型（使用 yolov8x） ====================
model = YOLO("yolov8l.pt")  # 或 yolov8n.pt、yolov8m.pt


model.train(
    data="/content/drive/MyDrive/DATA-Train/Dark_Circles/data.yaml",
    epochs=30,
    batch=16,
    imgsz=640,
    device=0,
    save_dir="/content/drive/MyDrive/DATA-Train/Dark_Circles",
    name="DarkCirclesTrain_v1"  # 新增這行！自訂名字
)

# Step 1: 重新載入 DarkCirclesTrain_v15 訓練好的模型
model = YOLO("/content/drive/MyDrive/DATA-Train/Dark_Circles/DarkCirclesTrain_v15/weights/best.pt")

# Step 2: 設定 test 圖片資料夾
test_path = "/content/drive/MyDrive/DATA-Train/Dark_Circles/test/images"

# 設定推論結果存的資料夾
save_path = "/content/drive/MyDrive/DATA-Train/Dark_Circles"
os.makedirs(save_path, exist_ok=True)

# Step 3: 隨機選一張 test 圖片做推論
img_list = os.listdir(test_path)
random_img = random.choice(img_list)
test_img_path = os.path.join(test_path, random_img)

# 推論
results = model(test_img_path)[0]

# 讀取原始圖片
img = cv2.imread(test_img_path)

# Step 4: 畫上推論結果
for box in results.boxes:
    x1, y1, x2, y2 = box.xyxy[0].tolist()
    cls = int(box.cls[0])
    label = model.names[cls]
    conf = box.conf[0]

    # 畫框和文字
    cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 0), 2)
    cv2.putText(img, f"{label} {conf:.2f}", (int(x1), int(y1) - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

# Step 5: 顯示推論後的圖片
# 注意cv2讀的圖片是BGR，要轉成RGB才顯色正確
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

plt.figure(figsize=(10, 8))
plt.imshow(img_rgb)
plt.axis('off')
plt.title(f"Inference Result: {random_img}")
plt.show()

# Step 6: 儲存推論後的圖片
save_img_path = os.path.join(save_path, random_img)
cv2.imwrite(save_img_path, img)

print(f"推論結果已儲存到: {save_img_path}")