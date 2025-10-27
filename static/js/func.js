// home page -> realtime detection info
let detectionInterval = null;
let isDetectionActive = false;

function updateDetectionInfo() {
  if (isDetectionActive) {
    fetch('/detection_status/')
      .then(response => response.json())
      .then(data => {
        // Update existing elements in HTML
        const personElement = document.getElementById("person");
        const darkCirclesElement = document.getElementById("dark_circles");
        const lipTypeElement = document.getElementById("lip_type");
        const skinConditionElement = document.getElementById("skin_condition");
        
        if (personElement) personElement.innerText = data.person || "Unknown";
        if (darkCirclesElement) darkCirclesElement.innerText = data.dark_circles || "none";
        if (lipTypeElement) lipTypeElement.innerText = data.lip_type || "normal";
        if (skinConditionElement) skinConditionElement.innerText = data.skin_condition || "healthy";
      })
      .catch(error => {
        console.error('Error fetching detection status:', error);
      });
  }
}

function startDetection() {
  console.log("startDetection function called");
  
  if (!isDetectionActive) {
    console.log("Starting detection...");
    
    fetch('/start_detection/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        console.log("Start detection response status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("Start detection response data:", data);
        
        if (data.status === 'success') {
            isDetectionActive = true;
            
            // Show detection image and hide placeholder
            const detectedImage = document.getElementById("detected");
            const placeholder = document.getElementById("detectionPlaceholder");
            const startBtn = document.getElementById("startDetectionBtn");
            const stopBtn = document.getElementById("stopDetectionBtn");
            
            console.log("Elements found:", {
                detectedImage: !!detectedImage,
                placeholder: !!placeholder,
                startBtn: !!startBtn,
                stopBtn: !!stopBtn
            });
            
            if (detectedImage && placeholder) {
              console.log("Switching image visibility...");
              detectedImage.style.display = "block";
              placeholder.style.display = "none";
              console.log("Image visibility switched");
            } else {
              console.error("Could not find required elements");
            }
            
            // Switch button visibility
            if (startBtn && stopBtn) {
              startBtn.style.display = "none";
              stopBtn.style.display = "inline-flex";
              console.log("Button visibility switched");
            }
            
            // Start the detection interval
            detectionInterval = setInterval(updateDetectionInfo, 1000);
            console.log("Detection interval started");
            
            console.log("Detection started successfully");
        } else {
            console.error('Failed to start detection:', data.message);
        }
    })
    .catch(error => {
        console.error('Error starting detection:', error);
    });
  } else {
    console.log("Detection is already active");
  }
}

function stopDetection() {
    console.log("stopDetection function called");
    
    fetch('/stop_detection/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        console.log("Response status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("Response data:", data);
        if (data.status === 'success') {
            isDetectionActive = false;
            
            // Hide detection image and show placeholder
            const detectedImage = document.getElementById("detected");
            const placeholder = document.getElementById("detectionPlaceholder");
            const startBtn = document.getElementById("startDetectionBtn");
            const stopBtn = document.getElementById("stopDetectionBtn");
            
            console.log("Elements found:", {
                detectedImage: !!detectedImage,
                placeholder: !!placeholder,
                startBtn: !!startBtn,
                stopBtn: !!stopBtn
            });
            
            if (detectedImage && placeholder) {
              detectedImage.style.display = "none";
              placeholder.style.display = "flex";
              console.log("Image visibility updated");
            }
            
            // Switch button visibility
            if (startBtn && stopBtn) {
              startBtn.style.display = "inline-flex";
              stopBtn.style.display = "none";
              console.log("Button visibility updated");
            }
            
            // Clear the detection interval
            if (detectionInterval) {
              clearInterval(detectionInterval);
              detectionInterval = null;
              console.log("Detection interval cleared");
            }
            
            // Reset detection info
            const personElement = document.getElementById("person");
            const darkCirclesElement = document.getElementById("dark_circles");
            const lipTypeElement = document.getElementById("lip_type");
            const skinConditionElement = document.getElementById("skin_condition");
            
            if (personElement) personElement.innerText = "None";
            if (darkCirclesElement) darkCirclesElement.innerText = "-";
            if (lipTypeElement) lipTypeElement.innerText = "-";
            if (skinConditionElement) skinConditionElement.innerText = "-";
            
            console.log("Detection stopped successfully");
        } else {
            console.error('Failed to stop detection:', data.message);
        }
    })
    .catch(error => {
        console.error('Error stopping detection:', error);
    });
}

// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Initialize on page load
window.onload = function() {
  // Set initial state - detection is off
  isDetectionActive = false;
  const detectedImage = document.getElementById("detected");
  const placeholder = document.getElementById("detectionPlaceholder");
  
  if (detectedImage && placeholder) {
    detectedImage.style.display = "none";
    placeholder.style.display = "flex";
  }
};

// record page -> show image
function showImage(url) {
    const modal = document.getElementById("imageModal");
    const img = document.getElementById("modalImage");
    img.src = url;
    modal.style.display = "flex";
}
function hideImage() {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("modalImage");
    modalImg.src = "";
    modal.style.display = "none";
}

// download window
function openModal() {
    document.getElementById('monthModal').style.display = 'flex';
}
function closeModal() {
    document.getElementById('monthModal').style.display = 'none';
}



const downloadForm = document.getElementById("downloadForm");
if (downloadForm) {
    downloadForm.addEventListener("submit", handleDownloadSubmit, { once: true });
}


function handleDownloadSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const month = form.querySelector('select[name="month"]').value;

    fetch(`/download_report/?month=${month}`)
        .then(response => {
            const contentType = response.headers.get("Content-Type");

            if (contentType.includes("application/json")) {
                return response.json().then(data => {
                    alert(data.message);
                });
            } else {
                return response.blob().then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `HealthReport_${month}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
            }
        })
        .catch(() => {
            alert("An error occurred while downloading.");
        });
}





// async function loadChartData() {
//     const response = await fetch('/api/safety-stats/');
//     const stats = await response.json();

//     const labels = Object.keys(stats); // ['Hat', 'No Hat', 'Vest', 'No Vest']
//     const data = Object.values(stats); // [10, 5, 2, 8]（示例）

//     const ctx = document.getElementById('donutChart').getContext('2d');
//     new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: 'Count',
//                 data: data,
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.7)',
//                     'rgba(54, 162, 235, 0.7)',
//                     'rgba(255, 206, 86, 0.7)',
//                     'rgba(75, 192, 192, 0.7)'
//                 ],
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 legend: {
//                     position: 'bottom',
//                 },
//                 title: {
//                     display: true,
//                     text: 'Safety Status'
//                 }
//             }
//         }
//     });
// }

// loadChartData();

// Photo upload functionality
function triggerFileUpload() {
    document.getElementById('photoUpload').click();
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file!', 'error');
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size cannot exceed 10MB!', 'error');
        return;
    }

    // Check if filename contains user's name
    const filename = file.name.toLowerCase();
    const hasPersonalName = filename.includes('ming') || filename.includes('sheng') || 
                           filename.includes('an') || filename.includes('wei') ||
                           filename.includes('user') || filename.includes('person');
    
    if (!hasPersonalName) {
        showConfirmDialog(
            'Reminder: Please rename your photo to your name (e.g., MingAn.jpg) for better system recognition.',
            'Continue uploading?',
            () => {
                // User confirmed, proceed with upload
                proceedWithUpload(file, event);
            },
            () => {
                // User cancelled, clear file input
                event.target.value = '';
            }
        );
        return;
    }

    // If filename is appropriate, proceed directly
    proceedWithUpload(file, event);
}

function proceedWithUpload(file, event) {
    // Create FormData for upload
    const formData = new FormData();
    formData.append('photo', file);

    // Show loading state
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    const originalText = uploadBtn.querySelector('.btn-text').textContent;
    uploadBtn.querySelector('.btn-text').textContent = 'Uploading...';
    uploadBtn.disabled = true;

    // Upload to server
    fetch('/upload_face_photo/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showSuccessAnimation('Photo uploaded successfully!', data.filename);
            console.log('Photo uploaded successfully:', data.filename);
        } else {
            showNotification('Upload failed: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error uploading photo:', error);
        showNotification('An error occurred during upload!', 'error');
    })
    .finally(() => {
        // Reset button state
        uploadBtn.querySelector('.btn-text').textContent = originalText;
        uploadBtn.disabled = false;
        // Clear file input
        event.target.value = '';
    });
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show custom confirm dialog
function showConfirmDialog(message, question, onConfirm, onCancel) {
    // Remove existing dialogs
    const existingDialogs = document.querySelectorAll('.confirm-dialog');
    existingDialogs.forEach(dialog => dialog.remove());

    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
        <div class="confirm-dialog-content">
            <div class="confirm-icon">⚠️</div>
            <div class="confirm-message">${message}</div>
            <div class="confirm-question">${question}</div>
            <div class="confirm-buttons">
                <button class="confirm-btn cancel-btn" onclick="handleConfirmCancel()">Cancel</button>
                <button class="confirm-btn ok-btn" onclick="handleConfirmOK()">OK</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // Store callbacks globally for button handlers
    window.currentConfirmCallbacks = { onConfirm, onCancel };

    // Trigger animation
    setTimeout(() => {
        dialog.classList.add('show');
    }, 100);
}

// Handle confirm dialog buttons
function handleConfirmOK() {
    const dialog = document.querySelector('.confirm-dialog');
    if (dialog) {
        dialog.classList.remove('show');
        setTimeout(() => {
            dialog.remove();
            if (window.currentConfirmCallbacks && window.currentConfirmCallbacks.onConfirm) {
                window.currentConfirmCallbacks.onConfirm();
            }
            window.currentConfirmCallbacks = null;
        }, 300);
    }
}

function handleConfirmCancel() {
    const dialog = document.querySelector('.confirm-dialog');
    if (dialog) {
        dialog.classList.remove('show');
        setTimeout(() => {
            dialog.remove();
            if (window.currentConfirmCallbacks && window.currentConfirmCallbacks.onCancel) {
                window.currentConfirmCallbacks.onCancel();
            }
            window.currentConfirmCallbacks = null;
        }, 300);
    }
}

// Show success animation
function showSuccessAnimation(message, filename) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.success-modal, .notification');
    existingNotifications.forEach(notification => notification.remove());

    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="success-modal-content">
            <div class="success-animation">
                <div class="checkmark-circle">
                    <div class="checkmark"></div>
                </div>
            </div>
            <h3>Upload Successful!</h3>
            <p>${message}</p>
            <p class="filename">Filename: ${filename}</p>
            <button class="success-btn" onclick="closeSuccessModal()">OK</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Trigger animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

// Close success modal
function closeSuccessModal() {
    const modal = document.querySelector('.success-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

