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

const particleCount = 550;
const particles = [];
const maxDistance = 100;

// Particle constructor
class Particle {
    constructor(x, y) {
        this.init(x, y);
    }

    init(x, y) {
        // Targeted respawning: find areas away from cursor to fill "empty" space
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height;

        if (!x && !y) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            // If random spot is too close to mouse, push it to the opposite side of the screen
            if (Math.sqrt(dx * dx + dy * dy) < 250) {
                this.x = (this.x + width / 2) % width;
                this.y = (this.y + height / 2) % height;
            }
        }

        this.size = Math.random() * 1.5 + 1;
        this.vx = (Math.random() - 0.5) * 5; // Very high initial burst
        this.vy = (Math.random() - 0.5) * 5;
        this.opacity = Math.random() * 0.4 + 0.15;
        this.type = Math.random() < 0.2 ? "twinkle" : "normal";
        this.maxSpeed = Math.random() * 4 + 6; // Very fast travel speed
        this.friction = 0.99; // Minimal friction to maintain speed
        this.angleOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Attraction to cursor with swarm jitter
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Decreased attachment distance to 200px
        if (dist < 200) {
            const force = (200 - dist) / 200;
            const swirlX = Math.cos(this.angleOffset) * 8;
            const swirlY = Math.sin(this.angleOffset) * 8;
            this.vx += (dx + swirlX) * force * 0.04; // Increased attraction force
            this.vy += (dy + swirlY) * force * 0.04;
            this.angleOffset += 0.1;
        }

        // Prevent collapse: if reached cursor, respawn to fill empty areas
        if (dist < 40) {
            this.init(); // Reset to a random location
        }

        // Speed limit
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        this.vx *= this.friction;
        this.vy *= this.friction;

        // Wrap edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        if (this.type === "twinkle") {
            this.opacity += (Math.random() - 0.5) * 0.02;
            this.opacity = Math.min(Math.max(this.opacity, 0.1), 0.7);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
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
    if (cursorDot && cursorOutline) {
        cursorDot.style.left = `${e.clientX}px`;
        cursorDot.style.top = `${e.clientY}px`;
        
        // Smooth outline follower
        cursorOutline.animate({
            left: `${e.clientX}px`,
            top: `${e.clientY}px`
        }, { duration: 150, fill: "forwards" });
    }
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
    if (cursorOutline) {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(0.5)';
        setTimeout(() => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
    }
});

/* ===== Cursor scaling on hover ===== */
document.querySelectorAll('a, button, .team-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursorDot && cursorOutline) {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorOutline.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
        }
    });
    el.addEventListener('mouseleave', () => {
        if (cursorDot && cursorOutline) {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.backgroundColor = 'transparent';
        }
    });
});

/* ===== Team Toggle Logic ===== */
const teamToggleBtn = document.getElementById('team-toggle-btn');
const teamContainer = document.getElementById('team-container');

if (teamToggleBtn && teamContainer) {
    teamToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = teamContainer.classList.contains('hidden');
        
        if (isHidden) {
            teamContainer.classList.remove('hidden');
            teamContainer.classList.add('flex');
            teamToggleBtn.textContent = 'Hide Team';
        } else {
            teamContainer.classList.add('hidden');
            teamContainer.classList.remove('flex');
            teamToggleBtn.textContent = 'Developed By';
        }
    });
}

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
