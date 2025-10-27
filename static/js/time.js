function updateClock() {
    const now = new Date();
    const formattedTime = now.getFullYear() + '-' 
        + String(now.getMonth() + 1).padStart(2, '0') + '-' 
        + String(now.getDate()).padStart(2, '0') + ' '
        + String(now.getHours()).padStart(2, '0') + ':' 
        + String(now.getMinutes()).padStart(2, '0') + ':' 
        + String(now.getSeconds()).padStart(2, '0');

    document.getElementById('clock').innerHTML = formattedTime;
}

setInterval(updateClock, 1000);  // Execute every second
updateClock(); // Execute once when page loads