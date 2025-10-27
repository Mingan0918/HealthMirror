// donut chart
let donutChart;
let donutChart2;
let lineChart;
let skinLineChart;

async function loadChartData() {
    try {
        console.log('Loading chart data for donutChart...');
        const response = await fetch('/api/health-stats/');
        const stats = await response.json();
        console.log('Chart data received:', stats);

        const labels = Object.keys(stats.dark_circles_data);
        const data = Object.values(stats.dark_circles_data);
        const total = data.reduce((sum, value) => sum + value, 0);

        console.log('Chart 1 - Labels:', labels, 'Data:', data, 'Total:', total);

        const ctx = document.getElementById('donutChart').getContext('2d');

        if (donutChart) {
            // if chart already exit -> update data
            donutChart.data.labels = labels;
            donutChart.data.datasets[0].data = data;
            donutChart.update();
        } else {
        // create simple donut chart
        donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Dark Circles Count',
                    data: data,
                    backgroundColor: function(context) {
                        const colors = [
                            // 毛玻璃粉紅漸層
                            ['rgb(255, 0, 111)', 'rgba(249, 38, 108, 0.8)', 'rgba(255, 182, 193, 0.60)'],
                            // 毛玻璃藍色漸層  
                            ['rgb(59, 131, 246)', 'rgba(64, 146, 246, 0.8)', 'rgba(147, 196, 253, 0.60)'],
                            // 毛玻璃綠色漸層
                            ['rgb(16, 185, 129)', 'rgba(30, 210, 144, 0.8)', 'rgba(110, 231, 183, 0.60)'],
                            // 毛玻璃黃色漸層
                            ['rgb(245, 159, 11)', 'rgba(249, 184, 18, 0.8)', 'rgba(254, 240, 138, 0.60)'],
                            // 毛玻璃紫色漸層
                            ['rgb(128, 78, 245)', 'rgba(151, 116, 255, 0.8)', 'rgba(195, 181, 253, 0.60)']
                        ];
                        
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return colors.map(c => c[0]);
                        
                        return colors.map(colorSet => {
                            const gradient = ctx.createRadialGradient(
                                chartArea.left + chartArea.width / 2,
                                chartArea.top + chartArea.height / 2,
                                0,
                                chartArea.left + chartArea.width / 2,
                                chartArea.top + chartArea.height / 2,
                                Math.max(chartArea.width, chartArea.height) / 2
                            );
                            gradient.addColorStop(0, colorSet[0]);    // 內圈較深
                            gradient.addColorStop(0.6, colorSet[1]);  // 中間透明
                            gradient.addColorStop(1, colorSet[2]);    // 外圈最透明
                            return gradient;
                        });
                    },
                    borderWidth: 3,
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    cutout: '50%',
                    hoverBorderWidth: 4,
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20,
                        left: 20,
                        right: 20
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                },
                plugins: {
                    legend: {
                        position: 'left',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                const colors = [
                                    'rgba(255, 0, 111, 0.8)',      // 粉紅色
                                    'rgba(59, 131, 246, 0.8)',     // 藍色
                                    'rgba(16, 185, 129, 0.8)',     // 綠色
                                    'rgba(245, 159, 11, 0.8)',     // 黃色
                                    'rgba(128, 78, 245, 0.8)'      // 紫色
                                ];
                                
                                return data.labels.map((label, index) => {
                                    const meta = chart.getDatasetMeta(0);
                                    const isHidden = meta.data[index] && meta.data[index].hidden;
                                    
                                    return {
                                        text: label,
                                        fillStyle: isHidden ? 'rgba(128, 128, 128, 0.4)' : colors[index % colors.length],
                                        strokeStyle: isHidden ? 'rgba(128, 128, 128, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                                        lineWidth: 2,
                                        hidden: isHidden,
                                        index: index,
                                        fontColor: isHidden ? 'rgba(128, 128, 128, 0.6)' : '#333'
                                    };
                                });
                            }
                        },
                        onClick: function(e, legendItem, legend) {
                            const index = legendItem.index;
                            const chart = legend.chart;
                            const meta = chart.getDatasetMeta(0);
                            
                            // 切換數據可見性
                            meta.data[index].hidden = !meta.data[index].hidden;
                            
                            // 更新圖表
                            chart.update();
                            
                            // 添加視覺反饋
                            const legendElement = e.target.closest('.chartjs-legend');
                            if (legendElement) {
                                const legendItems = legendElement.querySelectorAll('li');
                                if (legendItems[index]) {
                                    if (meta.data[index].hidden) {
                                        legendItems[index].classList.add('legend-disabled');
                                    } else {
                                        legendItems[index].classList.remove('legend-disabled');
                                    }
                                }
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Dark Circles',
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
                            duration: 300
                        },
                        filter: function(tooltipItem) {
                            return tooltipItem.parsed !== 0;
                        },
                        callbacks: {
                            title: function(context) {
                                return `${context[0].label}`;
                            },
                            label: function(context) {
                                const value = context.parsed;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `Count: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 2
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: false,
                    duration: 800,
                    easing: 'easeInOutCubic',
                    onProgress: function(animation) {
                        const progress = animation.currentStep / animation.numSteps;
                        const canvas = this.canvas;
                        const ctx = canvas.getContext('2d');
                        
                        // 添加進度光暈效果
                        if (progress > 0.5) {
                            ctx.save();
                            ctx.globalCompositeOperation = 'screen';
                            ctx.filter = `blur(${(1 - progress) * 10}px) brightness(${1 + progress * 0.3})`;
                            ctx.restore();
                        }
                    },
                    onComplete: function() {
                        // 動畫完成，不添加任何陰影效果
                        console.log('Chart animation completed');
                    }
                },
                onHover: (event, activeElements) => {
                    event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                    
                    // 為懸停的扇形添加發光效果
                    if (activeElements.length > 0) {
                        const activeIndex = activeElements[0].index;
                        const canvas = event.native.target;
                        const container = canvas.closest('.chart');
                        
                        // 添加發光邊框類
                        container.classList.add('segment-hover');
                        container.setAttribute('data-hover-index', activeIndex);
                        
                        // 動態調整發光顏色
                        const colors = [
                            'rgba(255, 0, 111, 0.9)',      // 粉紅色
                            'rgba(59, 131, 246, 0.9)',     // 藍色
                            'rgba(16, 185, 129, 0.9)',     // 綠色
                            'rgba(245, 159, 11, 0.9)',     // 黃色
                            'rgba(128, 78, 245, 0.9)'      // 紫色
                        ];
                        
                        const hoverColor = colors[activeIndex % colors.length];
                        container.style.setProperty('--hover-glow-color', hoverColor);
                    } else {
                        const canvas = event.native.target;
                        const container = canvas.closest('.chart');
                        container.classList.remove('segment-hover');
                        container.removeAttribute('data-hover-index');
                    }
                },
                onClick: (event, activeElements) => {
                    if (activeElements.length > 0) {
                        // 點擊圖表時跳轉到 records 頁面
                        window.location.href = '/records/';
                    }
                },
                onClick: (event, activeElements) => {
                    if (activeElements.length > 0) {
                        // 點擊圖表時跳轉到 records 頁面
                        window.location.href = '/records/';
                    }
                }
            }
        });
    }
    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

async function loadChartData2() {
    try {
        console.log('Loading chart data for donutChart2...');
        const response = await fetch('/api/health-stats/');
        const stats = await response.json();
        console.log('Chart 2 data received:', stats);

        const labels = Object.keys(stats.lip_data);
        const data = Object.values(stats.lip_data);
        const total = data.reduce((sum, value) => sum + value, 0);

        console.log('Chart 2 - Labels:', labels, 'Data:', data, 'Total:', total);

        const ctx2 = document.getElementById('donutChart2').getContext('2d');

        if (donutChart2) {
            // if chart already exit -> update data
            donutChart2.data.labels = labels;
            donutChart2.data.datasets[0].data = data;
            donutChart2.update();
        } else {
        // create simple donut chart
        donutChart2 = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lip Type Count',
                    data: data,
                    backgroundColor: function(context) {
                        const colors = [
                            // 毛玻璃粉紅漸層
                            ['rgb(255, 0, 111)', 'rgba(249, 38, 108, 0.8)', 'rgba(255, 182, 193, 0.60)'],
                            // 毛玻璃藍色漸層  
                            ['rgb(59, 131, 246)', 'rgba(64, 146, 246, 0.8)', 'rgba(147, 196, 253, 0.60)'],
                            // 毛玻璃綠色漸層
                            ['rgb(16, 185, 129)', 'rgba(30, 210, 144, 0.8)', 'rgba(110, 231, 183, 0.60)'],
                            // 毛玻璃黃色漸層
                            ['rgb(245, 159, 11)', 'rgba(249, 184, 18, 0.8)', 'rgba(254, 240, 138, 0.60)'],
                            // 毛玻璃紫色漸層
                            ['rgb(128, 78, 245)', 'rgba(151, 116, 255, 0.8)', 'rgba(195, 181, 253, 0.60)']
                        ];
                        
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return colors.map(c => c[0]);
                        
                        return colors.map(colorSet => {
                            const gradient = ctx.createRadialGradient(
                                chartArea.left + chartArea.width / 2,
                                chartArea.top + chartArea.height / 2,
                                0,
                                chartArea.left + chartArea.width / 2,
                                chartArea.top + chartArea.height / 2,
                                Math.max(chartArea.width, chartArea.height) / 2
                            );
                            gradient.addColorStop(0, colorSet[0]);    // 內圈較深
                            gradient.addColorStop(0.6, colorSet[1]);  // 中間透明
                            gradient.addColorStop(1, colorSet[2]);    // 外圈最透明
                            return gradient;
                        });
                    },
                    borderWidth: 3,
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    cutout: '50%',
                    hoverBorderWidth: 4,
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20,
                        left: 20,
                        right: 20
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                },
                plugins: {
                    legend: {
                        position: 'left',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                const colors = [
                                    'rgba(255, 0, 111, 0.8)',      // 粉紅色
                                    'rgba(59, 131, 246, 0.8)',     // 藍色
                                    'rgba(16, 185, 129, 0.8)',     // 綠色
                                    'rgba(245, 159, 11, 0.8)',     // 黃色
                                    'rgba(128, 78, 245, 0.8)'      // 紫色
                                ];
                                
                                return data.labels.map((label, index) => {
                                    const meta = chart.getDatasetMeta(0);
                                    const isHidden = meta.data[index] && meta.data[index].hidden;
                                    
                                    return {
                                        text: label,
                                        fillStyle: isHidden ? 'rgba(128, 128, 128, 0.4)' : colors[index % colors.length],
                                        strokeStyle: isHidden ? 'rgba(128, 128, 128, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                                        lineWidth: 2,
                                        hidden: isHidden,
                                        index: index,
                                        fontColor: isHidden ? 'rgba(128, 128, 128, 0.6)' : '#333'
                                    };
                                });
                            }
                        },
                        onClick: function(e, legendItem, legend) {
                            const index = legendItem.index;
                            const chart = legend.chart;
                            const meta = chart.getDatasetMeta(0);
                            
                            // 切換數據可見性
                            meta.data[index].hidden = !meta.data[index].hidden;
                            
                            // 更新圖表
                            chart.update();
                            
                            // 添加視覺反饋
                            const legendElement = e.target.closest('.chartjs-legend');
                            if (legendElement) {
                                const legendItems = legendElement.querySelectorAll('li');
                                if (legendItems[index]) {
                                    if (meta.data[index].hidden) {
                                        legendItems[index].classList.add('legend-disabled');
                                    } else {
                                        legendItems[index].classList.remove('legend-disabled');
                                    }
                                }
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Lip Type',
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
                            duration: 300
                        },
                        filter: function(tooltipItem) {
                            return tooltipItem.parsed !== 0;
                        },
                        callbacks: {
                            title: function(context) {
                                return `${context[0].label}`;
                            },
                            label: function(context) {
                                const value = context.parsed;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `Count: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 2
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: false,
                    duration: 800,
                    easing: 'easeInOutCubic',
                    onProgress: function(animation) {
                        const progress = animation.currentStep / animation.numSteps;
                        const canvas = this.canvas;
                        const ctx = canvas.getContext('2d');
                        
                        // 添加進度光暈效果
                        if (progress > 0.5) {
                            ctx.save();
                            ctx.globalCompositeOperation = 'screen';
                            ctx.filter = `blur(${(1 - progress) * 10}px) brightness(${1 + progress * 0.3})`;
                            ctx.restore();
                        }
                    },
                    onComplete: function() {
                        // 動畫完成，不添加任何陰影效果
                        console.log('Chart animation completed');
                    }
                },
                onHover: (event, activeElements) => {
                    event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                    
                    // 為懸停的扇形添加發光效果
                    if (activeElements.length > 0) {
                        const activeIndex = activeElements[0].index;
                        const canvas = event.native.target;
                        const container = canvas.closest('.chart');
                        
                        // 添加發光邊框類
                        container.classList.add('segment-hover');
                        container.setAttribute('data-hover-index', activeIndex);
                        
                        // 動態調整發光顏色
                        const colors = [
                            'rgba(255, 0, 111, 0.9)',      // 粉紅色
                            'rgba(59, 131, 246, 0.9)',     // 藍色
                            'rgba(16, 185, 129, 0.9)',     // 綠色
                            'rgba(245, 159, 11, 0.9)',     // 黃色
                            'rgba(128, 78, 245, 0.9)'      // 紫色
                        ];
                        
                        const hoverColor = colors[activeIndex % colors.length];
                        container.style.setProperty('--hover-glow-color', hoverColor);
                    } else {
                        const canvas = event.native.target;
                        const container = canvas.closest('.chart');
                        container.classList.remove('segment-hover');
                        container.removeAttribute('data-hover-index');
                    }
                }
            }
        });
    }
    } catch (error) {
        console.error('Error loading chart 2 data:', error);
    }
}

// line chart
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

loadChartData();
loadChartData2();
loadChartData3();
loadSkinChartData();

// 創建滑鼠位置響應的擴散效果函數
function createRippleEffect(container, x, y) {
    // 限制擴散效果的頻率，避免過於頻繁
    if (container.lastRippleTime && Date.now() - container.lastRippleTime < 100) {
        return;
    }
    container.lastRippleTime = Date.now();
    
    // 創建擴散元素
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    
    // 設置擴散效果的大小和位置
    const size = 50;
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (x - size / 2) + 'px';
    ripple.style.top = (y - size / 2) + 'px';
    
    // 添加到容器中
    container.appendChild(ripple);
    
    // 動畫完成後移除元素
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 800);
}

// 檢查滑鼠是否靠近數據點
function checkNearDataPoint(chart, mouseX, mouseY) {
    const datasets = chart.data.datasets;
    const threshold = 30; // 檢測範圍（像素）
    
    for (let datasetIndex = 0; datasetIndex < datasets.length; datasetIndex++) {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (!meta.visible) continue;
        
        for (let pointIndex = 0; pointIndex < meta.data.length; pointIndex++) {
            const point = meta.data[pointIndex];
            const distance = Math.sqrt(
                Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
            );
            
            if (distance <= threshold) {
                return {
                    datasetIndex: datasetIndex,
                    pointIndex: pointIndex,
                    distance: distance
                };
            }
        }
    }
    return null;
}

// 觸發背景波動效果
function triggerBackgroundWave(container) {
    // 限制背景波動的頻率
    if (container.lastWaveTime && Date.now() - container.lastWaveTime < 1000) {
        return;
    }
    container.lastWaveTime = Date.now();
    
    // 添加波動效果類別
    container.classList.add('wave-active');
    
    // 1.5秒後移除類別
    setTimeout(() => {
        container.classList.remove('wave-active');
    }, 1500);
}

// update data every 10s
setInterval(loadChartData, 10000);
setInterval(loadChartData2, 10000);
setInterval(loadChartData3, 10000);
setInterval(loadSkinChartData, 10000);