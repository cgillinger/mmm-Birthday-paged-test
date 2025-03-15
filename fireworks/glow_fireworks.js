/**
 * @file glow_fireworks.js
 * @description Fireworks animation system with enhanced glow effects
 * @version 2.2.0 - Updated for transparency support
 */

class Fireworks {
    constructor() {
        this.endTime = Infinity;
        this.running = false;
        this.animationFrame = null;
        this.init();
    }

    init() {
        try {
            // Setup canvas
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'glow-firework-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '999998';
            this.canvas.style.backgroundColor = 'transparent';
            this.canvas.style.background = 'none';
            
            // Get context and set dimensions
            this.ctx = this.canvas.getContext('2d');
            this.resize();

            // Animation state
            this.fireworks = [];
            this.particles = [];
            this.lastLaunch = 0;
            this.launchInterval = 400; // Reduced launch interval for more frequent fireworks
            
            // Vibrant colors for explosions
            this.colors = [
                '#ff0000', '#ffa500', '#ffff00', '#00ff00', 
                '#00ffff', '#0000ff', '#ff00ff', '#ff1493',
                '#FFD700', '#7FFFD4', '#FF69B4', '#32CD32'
            ];
            
            // Bind methods
            this.resize = this.resize.bind(this);
            this.update = this.update.bind(this);
            
            // Add resize listener
            window.addEventListener('resize', this.resize);
            
            console.log("[Glow Fireworks] Initialized successfully");
            return true;
        } catch (error) {
            console.error('[Glow Fireworks] Error initializing:', error);
            return false;
        }
    }

    resize() {
        if (!this.canvas) return;
        try {
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;
            console.log(`[Glow Fireworks] Canvas resized to ${this.width}x${this.height}`);
        } catch (error) {
            console.error('[Glow Fireworks] Error resizing canvas:', error);
        }
    }

    createFirework(x, y, targetX, targetY) {
        return {
            x,
            y,
            targetX,
            targetY,
            velocity: 8, // Increased velocity for faster launch
            angle: Math.atan2(targetY - y, targetX - x),
            trail: [],
            trailLength: 5, // Shortened trail for better performance
            exploded: false,
            timeCreated: Date.now()
        };
    }

    createParticle(x, y, color) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4; // Increased particle speed
        return {
            x,
            y,
            color,
            velocity: speed,
            angle,
            gravity: 0.15, // Increased gravity effect
            alpha: 1,
            decay: Math.random() * 0.02 + 0.02, // Faster decay for shorter but more intense explosions
            friction: 0.98,
            timeCreated: Date.now()
        };
    }

    update() {
        if (!this.running || !this.ctx || Date.now() >= this.endTime) {
            this.cleanup();
            return;
        }

        try {
            // Clear canvas with transparency instead of solid black
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Create fade effect with reduced opacity
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            // Launch new fireworks with controlled timing
            const now = Date.now();
            if (now - this.lastLaunch > this.launchInterval) {
                const startX = Math.random() * this.width;
                const startY = this.height;
                const targetX = Math.random() * this.width;
                const targetY = this.height * 0.2 + Math.random() * (this.height * 0.3); // Adjusted target height
                this.fireworks.push(this.createFirework(startX, startY, targetX, targetY));
                this.lastLaunch = now;
                this.launchInterval = 300 + Math.random() * 200; // Varied interval for natural effect
            }

            // Update fireworks
            this.fireworks = this.fireworks.filter(firework => {
                if (!firework.exploded) {
                    // Update position with higher velocity
                    firework.x += Math.cos(firework.angle) * firework.velocity;
                    firework.y += Math.sin(firework.angle) * firework.velocity;
                    
                    // Track trail
                    firework.trail.push({ x: firework.x, y: firework.y });
                    if (firework.trail.length > firework.trailLength) {
                        firework.trail.shift();
                    }

                    // Check if reached target or max flight time exceeded
                    const distance = Math.hypot(
                        firework.targetX - firework.x,
                        firework.targetY - firework.y
                    );
                    
                    if (distance < 5 || now - firework.timeCreated > 2000) {
                        // Create explosion
                        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                        for (let i = 0; i < 60; i++) { // Increased particle count
                            this.particles.push(this.createParticle(firework.x, firework.y, color));
                        }
                        firework.exploded = true;
                        return false;
                    }
                }
                return !firework.exploded;
            });

            // Update and draw particles with improved physics
            this.particles = this.particles.filter(particle => {
                // Apply velocity and gravity
                const vx = Math.cos(particle.angle) * particle.velocity;
                const vy = Math.sin(particle.angle) * particle.velocity + particle.gravity;
                
                particle.x += vx;
                particle.y += vy;
                
                // Update particle physics
                particle.velocity *= particle.friction;
                particle.alpha -= particle.decay;
                
                // Only keep particles that are still visible and not too old
                return particle.alpha > 0 && now - particle.timeCreated < 3000;
            });

            this.draw();
            this.animationFrame = requestAnimationFrame(this.update);
        } catch (error) {
            console.error('[Glow Fireworks] Error in animation:', error);
            this.cleanup();
        }
    }

    draw() {
        if (!this.ctx) return;

        try {
            // Draw firework trails with glow effect
            this.fireworks.forEach(firework => {
                this.ctx.beginPath();
                firework.trail.forEach((point, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            });

            // Draw particles with glow effect
            this.particles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${this.hexToRgb(particle.color)}, ${particle.alpha})`;
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = particle.color;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            });
        } catch (error) {
            console.error('[Glow Fireworks] Error drawing:', error);
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '255, 255, 255';
    }

    start(duration) {
        console.log(`[Glow Fireworks] Starting with duration: ${duration}`);
        
        // Make sure canvas is attached to the DOM
        if (!document.body.contains(this.canvas)) {
            console.log("[Glow Fireworks] Attaching canvas to document body");
            document.body.appendChild(this.canvas);
        }
        
        // Set duration
        this.endTime = duration === "infinite" ? Infinity : Date.now() + duration;
        
        // Start animation if not already running
        if (!this.running) {
            this.running = true;
            this.lastLaunch = Date.now();
            this.update();
            console.log("[Glow Fireworks] Animation started");
        } else {
            console.log("[Glow Fireworks] Animation already running");
        }
    }

    cleanup() {
        try {
            console.log("[Glow Fireworks] Cleaning up resources");
            
            // Stop animation
            this.running = false;
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
            
            // Clear particles and fireworks
            this.fireworks = [];
            this.particles = [];
            
            // Remove resize listener
            window.removeEventListener('resize', this.resize);
            
            // Remove canvas from DOM
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
                console.log("[Glow Fireworks] Canvas removed from DOM");
            }
            
            // Remove any other glow firework canvases
            document.querySelectorAll('.glow-firework-canvas').forEach(canvas => {
                if (canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                    console.log("[Glow Fireworks] Removed additional canvas");
                }
            });
        } catch (error) {
            console.error('[Glow Fireworks] Error cleaning up:', error);
        }
    }
}