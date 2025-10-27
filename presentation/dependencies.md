# Health Mirror 系統依賴包列表

本文檔列出了Health Mirror系統所需的所有Python依賴包，可通過pip在Conda環境中安裝。

## 核心依賴

```bash
# 創建並啟動Conda環境
conda create -n mirror python=3.9
conda activate mirror

# 核心機器學習和深度學習框架
conda install pytorch torchvision torchaudio 

# 計算機視覺和數據處理
conda install opencv matplotlib pandas numpy scikit-learn
pip install ultralytics  # YOLOv8實現
pip install insightface  # 面部識別框架
pip install deep-sort-realtime  # 目標追蹤

# Web框架和相關套件
pip install django  # Web應用框架
pip install djangorestframework  # RESTful API支持
pip install pillow  # 圖像處理
pip install python-decouple  # 配置管理

# PDF生成
pip install reportlab  # PDF報告生成

# 其他工具
pip install pyyaml  # YAML文件處理
```



## 開發工具（可選）

```bash
pip install jupyter  # Jupyter Notebook
pip install pytest  # 單元測試
pip install black  # 代碼格式化
pip install flake8  # 代碼檢查
```

## 部署工具（可選）

```bash
pip install gunicorn  # WSGI HTTP服務器
pip install whitenoise  # 靜態文件服務
pip install dj-database-url  # 數據庫URL配置
```

## 完整依賴列表

以下是系統所有Python依賴的完整列表，可以直接使用`pip install -r requirements.txt`安裝：

```
django>=4.0.0
djangorestframework>=3.14.0
python-decouple>=3.8
pillow>=10.0.0
ultralytics>=8.0.0
insightface>=0.7.0
deep-sort-realtime>=1.3.0
opencv-python>=4.8.0
numpy>=1.24.0
pandas>=2.0.0
matplotlib>=3.7.0
scikit-learn>=1.3.0
torch>=2.0.0
torchvision>=0.15.0
torchaudio>=2.0.0
reportlab>=4.0.0
pyyaml>=6.0.0
```

## 注意事項

1. PyTorch安裝可能需要根據您的CUDA版本進行調整
2. 某些依賴可能需要特定版本才能相互兼容
3. 在生產環境中，建議使用虛擬環境或容器技術（如Docker）來管理依賴