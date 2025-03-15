/**
 * @file fireworks.js
 * @description Classic exploding fireworks effect for MMM-Birthday module
 * @version 2.1.0
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
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.createCanvas();
    }

    /**
     * Creates the canvas element for rendering fireworks
     */
    createCanvas() {
        // First remove any existing canvas to prevent duplicates
        this.cleanup();
        
        // Create a new canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'fireworks-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '999998';
        this.canvas.style.opacity = '1';
        this.canvas.style.display = 'block';
        this.canvas.style.backgroundColor = 'transparent';
        this.canvas.style.background = 'none';
        
        // Get 2D context for drawing
        this.ctx = this.canvas.getContext('2d');
        
        // Set initial dimensions
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        console.log("[Fireworks] Canvas created successfully");
    }

    /**
     * Updates canvas dimensions to match window size
     */
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            console.log(`[Fireworks] Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
        }
    }

    /**
     * Creates a particle for the firework explosion
     */
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

    /**
     * Creates a burst of particles at the specified coordinates
     */
    createExplosion(x, y, color) {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle(x, y, color));
        }
    }

    /**
     * Main animation loop for rendering fireworks
     */
    animate() {
        if (!this.running || !this.canvas || !this.ctx) {
            console.log("[Fireworks] Animation stopped - missing resources");
            return;
        }
        
        if (Date.now() < this.endTime) {
            this.animationFrame = requestAnimationFrame(() => this.animate());

            // Clear the canvas with transparent background
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Apply fade effect without fully black background
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
        } else {
            this.running = false;
            console.log("[Fireworks] Animation ended due to time limit");
        }
    }

    /**
     * Starts the fireworks display
     */
    start(duration) {
        console.log(`[Fireworks] Starting fireworks with duration: ${duration}`);
        
        // Make sure canvas is attached to the DOM
        if (!document.body.contains(this.canvas)) {
            console.log("[Fireworks] Attaching canvas to document body");
            document.body.appendChild(this.canvas);
        }
        
        // Set duration
        this.endTime = duration === "infinite" ? Infinity : Date.now() + duration;
        
        // Start animation if not already running
        if (!this.running) {
            this.running = true;
            this.animate();
            console.log("[Fireworks] Animation started");
        } else {
            console.log("[Fireworks] Animation already running");
        }
    }

    /**
     * Cleans up all resources
     */
    cleanup() {
        console.log("[Fireworks] Cleaning up resources");
        
        // Stop animation
        this.running = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clear particles
        this.particles = [];
        
        // Remove canvas from DOM
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            console.log("[Fireworks] Canvas removed from DOM");
        }
        
        // Clear any existing fireworks canvases (in case of duplicates)
        document.querySelectorAll('.fireworks-canvas').forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
                console.log("[Fireworks] Removed additional fireworks canvas");
            }
        });
    }
}