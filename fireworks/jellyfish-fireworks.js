/**
 * @file jellyfishFireworks.js
 * @description Magical jellyfish-inspired fireworks effect
 * @version 1.1.0 - Updated for transparency support
 */

class Fireworks {
    constructor() {
        this.colors = [
            { body: '#FF69B4', tendrils: ['#FF1493', '#FFB6C1', '#FF69B4'] },  // Pink
            { body: '#4169E1', tendrils: ['#1E90FF', '#87CEEB', '#4169E1'] },  // Blue
            { body: '#9932CC', tendrils: ['#BA55D3', '#DDA0DD', '#9932CC'] },  // Purple
            { body: '#20B2AA', tendrils: ['#48D1CC', '#40E0D0', '#20B2AA'] },  // Turquoise
            { body: '#FFD700', tendrils: ['#FFA500', '#FFFF00', '#FFD700'] }   // Gold
        ];
        this.jellies = [];
        this.endTime = Infinity;
        this.lastLaunch = 0;
        this.launchInterval = 2000;
        this.running = false;
        this.animationFrame = null;
        this.createCanvas();
    }

    createCanvas() {
        // First clean up any existing canvas
        this.cleanup();
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'jellyfish-canvas';
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
        
        console.log("[Jellyfish] Canvas created successfully");
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            console.log(`[Jellyfish] Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
        }
    }

    createJellyfish(x, y) {
        const colors = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = Math.random() * 30 + 40;
        const tendrilCount = Math.floor(Math.random() * 5) + 8;
        
        return {
            x,
            y,
            size,
            colors,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 2 + 1,
            wobble: Math.random() * 0.5 + 0.5,
            tendrilCount,
            tendrils: Array(tendrilCount).fill().map(() => ({
                length: size * (Math.random() * 0.5 + 1.5),
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.05 + 0.02,
                particles: []
            })),
            pulsePhase: 0,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            age: 0,
            maxAge: 300 + Math.random() * 200
        };
    }

    createTendrilParticle(x, y, color) {
        return {
            x,
            y,
            color,
            size: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.5,
            velocity: {
                x: (Math.random() - 0.5) * 0.5,
                y: Math.random() * -0.5 - 0.5
            },
            decay: Math.random() * 0.02 + 0.01
        };
    }

    drawJellyfishBody(jelly) {
        const pulseSize = jelly.size * (1 + Math.sin(jelly.pulsePhase) * 0.1);
        
        // Draw main body with glow
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(jelly.x, jelly.y, pulseSize, 0, Math.PI, true);
        
        // Create gradient for body
        const gradient = this.ctx.createRadialGradient(
            jelly.x, jelly.y - pulseSize * 0.3,
            pulseSize * 0.3,
            jelly.x, jelly.y - pulseSize * 0.3,
            pulseSize
        );
        gradient.addColorStop(0, `${jelly.colors.body}CC`);
        gradient.addColorStop(1, `${jelly.colors.body}33`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.shadowColor = jelly.colors.body;
        this.ctx.shadowBlur = 15;
        this.ctx.fill();
        
        // Inner glow
        this.ctx.beginPath();
        this.ctx.arc(jelly.x, jelly.y - pulseSize * 0.3, pulseSize * 0.6, 0, Math.PI * 2);
        this.ctx.fillStyle = `${jelly.colors.body}33`;
        this.ctx.fill();
        this.ctx.restore();
    }

    updateTendrils(jelly) {
        jelly.tendrils.forEach((tendril, index) => {
            const angleStep = Math.PI / (jelly.tendrilCount - 1);
            const baseAngle = -Math.PI + angleStep * index;
            const waveOffset = Math.sin(tendril.phase) * jelly.wobble;
            
            // Calculate tendril start position
            const startX = jelly.x + Math.cos(baseAngle + waveOffset) * jelly.size * 0.5;
            const startY = jelly.y + Math.sin(baseAngle + waveOffset) * jelly.size * 0.2;
            
            // Draw tendril
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            
            // Create control points for curve
            const cp1x = startX + Math.cos(baseAngle + waveOffset) * tendril.length * 0.5;
            const cp1y = startY + tendril.length * 0.3;
            const cp2x = startX + Math.cos(baseAngle + waveOffset) * tendril.length * 0.8;
            const cp2y = startY + tendril.length * 0.6;
            const endX = startX + Math.cos(baseAngle + waveOffset) * tendril.length;
            const endY = startY + tendril.length;
            
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
            this.ctx.strokeStyle = jelly.colors.tendrils[index % jelly.colors.tendrils.length];
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Add particles along tendril
            if (Math.random() < 0.3) {
                const t = Math.random();
                const px = this.bezierPoint(startX, cp1x, cp2x, endX, t);
                const py = this.bezierPoint(startY, cp1y, cp2y, endY, t);
                tendril.particles.push(this.createTendrilParticle(
                    px, py,
                    jelly.colors.tendrils[Math.floor(Math.random() * jelly.colors.tendrils.length)]
                ));
            }

            // Update particles
            tendril.particles = tendril.particles.filter(particle => {
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;
                particle.alpha -= particle.decay;
                
                if (particle.alpha > 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
                    this.ctx.fill();
                    return true;
                }
                return false;
            });

            tendril.phase += tendril.speed;
        });
    }

    bezierPoint(p0, p1, p2, p3, t) {
        const oneMinusT = 1 - t;
        return Math.pow(oneMinusT, 3) * p0 +
               3 * Math.pow(oneMinusT, 2) * t * p1 +
               3 * oneMinusT * Math.pow(t, 2) * p2 +
               Math.pow(t, 3) * p3;
    }

    animate() {
        if (!this.running || !this.canvas || !this.ctx) {
            console.log("[Jellyfish] Animation stopped - missing resources");
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

        // Launch new jellyfish
        const now = Date.now();
        if (now - this.lastLaunch > this.launchInterval) {
            const x = Math.random() * (this.canvas.width * 0.8) + (this.canvas.width * 0.1);
            const y = this.canvas.height + 50;
            this.jellies.push(this.createJellyfish(x, y));
            this.lastLaunch = now;
            this.launchInterval = 1500 + Math.random() * 1000;
        }

        // Update and draw jellies
        this.jellies = this.jellies.filter(jelly => {
            jelly.age++;
            if (jelly.age > jelly.maxAge || jelly.y < -100) return false;

            // Move upward with gentle sway
            jelly.y -= jelly.speed;
            jelly.x += Math.sin(jelly.phase) * jelly.wobble;
            jelly.phase += 0.02;
            jelly.pulsePhase += jelly.pulseSpeed;

            this.drawJellyfishBody(jelly);
            this.updateTendrils(jelly);

            return true;
        });
    }

    start(duration) {
        console.log(`[Jellyfish] Starting with duration: ${duration}`);
        
        // Make sure canvas is attached to the DOM
        if (!document.body.contains(this.canvas)) {
            console.log("[Jellyfish] Attaching canvas to document body");
            document.body.appendChild(this.canvas);
        }
        
        // Set duration
        this.endTime = duration === "infinite" ? Infinity : Date.now() + duration;
        
        // Start animation if not already running
        if (!this.running) {
            this.running = true;
            this.lastLaunch = Date.now();
            this.animate();
            console.log("[Jellyfish] Animation started");
        } else {
            console.log("[Jellyfish] Animation already running");
        }
    }

    cleanup() {
        console.log("[Jellyfish] Cleaning up resources");
        
        // Stop animation
        this.running = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clear jellies
        this.jellies = [];
        
        // Remove window event listener
        window.removeEventListener('resize', this.resizeHandler);
        
        // Remove canvas from DOM
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            console.log("[Jellyfish] Canvas removed from DOM");
        }
        
        // Remove any other jellyfish canvases
        document.querySelectorAll('.jellyfish-canvas').forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
                console.log("[Jellyfish] Removed additional canvas");
            }
        });
    }
}