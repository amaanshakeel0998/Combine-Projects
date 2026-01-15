/* ===== Button click logging (optional) ===== */
document.querySelectorAll('.project-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        console.log(`Project ${index + 1} clicked`);
    });
});

/* ===== Fixed Multi-Layer Particle Background ===== */
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

resizeCanvas();

const mouse = { x: width / 2, y: height / 2 };

const particleCount = 150;
const particles = [];
const maxDistance = 130;

// Particle constructor
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.type = Math.random() < 0.25 ? "twinkle" : "normal";
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Attraction to cursor
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 300){
            const force = (300 - dist) / 300;
            this.vx += dx * force * 0.02;
            this.vy += dy * force * 0.02;
        }

        this.vx *= 0.95;
        this.vy *= 0.95;

        // Wrap edges
        if(this.x < 0) this.x = width;
        if(this.x > width) this.x = 0;
        if(this.y < 0) this.y = height;
        if(this.y > height) this.y = 0;

        if(this.type === "twinkle"){
            this.opacity += (Math.random() - 0.5) * 0.05;
            this.opacity = Math.min(Math.max(this.opacity, 0.3), 0.9);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fillStyle = `rgba(99,102,241,${this.opacity})`;
        ctx.fill();
    }
}

// Initialize particles
for(let i=0;i<particleCount;i++){
    particles.push(new Particle());
}

// Track mouse correctly relative to canvas and handle custom cursor
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

window.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    // Custom cursor animation
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
    
    // Smooth outline follower
    cursorOutline.animate({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
    }, { duration: 500, fill: "forwards" });
});

// Boom Effect on Click
window.addEventListener("mousedown", () => {
    particles.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const force = 15; // Explosion strength
        
        // Push particles away from mouse
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
    });

    // Visual feedback for cursor
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(0.5)';
    setTimeout(() => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);
});

// Cursor scaling on hover
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorOutline.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
    });
    el.addEventListener('mouseleave', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.backgroundColor = 'transparent';
    });
});

/* ===== Dropdown Toggle ===== */
const aboutBtn = document.getElementById('about-btn');
const aboutDropdown = document.getElementById('about-dropdown');
const arrowIcon = aboutBtn.querySelector('svg');

aboutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    aboutDropdown.classList.toggle('show-dropdown');
    arrowIcon.classList.toggle('rotate-180');
});

document.addEventListener('click', () => {
    aboutDropdown.classList.remove('show-dropdown');
    arrowIcon.classList.remove('rotate-180');
});

// Resize
window.addEventListener("resize", resizeCanvas);

// Draw connecting lines
function connectParticles() {
    for(let i=0;i<particleCount;i++){
        for(let j=i+1;j<particleCount;j++){
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < maxDistance){
                ctx.beginPath();
                ctx.strokeStyle = `rgba(99,102,241,${1 - dist/maxDistance})`;
                ctx.lineWidth = 0.8;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0,0,width,height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
}

animate();
