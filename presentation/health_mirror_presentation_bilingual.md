# Health Mirror 項目演講稿 - 中英文對照版
# Health Mirror Project Presentation - Bilingual Version

---

## 1. 項目介紹 / Project Introduction

各位好，我是今天的演講者，很榮幸為大家介紹我們的創新項目 - Health Mirror（健康鏡子）。

Good day, Judges and everyone. I’m honored to present our innovative project, Health Mirror, developed by our team from the New Era Institute of Vocational and Continuing Education. Our supervisor is Mr. Loo Wei Hou. I’m Soo Ming An, the group leader, and together with Assistant Leader Yap Sheng Wei and team members Foo Wei Heng, Lim Cherng Kae, and Lim Kai Jie, we’ve built this project to bring AI and health monitoring together in a smart and user-friendly way.

Health Mirror 是一個基於人工智能的健康監測系統，它結合了計算機視覺技術和智能醫療服務，旨在通過簡單的面部掃描來檢測用戶的健康狀況，並提供便捷的醫療預約服務。

Health Mirror is an AI-powered health monitoring system that combines computer vision technology with intelligent medical services. It aims to detect users' health conditions through simple facial scanning and provide convenient medical appointment services.

我們的系統能夠實時檢測面部健康指標，識別黑眼圈、唇部狀況和皮膚問題，提供個性化的健康建議，並連接線上醫院預約系統。

Our system can detect facial health indicators in real-time, identify dark circles, lip conditions, and skin problems, provide personalized health recommendations, and connect to online hospital appointment systems.

---

## 2. 現今社會健康問題 / Current Social Health Issues

在快節奏的現代生活中，人們往往忽視自己的健康，這背後有幾個深層原因：

In today's fast-paced modern life, people often neglect their health, and there are several underlying reasons for this:

首先是生活節奏過快。工作壓力大，加班成常態，人們沒有時間進行定期健康檢查，忙碌的生活讓人忽視身體的警告信號。

First is the fast pace of life. High work pressure and overtime have become the norm, people don't have time for regular health check-ups, and busy lives cause people to ignore their body's warning signals.

其次是健康意識不足。年輕人普遍認為自己身體健康，不需要特別關注，缺乏對早期健康問題的認識，等到症狀明顯時才意識到問題的嚴重性。

Second is insufficient health awareness. Young people generally believe they are healthy and don't need special attention, lack awareness of early health problems, and only realize the severity when symptoms become obvious.

第三是醫療資源獲取困難。醫院排隊時間長，預約困難，醫療費用高昂，地理位置限制使偏遠地區醫療資源稀缺。

Third is the difficulty in accessing medical resources. Long hospital queues, difficult appointments, high medical costs, and geographical limitations make medical resources scarce in remote areas.

最後是缺乏便捷的監測工具。傳統健康檢查需要專業設備和醫護人員，日常生活中缺乏簡單易用的健康監測方式。

Finally, there's a lack of convenient monitoring tools. Traditional health check-ups require professional equipment and medical staff, and there's a lack of simple and easy-to-use health monitoring methods in daily life.

---

## 3. 項目動機 / Project Motivation

正是基於這些社會問題，我決定開發 Health Mirror 項目。

It is based on these social problems that I decided to develop the Health Mirror project.

我的目標是創建一個能夠讓每個人都能輕鬆進行日常健康監測的系統，讓健康管理變得像照鏡子一樣簡單。

My goal is to create a system that allows everyone to easily conduct daily health monitoring, making health management as simple as looking in a mirror.

我希望通過技術的力量，降低健康監測的門檻，讓預防性醫療成為可能，幫助人們在健康問題早期就能發現並及時處理。

I hope to use the power of technology to lower the threshold for health monitoring, make preventive healthcare possible, and help people discover and address health problems early.

同時，我也希望能夠整合醫療資源，讓用戶能夠便捷地獲得專業的醫療服務，真正實現從檢測到治療的完整健康管理閉環。

At the same time, I also hope to integrate medical resources so that users can conveniently access professional medical services, truly achieving a complete health management loop from detection to treatment.

---

## 4. 技術架構與算法 / Technical Architecture and Algorithms

Health Mirror 採用了多種先進的人工智能算法來實現精準的健康檢測：

Health Mirror employs multiple advanced artificial intelligence algorithms to achieve precise health detection:

### YOLO (You Only Look Once)
我們使用了三個專門訓練的 YOLO 模型：DarkCircles.pt 用於黑眼圈檢測，Lip_types.pt 用於唇部狀況分析，skin.pt 用於皮膚問題識別。YOLO 算法能夠實時檢測和分類面部特徵，提供快速準確的健康狀況評估。

We use three trained YOLO models: The YOLO algorithm can detect and classify facial features in real-time, providing fast and accurate health condition assessments.

### OpenCV (計算機視覺庫)
OpenCV 負責圖像預處理、面部區域提取和圖像增強。它確保輸入到 AI 模型的圖像質量最佳，提高檢測準確性。

OpenCV handles image preprocessing, facial region extraction, and image enhancement. It ensures optimal image quality input to AI models, improving detection accuracy.

### InsightFace (面部識別)
InsightFace 用於人臉識別和用戶身份驗證，能夠準確識別不同用戶，為每個用戶建立個人化的健康檔案。

InsightFace is used for facial recognition and user authentication, accurately identifying different users and establishing personalized health profiles for each user.

### DeepSort (目標追蹤)
DeepSort 算法用於多目標追蹤，在多人環境中能夠穩定追蹤特定用戶，確保健康數據的準確歸屬。

The DeepSort algorithm is used for multi-object tracking, stably tracking specific users in multi-person environments, ensuring accurate attribution of health data.

---
This diagram shows how our Health Mirror system works. 

The camera captures live video, which is processed by OpenCV. 

The frames are analyzed using YOLOv8 and InsightFace to detect user identity and health conditions like dark circles, lip type, and skin sensitivity. 

These results are sent to the Django backend, where they are stored in a database and displayed on the front-end. Users can view their real-time results and access past records, making health monitoring accurate, fast, and user-friendly.

Result
Here are the results of our web-based system testing:

For dark circle detection, the accuracy is around 70–80%

For lip dry, the accuracy is around 80%

For facial recognition, the accuracy is around 70%


## 5. 線上掛號系統 / Online Appointment System
我們也只用Django 開發了自己的網頁，用戶可以通過我們人工智能的健康監測系統，獲得個人化的健康報告，以及線上預約服務。

Our system also uses Django to develop own website, allowing users to access our AI-powered health monitoring system and receive personalized health reports, as well as online appointment services.

我們的系統整合了完整的線上醫療預約功能：

Our system integrates complete online medical appointment functionality:

### 醫院選擇系統
用戶可以從多家合作醫院中選擇，包括 General Hospital KL、Pantai Hospital KL、Prince Court Medical Centre 和 Sunway Medical Centre。系統提供醫院地址、聯繫方式和地理位置信息。

Users can choose from multiple partner hospitals,The system provides hospital addresses, contact information, and geographical location data.

### 實時排隊查看
系統能夠實時顯示各醫院的排隊情況和可預約時段，幫助用戶選擇最適合的就診時間，減少等待時間。

And The system can display real-time queue status and available appointment slots for each hospital, helping users choose the most suitable consultation time and reduce waiting time.

### 智能預約管理
用戶可以根據檢測結果獲得就診建議，系統會根據健康問題的嚴重程度推薦合適的科室和醫生，實現從檢測到就診的無縫銜接。

Users can receive consultation recommendations based on detection results. The system recommends appropriate departments and doctors based on the severity of health problems, achieving seamless connection from detection to consultation.

---

## 6. 聯合國可持續發展目標 / UN Sustainable Development Goals

Health Mirror 項目積極響應聯合國可持續發展目標：

Our Health Mirror project actively responds to the UN Sustainable Development Goals:

### SDG 3: 良好健康與福祉 (Good Health and Well-Being)
通過提供便捷的健康監測工具，我們幫助人們及早發現健康問題，促進預防性醫療，提高整體健康水平。

By providing convenient health monitoring tools, we help people detect health problems early, promote preventive healthcare, and improve overall health levels.

### SDG 4: 優質教育 (Quality Education)
系統提供健康教育內容，幫助用戶了解各種健康問題的成因和預防方法，提高健康素養。

The system provides health education content, helping users understand the causes and prevention methods of various health problems, improving health literacy.

### SDG 9: 產業、創新和基礎設施 (Industry, Innovation and Infrastructure)
我們運用人工智能和計算機視覺等前沿技術，推動醫療健康領域的數字化轉型和創新發展。

We use cutting-edge technologies such as artificial intelligence and computer vision to promote digital transformation and innovative development in the healthcare field.

### SDG 11: 可持續城市和社區 (Sustainable Cities and Communities)
通過整合醫療資源和提供線上服務，我們幫助建設更加智能和可持續的健康城市生態系統。

By integrating medical resources and providing online services, we help build smarter and more sustainable healthy city ecosystems.

---

## 7. 結論 / Conclusion

Health Mirror 不僅僅是一個技術項目，更是對未來健康管理模式的探索和實踐。

Health Mirror is not just a technical project, but an exploration and practice of future health management models.

我們相信，通過人工智能技術的力量，可以讓健康監測變得更加便捷、準確和普及，讓每個人都能享受到優質的健康服務。

We believe that through the power of artificial intelligence technology, health monitoring can become more convenient, accurate, and accessible, allowing everyone to enjoy quality health services.

未來，我們將繼續優化算法精度，擴展檢測功能，整合更多醫療資源，為構建全民健康的美好社會貢獻我們的力量。

In the future, we will continue to optimize algorithm accuracy, expand detection functions, integrate more medical resources, and contribute to building a better society with universal health.

To learn more about our project, please scan the QR code below.

謝謝大家！

Thank you everyone!

---

**演講時間：約5分鐘**
**Presentation Time: Approximately 5 minutes**