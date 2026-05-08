const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuration
const CONFIG = {
    snakeSpeed: 3,
    turnSpeed: 0.08,
    segmentDistance: 10,
    initialSegments: 20,
    foodCount: 150
};

class Snake {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.angle = 0;
        this.segments = [];
        this.color = '#00f2ff';
        
        for (let i = 0; i < CONFIG.initialSegments; i++) {
            this.segments.push({ x: this.x, y: this.y });
        }
    }

    update(mouse) {
        // Smooth rotation towards mouse
        const dx = mouse.x - canvas.width / 2;
        const dy = mouse.y - canvas.height / 2;
        const targetAngle = Math.atan2(dy, dx);
        
        let diff = targetAngle - this.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.angle += diff * CONFIG.turnSpeed;

        // Move Head
        this.x += Math.cos(this.angle) * CONFIG.snakeSpeed;
        this.y += Math.sin(this.angle) * CONFIG.snakeSpeed;

        // Update Segments (The "Slither" logic)
        let prev = { x: this.x, y: this.y };
        for (let i = 0; i < this.segments.length; i++) {
            let seg = this.segments[i];
            const dist = Math.hypot(prev.x - seg.x, prev.y - seg.y);
            
            if (dist > CONFIG.segmentDistance) {
                const angle = Math.atan2(prev.y - seg.y, prev.x - seg.x);
                seg.x = prev.x - Math.cos(angle) * CONFIG.segmentDistance;
                seg.y = prev.y - Math.sin(angle) * CONFIG.segmentDistance;
            }
            prev = seg;
        }
    }

    draw(camera) {
        // Draw body with glowing effect
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 20;
        ctx.moveTo(this.x - camera.x, this.y - camera.y);
        this.segments.forEach(seg => ctx.lineTo(seg.x - camera.x, seg.y - camera.y));
        ctx.stroke();
        
        // Draw Head
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(this.x - camera.x, this.y - camera.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Food / Orbs logic
const foods = Array.from({ length: CONFIG.foodCount }, () => ({
    x: Math.random() * 5000 - 2500,
    y: Math.random() * 5000 - 2500,
    size: Math.random() * 5 + 2,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`
}));

const player = new Snake();
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Camera follows player
    const camera = {
        x: player.x - canvas.width / 2,
        y: player.y - canvas.height / 2
    };

    // Draw Background Grid
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for (let x = -camera.x % 100; x < canvas.width; x += 100) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = -camera.y % 100; y < canvas.height; y += 100) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw Food
    foods.forEach(f => {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x - camera.x, f.y - camera.y, f.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Simple collision
        if (Math.hypot(player.x - f.x, player.y - f.y) < 25) {
            f.x = Math.random() * 5000 - 2500;
            f.y = Math.random() * 5000 - 2500;
            player.segments.push({ ...player.segments[player.segments.length - 1] });
            scoreEl.innerText = player.segments.length;
        }
    });

    player.update(mouse);
    player.draw(camera);

    requestAnimationFrame(animate);
}

animate();
