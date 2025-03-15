/**
 * @file kaleidoscopeFireworks.js
 * @description Kaleidoscopic fireworks effect with geometric patterns
 * @version 1.1.0 - Updated for transparency support
 */

class Fireworks {
    constructor() {
        this.colors = [
            '#FF1493', '#00FFFF', '#FFD700', '#FF4500',
            '#7B68EE', '#00FA9A', '#FF69B4', '#4169E1'
        ];
        this.patterns = [];
        this.endTime = Infinity;
        this.lastLaunch = 0;
        this.launchInterval = 1500;
        this.running = false;
        this.animationFrame = null;
        this.createCanvas();
    }

    createCanvas() {
        // First clean up any existing canvas
        this.cleanup();
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'kaleidoscope-canvas';
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
        
        console.log("[Kaleidoscope] Canvas created successfully");
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            console.log(`[Kaleidoscope] Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
        }
    }

    createPattern(x, y) {
        const segments = Math.floor(Math.random() * 4) + 6; // 6-9 segments
        const radius = Math.random() * 50 + 100;
        const rotationSpeed = (Math.random() * 0.02 + 0.01) * (Math.random() < 0.5 ? 1 : -1);
        const expansionSpeed = Math.random() * 0.5 + 0.5;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        return {
            x,
            y,
            segments,
            radius,
            currentRadius: 0,
            rotation: 0,
            rotationSpeed,
            expansionSpeed,
            color,
            alpha: 1,
            points: Array(segments).fill().map((_, i) => ({
                angle: (i * 2 * Math.PI) / segments,
                offset: Math.random() * 0.3 + 0.7
            }))
        };
    }

    drawPattern(pattern) {
        const { x, y, segments, currentRadius, rotation, points, color } = pattern;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.globalAlpha = pattern.alpha;

        // Draw main pattern
        this.ctx.beginPath();
        points.forEach((point, i) => {
            const angle = point.angle;
            const r = currentRadius * point.offset;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        });
        this.ctx.closePath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw inner patterns
        for (let i = 0.8; i > 0.2; i -= 0.2) {
            this.ctx.beginPath();
            points.forEach((point, idx) => {
                const angle = point.angle + rotation * (1 - i);
                const r = currentRadius * point.offset * i;
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                
                if (idx === 0) {
                    this.ctx.moveTo(px, py);
                } else {
                    this.ctx.lineTo(px, py);
                }
            });
            this.ctx.closePath();
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    animate() {
        if (!this.running || !this.canvas || !this.ctx) {
            console.log("[Kaleidoscope] Animation stopped - missing resources");
            return;
        }
        
        if (Date.now() >= this.endTime) {
            this.cleanup();
            return;
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());

        // Clear canvas with transparency instead of solid black
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add slight fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Create new patterns
        const now = Date.now();
        if (now - this.lastLaunch > this.launchInterval) {
            const x = Math.random() * (this.canvas.width * 0.8) + (this.canvas.width * 0.1);
            const y = Math.random() * (this.canvas.height * 0.6) + (this.canvas.height * 0.2);
            this.patterns.push(this.createPattern(x, y));
            this.lastLaunch = now;
        }

        // Update and draw patterns
        this.patterns = this.patterns.filter(pattern => {
            pattern.rotation += pattern.rotationSpeed;
            pattern.currentRadius += pattern.expansionSpeed;
            pattern.alpha -= 0.002;

            if (pattern.alpha <= 0) return false;

            this.drawPattern(pattern);
            return true;
        });
    }

    start(duration) {
        console.log(`[Kaleidoscope] Starting with duration: ${duration}`);
        
        // Make sure canvas is attached to the DOM
        if (!document.body.contains(this.canvas)) {
            console.log("[Kaleidoscope] Attaching canvas to document body");
            document.body.appendChild(this.canvas);
        }
        
        // Set duration
        this.endTime = duration === "infinite" ? Infinity : Date.now() + duration;
        
        // Start animation if not already running
        if (!this.running) {
            this.running = true;
            this.lastLaunch = Date.now();
            this.animate();
            console.log("[Kaleidoscope] Animation started");
        } else {
            console.log("[Kaleidoscope] Animation already running");
        }
    }

    cleanup() {
        console.log("[Kaleidoscope] Cleaning up resources");
        
        // Stop animation
        this.running = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clear patterns
        this.patterns = [];
        
        // Remove window event listener
        window.removeEventListener('resize', this.resizeHandler);
        
        // Remove canvas from DOM
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            console.log("[Kaleidoscope] Canvas removed from DOM");
        }
        
        // Remove any other kaleidoscope canvases
        document.querySelectorAll('.kaleidoscope-canvas').forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
                console.log("[Kaleidoscope] Removed additional canvas");
            }
        });
    }
}