/**
 * @file spiral_fireworks.js
 * @description Spiral fireworks effect for MMM-Birthday module with rotating particles
 * @version 1.1.0 - Updated for transparency support
 */

class Fireworks {
    constructor() {
        this.colors = [
            '#FF69B4', '#4B0082', '#00FF7F', '#FF4500', '#1E90FF',
            '#FFD700', '#FF1493', '#00CED1', '#FF8C00', '#32CD32'
        ];
        this.particles = [];
        this.endTime = Infinity;
        this.lastLaunch = 0;
        this.launchInterval = 2000; // Time between launches in ms
        this.running = false;
        this.animationFrame = null;
        this.createCanvas();
    }

    createCanvas() {
        // First clean up any existing canvas
        this.cleanup();
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'spiral-firework-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '999998';
        this.canvas.style.backgroundColor = 'transparent';
        this.canvas.style.background = 'none';
        
        // Set up context
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Set up resize handler
        this.resizeHandler = () => this.resizeCanvas();
        window.addEventListener('resize', this.resizeHandler);
        
        console.log("[Spiral Fireworks] Canvas created successfully");
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            console.log(`[Spiral Fireworks] Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
        }
    }

    createParticle(x, y, color, angle, speed, radius) {
        return {
            x,
            y,
            color,
            angle,
            speed,
            radius,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            alpha: 1,
            life: Math.random() * 100 + 50,
            initialLife: Math.random() * 100 + 50
        };
    }

    createSpiral(x, y, color) {
        const particleCount = 30; // Reduced particle count for better performance
        const angleStep = (Math.PI * 2) / particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = angleStep * i;
            const speed = Math.random() * 2 + 3;
            const radius = Math.random() * 2 + 1;
            this.particles.push(this.createParticle(x, y, color, angle, speed, radius));
        }
    }

    drawParticle(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.fillStyle = particle.color;
        
        // Draw a star shape
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x = Math.cos(angle) * particle.radius;
            const y = Math.sin(angle) * particle.radius;
            i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    animate() {
        if (!this.running || !this.canvas || !this.ctx) {
            console.log("[Spiral Fireworks] Animation stopped - missing resources");
            return;
        }
        
        if (Date.now() >= this.endTime) {
            this.cleanup();
            return;
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());

        // Clear with transparency instead of solid black
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add slight fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Launch new firework
        const now = Date.now();
        if (now - this.lastLaunch > this.launchInterval) {
            const x = Math.random() * (this.canvas.width * 0.8) + (this.canvas.width * 0.1);
            const y = Math.random() * (this.canvas.height * 0.6) + (this.canvas.height * 0.2);
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.createSpiral(x, y, color);
            this.lastLaunch = now;
        }

        // Update and draw particles
        this.particles = this.particles.filter((particle, index) => {
            // Update position using polar coordinates
            const moveX = Math.cos(particle.angle) * particle.speed;
            const moveY = Math.sin(particle.angle) * particle.speed;
            particle.x += moveX;
            particle.y += moveY;
            
            // Update particle properties
            particle.rotation += particle.rotationSpeed;
            particle.speed *= 0.98; // Gradual slowdown
            particle.alpha = particle.life / particle.initialLife;
            particle.life--;

            // Remove dead particles
            if (particle.life <= 0 || particle.alpha <= 0) {
                return false;
            }

            this.drawParticle(particle);
            return true;
        });
    }

    start(duration) {
        console.log(`[Spiral Fireworks] Starting with duration: ${duration}`);
        
        // Make sure canvas is attached to the DOM
        if (!document.body.contains(this.canvas)) {
            console.log("[Spiral Fireworks] Attaching canvas to document body");
            document.body.appendChild(this.canvas);
        }
        
        // Set duration
        this.endTime = duration === "infinite" ? Infinity : Date.now() + duration;
        
        // Start animation if not already running
        if (!this.running) {
            this.running = true;
            this.lastLaunch = Date.now();
            this.animate();
            console.log("[Spiral Fireworks] Animation started");
        } else {
            console.log("[Spiral Fireworks] Animation already running");
        }
    }

    cleanup() {
        console.log("[Spiral Fireworks] Cleaning up resources");
        
        // Stop animation
        this.running = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clear particles
        this.particles = [];
        
        // Remove window event listener
        window.removeEventListener('resize', this.resizeHandler);
        
        // Remove canvas from DOM
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            console.log("[Spiral Fireworks] Canvas removed from DOM");
        }
        
        // Remove any other spiral firework canvases
        document.querySelectorAll('.spiral-firework-canvas').forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
                console.log("[Spiral Fireworks] Removed additional canvas");
            }
        });
    }
}