# Health Mirror Line Chart Implementation

本文档包含了Health Mirror系统中Line Chart的完整实现代码，包括HTML模板和JavaScript实现。

## HTML Template Code (home.html)

### Line Chart Canvas Elements

```html
<!-- Health Issues Trend Line Chart -->
<div class="lineChart-container scroll-animate fade-in-up" data-delay="1300">
    <canvas id="skinLineChart" width="200px" height="100px"></canvas>
</div>

<!-- Skin Condition Issues Trend Line Chart -->
<div class="lineChart-container scroll-animate fade-in-up" data-delay="1500">
    <canvas id="lineChart" width="200px" height="100px"></canvas>
</div>
```

### Script Imports

```html
<script src="{% static 'js/chart.js' %}"></script>
<script src="{% static 'js/func.js' %}"></script>
<script src="{% static 'js/time.js' %}"></script>
<script src="{% static 'js/calendar.js' %}"></script>
<script src="{% static 'js/scroll-animations.js' %}"></script>
```

## JavaScript Implementation (chart.js)

### Global Variables

```javascript
// Global chart variables
let donutChart;
let donutChart2;
let lineChart;
let skinLineChart;
```

### Health Issues Trend Line Chart (loadChartData3)

```javascript
async function loadChartData3() {
    try {
        console.log('Loading chart data for lineChart...');
        const response = await fetch('/api/health-stats/');
        const stats = await response.json();
        console.log('Line chart data received:', stats);

        const labels = Object.keys(stats.dark_circles_data);
        const darkCirclesData = Object.values(stats.dark_circles_data);
        const lipData = Object.values(stats.lip_data);

        console.log('Line chart - Labels:', labels);
        console.log('Line chart - Dark Circles Data:', darkCirclesData);
        console.log('Line chart - Lip Data:', lipData);

        const ctx3 = document.getElementById('lineChart').getContext('2d');

        if (lineChart) {
            // if chart already exit -> update data
            lineChart.data.labels = labels;
            lineChart.data.datasets[0].data = darkCirclesData;
            lineChart.data.datasets[1].data = lipData;
            lineChart.update();
        }
        else {
        lineChart = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Dark Circles Issues',
                        data: darkCirclesData,
                        borderColor: '#FF006E',
                        backgroundColor: function(context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return null;
                            
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, 'rgba(255, 0, 110, 0.3)');
                            gradient.addColorStop(0.5, 'rgba(255, 0, 110, 0.15)');
                            gradient.addColorStop(1, 'rgba(255, 0, 110, 0.05)');
                            return gradient;
                        },
                        pointBackgroundColor: '#FF006E',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#FF006E',
                        pointHoverBorderWidth: 4,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        borderWidth: 4,
                        fill: true,
                        tension: 0.5,
                        segment: {
                            borderColor: function(ctx) {
                                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, ctx.chart.width, 0);
                                gradient.addColorStop(0, '#FF006E');
                                gradient.addColorStop(0.5, '#FF4081');
                                gradient.addColorStop(1, '#FF006E');
                                return gradient;
                            }
                        },
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round',
                        shadowColor: 'rgba(255, 0, 110, 0.4)',
                        shadowBlur: 15,
                        shadowOffsetX: 0,
                        shadowOffsetY: 5
                    },
                    {
                        label: 'Lip Issues',
                        data: lipData,
                        borderColor: '#3B82F6',
                        backgroundColor: function(context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return null;
                            
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
                            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
                            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
                            return gradient;
                        },
                        pointBackgroundColor: '#3B82F6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#3B82F6',
                        pointHoverBorderWidth: 4,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        borderWidth: 4,
                        fill: true,
                        tension: 0.5,
                        segment: {
                            borderColor: function(ctx) {
                                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, ctx.chart.width, 0);
                                gradient.addColorStop(0, '#3B82F6');
                                gradient.addColorStop(0.5, '#60A5FA');
                                gradient.addColorStop(1, '#3B82F6');
                                return gradient;
                            }
                        },
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round',
                        shadowColor: 'rgba(59, 130, 246, 0.4)',
                        shadowBlur: 15,
                        shadowOffsetX: 0,
                        shadowOffsetY: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Health Issues Trend',
                        font: {
                            size: 20,
                            weight: 'normal'
                        },
                        color: '#333',
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: 2,
                        cornerRadius: 12,
                        padding: 15,
                        displayColors: true,
                        titleFont: {
                            size: 16,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        animation: {
                            duration: 300,
                            easing: 'easeOutQuart'
                        },
                        callbacks: {
                            title: function(context) {
                                return `📅 ${context[0].label} Health Statistics`;
                            },
                            label: function(context) {
                                const datasetLabel = context.dataset.label;
                                const value = context.parsed.y;
                                const emoji = datasetLabel === 'Dark Circles Issues' ? '👁️' : '👄';
                                const type = datasetLabel === 'Dark Circles Issues' ? 'Dark Circles Issues' : 'Lip Issues';
                                
                                return `${emoji} ${type}: ${value} cases`;
                            },
                            afterBody: function(context) {
                                const darkCirclesValue = context.find(c => c.dataset.label === 'Dark Circles Issues')?.parsed.y || 0;
                                const lipValue = context.find(c => c.dataset.label === 'Lip Issues')?.parsed.y || 0;
                                const total = darkCirclesValue + lipValue;
                                
                                let status = '';
                                if (total === 0) {
                                    status = '✅ Perfect Health Record';
                                } else if (total <= 5) {
                                    status = '⚠️ Minor Health Issues';
                                } else if (total <= 10) {
                                    status = '🔶 Needs Attention';
                                } else {
                                    status = '🔴 Serious Health Concerns';
                                }
                                
                                return [
                                    `📊 Total Issues: ${total}`,
                                    `🎯 Health Level: ${status}`,
                                    `📈 Trend Analysis: Continuous Monitoring`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Month',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Issue Count',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 4,
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round'
                    },
                    point: {
                        radius: 8,
                        hoverRadius: 12,
                        borderWidth: 3,
                        hoverBorderWidth: 4,
                        pointStyle: 'circle'
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutCubic',
                    delay: function(context) {
                        return context.dataIndex * 200;
                    },
                    onProgress: function(animation) {
                        const chart = animation.chart;
                        const ctx = chart.ctx;
                        
                        // 添加進度動畫效果
                        chart.data.datasets.forEach((dataset, datasetIndex) => {
                            const meta = chart.getDatasetMeta(datasetIndex);
                            meta.data.forEach((point, index) => {
                                if (point && animation.currentStep / animation.numSteps > index / meta.data.length) {
                                    // 添加點的脈衝效果
                                    const progress = (animation.currentStep / animation.numSteps - index / meta.data.length) * meta.data.length;
                                    if (progress > 0 && progress < 1) {
                                        ctx.save();
                                        ctx.globalAlpha = 0.3 * (1 - progress);
                                        ctx.beginPath();
                                        ctx.arc(point.x, point.y, point.options.radius * (1 + progress * 2), 0, 2 * Math.PI);
                                        ctx.fillStyle = dataset.borderColor;
                                        ctx.fill();
                                        ctx.restore();
                                    }
                                }
                            });
                        });
                    },
                    onComplete: function() {
                        // 動畫完成後的回調
                        console.log('Line chart animation completed');
                    }
                },
                transitions: {
                    active: {
                        animation: {
                            duration: 400,
                            easing: 'easeOutQuart'
                        }
                    },
                    resize: {
                        animation: {
                            duration: 800,
                            easing: 'easeInOutCubic'
                        }
                    }
                },
                onHover: (event, activeElements, chart) => {
                    event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                },
                onClick: (event, activeElements) => {
                    // 點擊圖表時跳轉到 records 頁面
                    window.location.href = '/records/';
                },
                onMouseMove: (event, activeElements, chart) => {
                    // 獲取滑鼠位置
                    const rect = chart.canvas.getBoundingClientRect();
                    const x = event.native.clientX - rect.left;
                    const y = event.native.clientY - rect.top;
                    
                    // 創建擴散效果
                    createRippleEffect(chart.canvas.parentElement, x, y);
                    
                    // 檢查是否靠近數據點
                    const nearDataPoint = checkNearDataPoint(chart, x, y);
                    if (nearDataPoint) {
                        triggerBackgroundWave(chart.canvas.parentElement);
                    }
                }
            }
        });
    }
    } catch (error) {
        console.error('Error loading line chart data:', error);
    }
}
```

### Skin Condition Issues Trend Line Chart (loadSkinChartData)

```javascript
// skin condition line chart
async function loadSkinChartData() {
    try {
        console.log('Loading chart data for skinLineChart...');
        const response = await fetch('/api/health-stats/');
        const stats = await response.json();
        console.log('Skin chart data received:', stats);

        const labels = Object.keys(stats.skin_acne_data);
        const acneData = Object.values(stats.skin_acne_data);
        const dryData = Object.values(stats.skin_dry_data);
        const oilyData = Object.values(stats.skin_oily_data);
        const sensitiveData = Object.values(stats.skin_sensitive_data);

        console.log('Skin chart - Labels:', labels);
        console.log('Skin chart - Acne Data:', acneData);
        console.log('Skin chart - Dry Data:', dryData);
        console.log('Skin chart - Oily Data:', oilyData);
        console.log('Skin chart - Sensitive Data:', sensitiveData);

        const ctx4 = document.getElementById('skinLineChart').getContext('2d');

        if (skinLineChart) {
            // if chart already exit -> update data
            skinLineChart.data.labels = labels;
            skinLineChart.data.datasets[0].data = acneData;
            skinLineChart.data.datasets[1].data = dryData;
            skinLineChart.data.datasets[2].data = oilyData;
            skinLineChart.data.datasets[3].data = sensitiveData;
            skinLineChart.update();
        }
        else {
        skinLineChart = new Chart(ctx4, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Acne Issues',
                        data: acneData,
                        borderColor: '#EF4444',
                        backgroundColor: function(context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return null;
                            
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
                            gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.15)');
                            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
                            return gradient;
                        },
                        pointBackgroundColor: '#EF4444',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#EF4444',
                        pointHoverBorderWidth: 4,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        borderWidth: 4,
                        fill: true,
                        tension: 0.5,
                        segment: {
                            borderColor: function(ctx) {
                                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, ctx.chart.width, 0);
                                gradient.addColorStop(0, '#EF4444');
                                gradient.addColorStop(0.5, '#F87171');
                                gradient.addColorStop(1, '#EF4444');
                                return gradient;
                            }
                        },
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round',
                        shadowColor: 'rgba(239, 68, 68, 0.4)',
                        shadowBlur: 15,
                        shadowOffsetX: 0,
                        shadowOffsetY: 5
                    },
                    {
                        label: 'Dry Skin',
                        data: dryData,
                        borderColor: '#F59E0B',
                        backgroundColor: function(context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return null;
                            
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
                            gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
                            gradient.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
                            return gradient;
                        },
                        pointBackgroundColor: '#F59E0B',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#F59E0B',
                        pointHoverBorderWidth: 4,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        borderWidth: 4,
                        fill: true,
                        tension: 0.5,
                        segment: {
                            borderColor: function(ctx) {
                                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, ctx.chart.width, 0);
                                gradient.addColorStop(0, '#F59E0B');
                                gradient.addColorStop(0.5, '#FBBF24');
                                gradient.addColorStop(1, '#F59E0B');
                                return gradient;
                            }
                        },
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round',
                        shadowColor: 'rgba(245, 158, 11, 0.4)',
                        shadowBlur: 15,
                        shadowOffsetX: 0,
                        shadowOffsetY: 5
                    },
                    {
                        label: 'Oily Skin',
                        data: oilyData,
                        borderColor: '#3B82F6',
                        backgroundColor: function(context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return null;
                            
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
                            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
                            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
                            return gradient;
                        },
                        pointBackgroundColor: '#3B82F6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#3B82F6',
                        pointHoverBorderWidth: 4,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        borderWidth: 4,
                        fill: true,
                        tension: 0.5,
                        segment: {
                            borderColor: function(ctx) {
                                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, ctx.chart.width, 0);
                                gradient.addColorStop(0, '#3B82F6');
                                gradient.addColorStop(0.5, '#60A5FA');
                                gradient.addColorStop(1, '#3B82F6');
                                return gradient;
                            }
                        },
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round',
                        shadowColor: 'rgba(59, 130, 246, 0.4)',
                        shadowBlur: 15,
                        shadowOffsetX: 0,
                        shadowOffsetY: 5
                    },
                    {
                        label: 'Sensitive Skin',
                        data: sensitiveData,
                        borderColor: '#8B5CF6',
                        backgroundColor: function(context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            if (!chartArea) return null;
                            
                            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
                            gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.15)');
                            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
                            return gradient;
                        },
                        pointBackgroundColor: '#8B5CF6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#8B5CF6',
                        pointHoverBorderWidth: 4,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        borderWidth: 4,
                        fill: true,
                        tension: 0.5,
                        segment: {
                            borderColor: function(ctx) {
                                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, ctx.chart.width, 0);
                                gradient.addColorStop(0, '#8B5CF6');
                                gradient.addColorStop(0.5, '#A78BFA');
                                gradient.addColorStop(1, '#8B5CF6');
                                return gradient;
                            }
                        },
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round',
                        shadowColor: 'rgba(139, 92, 246, 0.4)',
                        shadowBlur: 15,
                        shadowOffsetX: 0,
                        shadowOffsetY: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Skin Condition Issues Trend',
                        font: {
                            size: 20,
                            weight: 'normal'
                        },
                        color: '#333',
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: 2,
                        cornerRadius: 12,
                        padding: 15,
                        displayColors: true,
                        titleFont: {
                            size: 16,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        animation: {
                            duration: 300,
                            easing: 'easeOutQuart'
                        },
                        callbacks: {
                            title: function(context) {
                                return `📅 ${context[0].label} Skin Health Statistics`;
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                const datasetLabel = context.dataset.label;
                                let emoji = '';
                                
                                switch(datasetLabel) {
                                    case 'Acne Issues':
                                        emoji = '🔴';
                                        break;
                                    case 'Dry Skin':
                                        emoji = '🟡';
                                        break;
                                    case 'Oily Skin':
                                        emoji = '🔵';
                                        break;
                                    case 'Sensitive Skin':
                                        emoji = '🟣';
                                        break;
                                    default:
                                        emoji = '🌿';
                                }
                                
                                return `${emoji} ${datasetLabel}: ${value} cases`;
                            },
                            afterBody: function(context) {
                                const totalIssues = context.reduce((sum, item) => sum + item.parsed.y, 0);
                                
                                let overallStatus = '';
                                if (totalIssues === 0) {
                                    overallStatus = '✅ Perfect Skin Health';
                                } else if (totalIssues <= 10) {
                                    overallStatus = '⚠️ Minor Skin Issues';
                                } else if (totalIssues <= 25) {
                                    overallStatus = '🔶 Moderate Skin Concerns';
                                } else {
                                    overallStatus = '🔴 Serious Skin Issues';
                                }
                                
                                return [
                                    `📊 Total Issues: ${totalIssues}`,
                                    `🎯 Overall Skin Health: ${overallStatus}`,
                                    `📈 Trend Analysis: Multi-condition Monitoring`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Month',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Issue Count',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 4,
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round'
                    },
                    point: {
                        radius: 8,
                        hoverRadius: 12,
                        borderWidth: 3,
                        hoverBorderWidth: 4,
                        pointStyle: 'circle'
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutCubic',
                    delay: function(context) {
                        return context.dataIndex * 200;
                    },
                    onProgress: function(animation) {
                        const chart = animation.chart;
                        const ctx = chart.ctx;
                        
                        // 添加進度動畫效果
                        chart.data.datasets.forEach((dataset, datasetIndex) => {
                            const meta = chart.getDatasetMeta(datasetIndex);
                            meta.data.forEach((point, index) => {
                                if (point && animation.currentStep / animation.numSteps > index / meta.data.length) {
                                    // 添加點的脈衝效果
                                    const progress = (animation.currentStep / animation.numSteps - index / meta.data.length) * meta.data.length;
                                    if (progress > 0 && progress < 1) {
                                        ctx.save();
                                        ctx.globalAlpha = 0.3 * (1 - progress);
                                        ctx.beginPath();
                                        ctx.arc(point.x, point.y, point.options.radius * (1 + progress * 2), 0, 2 * Math.PI);
                                        ctx.fillStyle = dataset.borderColor;
                                        ctx.fill();
                                        ctx.restore();
                                    }
                                }
                            });
                        });
                    },
                    onComplete: function() {
                        // 動畫完成後的回調
                        console.log('Skin chart animation completed');
                    }
                },
                transitions: {
                    active: {
                        animation: {
                            duration: 400,
                            easing: 'easeOutQuart'
                        }
                    },
                    resize: {
                        animation: {
                            duration: 800,
                            easing: 'easeInOutCubic'
                        }
                    }
                },
                onHover: (event, activeElements, chart) => {
                    event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                },
                onMouseMove: (event, activeElements, chart) => {
                    // 獲取滑鼠位置
                    const rect = chart.canvas.getBoundingClientRect();
                    const x = event.native.clientX - rect.left;
                    const y = event.native.clientY - rect.top;
                    
                    // 創建擴散效果
                    createRippleEffect(chart.canvas.parentElement, x, y);
                    
                    // 檢查是否靠近數據點
                    const nearDataPoint = checkNearDataPoint(chart, x, y);
                    if (nearDataPoint) {
                        triggerBackgroundWave(chart.canvas.parentElement);
                    }
                }
            }
        });
    }
    } catch (error) {
        console.error('Error loading skin chart data:', error);
    }
}
```

### Chart Initialization and Auto-refresh

```javascript
// Initialize all charts when page loads
loadChartData();
loadChartData2();
loadChartData3();
loadSkinChartData();

// Auto-refresh charts every 10 seconds
setInterval(loadChartData, 10000);
setInterval(loadChartData2, 10000);
setInterval(loadChartData3, 10000);
setInterval(loadSkinChartData, 10000);
```

## 功能特點

### 1. Health Issues Trend Line Chart (lineChart)
- **數據來源**: Dark Circles Issues 和 Lip Issues
- **顏色方案**: 粉紅色 (#FF006E) 和藍色 (#3B82F6)
- **特效**: 漸層背景、陰影效果、動畫
- **互動**: 懸停效果、點擊跳轉到 records 頁面

### 2. Skin Condition Issues Trend Line Chart (skinLineChart)
- **數據來源**: Acne Issues, Dry Skin, Oily Skin, Sensitive Skin
- **顏色方案**: 紅色 (#EF4444)、黃色 (#F59E0B)、藍色 (#3B82F6)、紫色 (#8B5CF6)
- **多條線**: 同時顯示四種皮膚狀況的趨勢
- **詳細統計**: Tooltip 顯示總體皮膚健康狀況

### 3. 共同特點
- **響應式設計**: 自適應不同屏幕尺寸
- **實時更新**: 每10秒自動刷新數據
- **動畫效果**: 進場動畫、懸停動畫、點擊效果
- **視覺效果**: 漸層背景、陰影、脈衝效果
- **用戶體驗**: 豐富的 Tooltip 信息、emoji 圖標

## API 數據格式

系統期望從 `/api/health-stats/` 端點獲取以下格式的數據：

```json
{
  "dark_circles_data": {
    "January": 5,
    "February": 3,
    "March": 7
  },
  "lip_data": {
    "January": 2,
    "February": 4,
    "March": 1
  },
  "skin_acne_data": {
    "January": 8,
    "February": 6,
    "March": 4
  },
  "skin_dry_data": {
    "January": 3,
    "February": 5,
    "March": 2
  },
  "skin_oily_data": {
    "January": 4,
    "February": 3,
    "March": 6
  },
  "skin_sensitive_data": {
    "January": 2,
    "February": 1,
    "March": 3
  }
}
```

這個實現提供了完整的健康數據可視化解決方案，結合了現代Web技術和用戶友好的界面設計。