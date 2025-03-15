/**
 * @file waterfallFireworks.js
 * @description Cascading waterfall fireworks effect
 * @version 1.1.0 - Updated for transparency support
 */

class Fireworks {
    constructor() {
        this.colors = [
            { start: '#00FFFF', end: '#0000FF' }, // Cyan to Blue
            { start: '#FF69B4', end: '#FF1493' }, // Pink to Deep Pink
            { start: '#FFD700', end: '#FFA500' }, // Gold to Orange
            { start: '#7FFF00', end: '#32CD32' }, // Lime to Forest Green
            { start: '#FF4500', end: '#8B0000' }  // Orange Red to Dark Red
        ];
        this.cascades = [];
        this.endTime = Infinity;
        this.lastLaunch = 0;
        this.launchInterval = 800;
        this.running = false;
        this.animationFrame = null;
        this.createCanvas();
    }

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
        
        // Get 2D context and set dimensions
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Handle window resize
        this.resizeHandler = () => this.resizeCanvas();
        window.addEventListener('resize', this.resizeHandler);
        
        console.log("[Waterfall Fireworks] Canvas created successfully");
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            console.log(`[Waterfall Fireworks] Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
        }
    }

    createCascade(x, y) {
        const colorPair = this.colors[Math.floor(Math.random() * this.colors.length)];
        const width = Math.random() * 100 + 50;
        const streams = Math.floor(Math.random() * 3) + 3;
        
        return {
            x,
            y,
            width,
            height: 0,
            maxHeight: Math.random() * 200 + 300,
            streams,
            particles: [],
            colorStart: colorPair.start,
            colorEnd: colorPair.end,
            gravity: 0.15,
            wind: (Math.random() - 0.5) * 0.1,
            age: 0,
            maxAge: Math.random() * 100 + 150
        };
    }

    createParticle(x, y, colorStart, colorEnd) {
        return {
            x,
            y,
            baseX: x,
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: -Math.random() * 5 - 2
            },
            size: Math.random() * 2 + 1,
            colorStart,
            colorEnd,
            phase: Math.random() * Math.PI * 2,
            phaseSpeed: Math.random() * 0.02 + 0.01,
            alpha: Math.random() * 0.5 + 0.5,
            age: 0
        };
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    interpolateColors(colorStart, colorEnd, factor) {
        const start = this.hexToRgb(colorStart);
        const end = this.hexToRgb(colorEnd);
        
        const r = Math.floor(start.r + (end.r - start.r) * factor);
        const g = Math.floor(start.g + (end.g - start.g) * factor);
        const b = Math.floor(start.b + (end.b - start.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    animate() {
        if (!this.running || !this.canvas || !this.ctx) {
            console.log("[Waterfall Fireworks] Animation stopped - missing resources");
            return;
        }
        
        if (Date.now() >= this.endTime) {
            this.cleanup();
            return;
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());

        // Clear canvas with transparency instead of full black
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add slight fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Create new cascades
        const now = Date.now();
        if (now - this.lastLaunch > this.launchInterval) {
            const x = Math.random() * (this.canvas.width * 0.8) + (this.canvas.width * 0.1);
            const y = Math.random() * (this.canvas.height * 0.3);
            this.cascades.push(this.createCascade(x, y));
            this.lastLaunch = now;
        }

        // Update and draw cascades
        this.cascades = this.cascades.filter(cascade => {
            cascade.age++;
            if (cascade.age > cascade.maxAge) return false;

            // Add new particles
            if (cascade.height < cascade.maxHeight) {
                cascade.height += 5;
                for (let i = 0; i < cascade.streams; i++) {
                    const offset = (i - (cascade.streams - 1) / 2) * (cascade.width / cascade.streams);
                    cascade.particles.push(
                        this.createParticle(
                            cascade.x + offset,
                            cascade.y + cascade.height,
                            cascade.colorStart,
                            cascade.colorEnd
                        )
                    );
                }
            }

            // Update particles
            cascade.particles = cascade.particles.filter(particle => {
                particle.age++;
                if (particle.age > 50) return false;

                // Update position
                particle.velocity.y += cascade.gravity;
                particle.velocity.x += cascade.wind;
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;

                // Add oscillation
                particle.x = particle.baseX + Math.sin(particle.phase) * 2;
                particle.phase += particle.phaseSpeed;

                // Draw particle
                const gradient = particle.y / (cascade.y + cascade.maxHeight);
                const color = this.interpolateColors(particle.colorStart, particle.colorEnd, gradient);
                
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = color;
                this.ctx.globalAlpha = particle.alpha * (1 - particle.age / 50);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;

                return true;
            });

            return cascade.particles.length > 0;
        });
    }

    start(duration) {
        console.log(`[Waterfall Fireworks] Starting with duration: ${duration}`);
        
        // Make sure canvas is attached to the DOM
        if (!document.body.contains(this.canvas)) {
            console.log("[Waterfall Fireworks] Attaching canvas to document body");
            document.body.appendChild(this.canvas);
        }
        
        // Set duration
        this.endTime = duration === "infinite" ? Infinity : Date.now() + duration;
        
        // Start animation if not already running
        if (!this.running) {
            this.running = true;
            this.lastLaunch = Date.now();
            this.animate();
            console.log("[Waterfall Fireworks] Animation started");
        } else {
            console.log("[Waterfall Fireworks] Animation already running");
        }
    }

    cleanup() {
        console.log("[Waterfall Fireworks] Cleaning up resources");
        
        // Stop animation
        this.running = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clear cascades
        this.cascades = [];
        
        // Remove canvas from DOM
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            console.log("[Waterfall Fireworks] Canvas removed from DOM");
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.resizeHandler);
        
        // Clear any existing fireworks canvases (in case of duplicates)
        document.querySelectorAll('.fireworks-canvas').forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
                console.log("[Waterfall Fireworks] Removed additional canvas");
            }
        });
    }
}