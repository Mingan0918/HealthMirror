function loadPage(page, params = {}) {
    const url = new URL(`/${page}/partial/`, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
    });

    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content-area").innerHTML = html;
            initEditFormEvents();
        });
}

// 獲取並更新統計數據
function loadAdminStats() {
    console.log('loadAdminStats function called');
    fetch('/api/admin-stats/')
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Admin stats loaded:', data);
            
            // 檢查是否有錯誤
            if (data.error) {
                console.warn('API returned error:', data.error);
            }
            
            // 更新統計數字，添加動畫效果
            updateStatWithAnimation('userCount', data.userCount || 0);
            updateStatWithAnimation('healthCount', data.healthCount || 0);
            updateStatWithAnimation('personCount', data.personCount || 0);
            updateStatWithAnimation('imageCount', data.imageCount || 0);
        })
        .catch(error => {
            console.error('Error loading admin stats:', error);
            // 如果獲取失敗，顯示 0 而不是 "-"
            document.getElementById('userCount').textContent = '0';
            document.getElementById('healthCount').textContent = '0';
            document.getElementById('personCount').textContent = '0';
            document.getElementById('imageCount').textContent = '0';
        });
}

// 帶動畫效果的數字更新
function updateStatWithAnimation(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 1500; // 1.5秒動畫
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用緩動函數讓動畫更自然
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = targetValue.toLocaleString();
        }
    }
    
    requestAnimationFrame(animate);
}

function applyFilter(page, pageNumber = 1) {
    const date = document.getElementById("monthInput").value;
    const statusInput = document.querySelector('input[name="status"]');
    const [year, month] = date ? date.split("-") : [null, null];

    let status = statusInput ? statusInput.value : null;

    const params = { page: pageNumber };
    if (year) params.year = year;
    if (month) params.month = month;
    if (status) params.status = status;

    loadPage(page, params);
}

function deleteRecord(type, id) {
    if (confirm(`Are you sure you want to delete this ${type} record?`)) {
        fetch(`/adminpage/${type}/delete/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        })
        .then(response => {
            if (response.ok) {
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`);
                location.reload();
            } else {
                alert(`Failed to delete ${type}.`);
            }
        });
    }
}

function openEditModal(page, data) {

    if (page == 'user') {
        document.getElementById("editUserId").value = data.id;
        document.getElementById("editName").value = data.name;
        document.getElementById("editEmail").value = data.email;
        document.getElementById("editGender").value = data.gender;
        document.getElementById("editPhone").value = data.phone;
        document.getElementById("editAdmin").value = data.admin;
    }

    document.getElementById("editModal").style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("editModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function getCSRFToken() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return cookieValue || '';
}

function initEditFormEvents() {
    const form = document.getElementById("editForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const userId = document.getElementById("editUserId").value;
        const formData = new FormData(form);

        fetch(`/adminpage/user/edit/${userId}/`, {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": getCSRFToken()
            }
        })
        .then(response => {
            if (response.ok) {
                alert("User updated successfully!");
                closeModal();
                location.reload();
            } else {
                alert("Update failed.");
            }
        });
    });

    const closeBtn = document.querySelector("#editModal .close");
    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            const modal = document.getElementById("editModal");
            if (modal) modal.style.display = "none";
        });
    }
}

// 頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page DOM loaded');
    initEditFormEvents();
    
    // 檢查是否在 admin dashboard 頁面
    const userCountElement = document.getElementById('userCount');
    console.log('userCount element found:', !!userCountElement);
    
    if (userCountElement) {
        console.log('Loading admin stats...');
        loadAdminStats();
    } else {
        console.log('Not on admin dashboard page, skipping stats load');
    }
});
