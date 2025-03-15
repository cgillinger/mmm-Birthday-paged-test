/**
 * @file classicFireworks.js
 * @description Classic exploding fireworks effect for MMM-Birthday module
 * @version 2.1.0 - Updated for transparency support
 */

class Fireworks {
    constructor() {
        this.colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', 
            '#00FFFF', '#FFA500', '#FFD700', '#FF1493', '#7FFFD4'
        ];
        this.particles = [];
        this.endTime = Infinity;
        this.running = false;
        this.animationFrame = null;
        this.createCanvas();
    }

    createCanvas() {
        // First clean up any existing canvas
        this.cleanup();
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'classic-firework-canvas';
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
        
        console.log("[Classic Fireworks] Canvas created successfully");
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            console.log(`[Classic Fireworks] Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
        }
    }

    createParticle(x, y, color) {
        return {
            x,
            y,
            color,
            velocity: {
                x: (Math.random() - 0.5) * 8,
                y: (Math.random() - 0.5) * 8
            },
            alpha: 1,
            life: Math.random() * 150 + 50
        };
    }

    createExplosion(x, y, color) {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle(x, y, color));
        }
    }

    animate() {
        if (!this.running || !this.canvas || !this.ctx) {
            console.log("[Classic Fireworks] Animation stopped - missing resources");
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
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Launch new firework
        if (Math.random() < 0.05) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * (this.canvas.height - 200) + 100;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.createExplosion(x, y, color);
        }

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.velocity.y += 0.05; // gravity
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.alpha -= 0.005;
            particle.life--;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    start(duration) {
        console.log(`[Classic Fireworks] Starting with duration: ${duration}`);
        
        // Make sure canvas is attached to the DOM
        if (!document.body.contains(this.canvas)) {
            console.log("[Classic Fireworks] Attaching canvas to document body");
            document.body.appendChild(this.canvas);
        }
        
        // Set duration
        this.endTime = duration === "infinite" ? Infinity : Date.now() + duration;
        
        // Start animation if not already running
        if (!this.running) {
            this.running = true;
            this.animate();
            console.log("[Classic Fireworks] Animation started");
        } else {
            console.log("[Classic Fireworks] Animation already running");
        }
    }

    cleanup() {
        console.log("[Classic Fireworks] Cleaning up resources");
        
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
            console.log("[Classic Fireworks] Canvas removed from DOM");
        }
        
        // Remove any other classic firework canvases
        document.querySelectorAll('.classic-firework-canvas').forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
                console.log("[Classic Fireworks] Removed additional canvas");
            }
        });
    }
}