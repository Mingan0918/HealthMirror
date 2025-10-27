const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const monthSelector = document.getElementById('monthSelector');
const statsPercentage = document.getElementById('statsPercentage');
const progressCircle = document.getElementById('progressCircle');
const statsLabel = document.getElementById('statsLabel');

// 新增的元素
const selectedDateElement = document.getElementById('selectedDate');
const darkCirclesNoneCountElement = document.getElementById('darkCirclesNoneCount');
const darkCirclesIssuesCountElement = document.getElementById('darkCirclesIssuesCount');
const lipNormalCountElement = document.getElementById('lipNormalCount');
const lipIssuesCountElement = document.getElementById('lipIssuesCount');
const skinHealthyCountElement = document.getElementById('skinHealthyCount');
const skinIssuesCountElement = document.getElementById('skinIssuesCount');
const darkCirclesNoneProgressElement = document.getElementById('darkCirclesNoneProgress');
const darkCirclesIssuesProgressElement = document.getElementById('darkCirclesIssuesProgress');
const lipNormalProgressElement = document.getElementById('lipNormalProgress');
const lipIssuesProgressElement = document.getElementById('lipIssuesProgress');
const skinHealthyProgressElement = document.getElementById('skinHealthyProgress');
const skinIssuesProgressElement = document.getElementById('skinIssuesProgress');

let currentDate = new Date();
let dayStatusMap = {};
let selectedDate = null;

async function fetchStatus(year, month) {
    const response = await fetch(`/api/health-status/?year=${year}&month=${month + 1}`);
    if (response.ok) {
        dayStatusMap = await response.json();
    } else {
        dayStatusMap = {};
    }
}

// 獲取特定日期的詳細統計
async function fetchDailyDetails(dateStr) {
    try {
        const response = await fetch(`/api/daily-health-details/?date=${dateStr}`);
        if (response.ok) {
            const data = await response.json();
            updateDateDetails(data);
        } else {
            console.error('Failed to fetch daily details');
        }
    } catch (error) {
        console.error('Error fetching daily details:', error);
    }
}

// 動畫進度條函數
function animateProgressBar(element, targetPercent, duration = 1000) {
    // 重置進度條
    element.style.width = '0%';
    element.style.transition = 'none';
    
    // 強制重繪
    element.offsetHeight;
    
    // 添加過渡效果並設置目標寬度
    element.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    element.style.width = targetPercent + '%';
}

// 更新右側日期詳情顯示
function updateDateDetails(data) {
    const date = new Date(data.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    selectedDateElement.textContent = formattedDate;
    
    // 更新黑眼圈統計
    darkCirclesNoneCountElement.textContent = data.dark_circles_none || 0;
    darkCirclesIssuesCountElement.textContent = data.dark_circles_issues || 0;
    
    // 更新嘴唇統計
    lipNormalCountElement.textContent = data.lip_normal || 0;
    lipIssuesCountElement.textContent = data.lip_issues || 0;
    
    // 更新皮膚統計
    skinHealthyCountElement.textContent = data.skin_healthy || 0;
    skinIssuesCountElement.textContent = data.skin_issues || 0;
    
    // 計算總數
    const totalDarkCircles = (data.dark_circles_none || 0) + (data.dark_circles_issues || 0);
    const totalLip = (data.lip_normal || 0) + (data.lip_issues || 0);
    const totalSkin = (data.skin_healthy || 0) + (data.skin_issues || 0);
    
    // 計算並動畫設置進度條
    if (totalDarkCircles > 0) {
        const darkCirclesNonePercent = ((data.dark_circles_none || 0) / totalDarkCircles) * 100;
        const darkCirclesIssuesPercent = ((data.dark_circles_issues || 0) / totalDarkCircles) * 100;
        
        // 添加延遲以創建階段性動畫效果
        setTimeout(() => animateProgressBar(darkCirclesNoneProgressElement, darkCirclesNonePercent, 800), 100);
        setTimeout(() => animateProgressBar(darkCirclesIssuesProgressElement, darkCirclesIssuesPercent, 800), 200);
    } else {
        animateProgressBar(darkCirclesNoneProgressElement, 0, 400);
        animateProgressBar(darkCirclesIssuesProgressElement, 0, 400);
    }
    
    if (totalLip > 0) {
        const lipNormalPercent = ((data.lip_normal || 0) / totalLip) * 100;
        const lipIssuesPercent = ((data.lip_issues || 0) / totalLip) * 100;
        
        setTimeout(() => animateProgressBar(lipNormalProgressElement, lipNormalPercent, 800), 300);
        setTimeout(() => animateProgressBar(lipIssuesProgressElement, lipIssuesPercent, 800), 400);
    } else {
        setTimeout(() => animateProgressBar(lipNormalProgressElement, 0, 400), 300);
        setTimeout(() => animateProgressBar(lipIssuesProgressElement, 0, 400), 400);
    }
    
    if (totalSkin > 0) {
        const skinHealthyPercent = ((data.skin_healthy || 0) / totalSkin) * 100;
        const skinIssuesPercent = ((data.skin_issues || 0) / totalSkin) * 100;
        
        setTimeout(() => animateProgressBar(skinHealthyProgressElement, skinHealthyPercent, 800), 500);
        setTimeout(() => animateProgressBar(skinIssuesProgressElement, skinIssuesPercent, 800), 600);
    } else {
        setTimeout(() => animateProgressBar(skinHealthyProgressElement, 0, 400), 500);
        setTimeout(() => animateProgressBar(skinIssuesProgressElement, 0, 400), 600);
    }
}

// 計算當月健康百分比
function calculateHealthPercentage() {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let healthyDays = 0;
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const isoDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') +
                            '-' + String(date.getDate()).padStart(2, '0');
        
        if (!dayStatusMap[isoDate]) {
            healthyDays++;
        }
    }
    
    return Math.round((healthyDays / totalDays) * 100);
}

// 更新統計圓圈
function updateStatsCircle(percentage) {
    const circumference = 2 * Math.PI * 130; // r=130
    const offset = circumference - (percentage / 100) * circumference;
    
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;
    
    statsPercentage.textContent = `${percentage}%`;
}

const updateCalendar = async () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 0);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();

    const monthYearString = currentDate.toLocaleString('default', {month:'long', year: 'numeric'});
    monthYearElement.textContent = monthYearString;

    // 更新月份選擇器
    monthSelector.value = currentMonth;

    await fetchStatus(currentYear, currentMonth);

    let datesHTML = '';

    for (let i = firstDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
        datesHTML += `<div class="date inactive">${prevDate.getDate()}</div>`;
    }

    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const isoDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') +
                            '-' + String(date.getDate()).padStart(2, '0');

        const isAbnormal = dayStatusMap[isoDate] === true;
        const dangerClass = isAbnormal ? 'danger' : '';
        const selectedClass = selectedDate === isoDate ? 'selected' : '';
        datesHTML += `<div class="date ${dangerClass} ${selectedClass}" data-date="${isoDate}">${i}</div>`;
    }

    for (let i = 1; i <= 7 - lastDayIndex; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        datesHTML += `<div class="date inactive">${nextDate.getDate()}</div>`;
    }

    datesElement.innerHTML = datesHTML;
    
    // 添加點擊事件監聽器
    const dateElements = datesElement.querySelectorAll('.date:not(.inactive)');
    dateElements.forEach(dateEl => {
        dateEl.addEventListener('click', () => {
            // 移除之前選中的樣式
            dateElements.forEach(el => el.classList.remove('selected'));
            // 添加選中樣式
            dateEl.classList.add('selected');
            
            const clickedDate = dateEl.getAttribute('data-date');
            selectedDate = clickedDate;
            fetchDailyDetails(clickedDate);
        });
    });
    
    // 更新統計
    const healthPercentage = calculateHealthPercentage();
    updateStatsCircle(healthPercentage);
}

// 月份選擇器事件
monthSelector.addEventListener('change', () => {
    currentDate.setMonth(parseInt(monthSelector.value));
    selectedDate = null; // 重置選中的日期
    selectedDateElement.textContent = 'Select a Date';
    darkCirclesNoneCountElement.textContent = '0';
    darkCirclesIssuesCountElement.textContent = '0';
    lipNormalCountElement.textContent = '0';
    lipIssuesCountElement.textContent = '0';
    skinHealthyCountElement.textContent = '0';
    skinIssuesCountElement.textContent = '0';
    darkCirclesNoneProgressElement.style.width = '0%';
    darkCirclesIssuesProgressElement.style.width = '0%';
    lipNormalProgressElement.style.width = '0%';
    lipIssuesProgressElement.style.width = '0%';
    skinHealthyProgressElement.style.width = '0%';
    skinIssuesProgressElement.style.width = '0%';
    updateCalendar();
});

prev.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    selectedDate = null; // 重置選中的日期
    selectedDateElement.textContent = 'Select a Date';
    darkCirclesNoneCountElement.textContent = '0';
    darkCirclesIssuesCountElement.textContent = '0';
    lipNormalCountElement.textContent = '0';
    lipIssuesCountElement.textContent = '0';
    skinHealthyCountElement.textContent = '0';
    skinIssuesCountElement.textContent = '0';
    darkCirclesNoneProgressElement.style.width = '0%';
    darkCirclesIssuesProgressElement.style.width = '0%';
    lipNormalProgressElement.style.width = '0%';
    lipIssuesProgressElement.style.width = '0%';
    skinHealthyProgressElement.style.width = '0%';
    skinIssuesProgressElement.style.width = '0%';
    updateCalendar();
});

next.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    selectedDate = null; // 重置選中的日期
    selectedDateElement.textContent = 'Select a Date';
    darkCirclesNoneCountElement.textContent = '0';
    darkCirclesIssuesCountElement.textContent = '0';
    lipNormalCountElement.textContent = '0';
    lipIssuesCountElement.textContent = '0';
    skinHealthyCountElement.textContent = '0';
    skinIssuesCountElement.textContent = '0';
    darkCirclesNoneProgressElement.style.width = '0%';
    darkCirclesIssuesProgressElement.style.width = '0%';
    lipNormalProgressElement.style.width = '0%';
    lipIssuesProgressElement.style.width = '0%';
    skinHealthyProgressElement.style.width = '0%';
    skinIssuesProgressElement.style.width = '0%';
    updateCalendar();
});

// 鼠標跟隨光效
function initMouseFollowLight() {
    const cards = document.querySelectorAll('.calendar-stats, .calendar, .date-details');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 設置CSS變量來控制光效位置
            this.style.setProperty('--mouse-x', x + 'px');
            this.style.setProperty('--mouse-y', y + 'px');
        });
        
        card.addEventListener('mouseleave', function() {
            // 重置光效位置到中心
            this.style.setProperty('--mouse-x', '50%');
            this.style.setProperty('--mouse-y', '50%');
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    updateCalendar();
    initMouseFollowLight();
});

// 每10秒更新一次日曆
setInterval(() => {
    updateCalendar();
}, 10000);