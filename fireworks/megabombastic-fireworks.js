/**
 * @file megaFireworks.js
 * @description MEGABOMBASTIC fireworks effect - FOR HIGH-END PCs ONLY!
 * @version 1.1.0 - Updated for transparency support
 * @warning This implementation requires significant CPU/GPU power
 * @requirements Modern PC with dedicated graphics (NOT for Raspberry Pi!)
 * @performance Intensive - uses up to 10,000 particles per explosion
 */

class Fireworks {
    constructor() {
        this.colors = [
            { primary: '#FF1493', secondary: '#FF69B4', glow: '#FF99CC' }, // Hot Pink
            { primary: '#4169E1', secondary: '#1E90FF', glow: '#87CEEB' }, // Royal Blue
            { primary: '#FFD700', secondary: '#FFA500', glow: '#FFFF00' }, // Gold
            { primary: '#FF4500', secondary: '#FF6347', glow: '#FF7F50' }, // OrangeRed
            { primary: '#7B68EE', secondary: '#9370DB', glow: '#E6E6FA' }, // MediumSlateBlue
            { primary: '#00FF00', secondary: '#32CD32', glow: '#98FB98' }  // Lime
        ];
        
        // Performance settings - MEGA MODE!
        this.config = {
            particlesPerExplosion: 1000,    // Base particles per explosion
            maxSecondaryExplosions: 8,      // Number of secondary explosions
            particlesPerSecondary: 500,     // Particles in secondary explosions
            maxTertiaryExplosions: 16,      // Number of smallest explosions
            particlesPerTertiary: 250,      // Particles in tertiary explosions
            trailLength: 20,                // Length of particle trails
            simultaneousRockets: 3,         // Rockets launched simultaneously
            rocketProbability: 0.1,         // Probability of new rocket launch
            glowIntensity: 0.8,            // Intensity of glow effects
            shockwaveSize: 100,            // Size of explosion shockwaves
        };

        this.rockets = [];
        this.particles = [];
        this.shockwaves = [];
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
        this.canvas.className = 'megabombastic-canvas';
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
        
        console.log("[MegaBombastic] Canvas created successfully");
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            console.log(`[MegaBombastic] Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
        }
    }

    createRocket() {
        const colors = this.colors[Math.floor(Math.random() * this.colors.length)];
        return {
            x: Math.random() * this.canvas.width,
            y: this.canvas.height,
            targetX: Math.random() * this.canvas.width,
            targetY: this.canvas.height * 0.2 + Math.random() * (this.canvas.height * 0.3),
            speed: 15 + Math.random() * 5,
            angle: 0,
            trail: [],
            colors,
            smoke: [],
            size: 3,
            wobble: Math.random() * 2 - 1
        };
    }

    createParticle(x, y, colors, isSecondary = false, isTertiary = false) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isSecondary ? 
            (Math.random() * 6 + 4) : 
            isTertiary ? 
                (Math.random() * 4 + 2) : 
                (Math.random() * 8 + 6);

        return {
            x,
            y,
            colors,
            velocity: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            },
            trail: [],
            angle,
            spin: (Math.random() - 0.5) * 0.3,
            size: isSecondary ? 2 : isTertiary ? 1 : 3,
            alpha: 1,
            gravity: 0.15,
            decay: Math.random() * 0.02 + 0.02,
            explosion: null,
            hasExploded: false,
            isSecondary,
            isTertiary
        };
    }

    createShockwave(x, y, color) {
        return {
            x,
            y,
            color,
            radius: 1,
            alpha: 0.5,
            expansion: 5
        };
    }

    drawGlow(x, y, radius, color, alpha) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${this.hexToRgb(color)}, ${alpha})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '255, 255, 255';
    }

    triggerSecondaryExplosion(particle) {
        if (!particle.hasExploded && !particle.isSecondary) {
            const count = Math.floor(Math.random() * 
                (particle.isTertiary ? this.config.particlesPerTertiary : this.config.particlesPerSecondary) + 
                this.config.particlesPerSecondary / 2);
            
            for (let i = 0; i < count; i++) {
                this.particles.push(this.createParticle(
                    particle.x, 
                    particle.y, 
                    particle.colors, 
                    !particle.isTertiary,
                    particle.isSecondary
                ));
            }
            
            // Add shockwave
            this.shockwaves.push(this.createShockwave(
                particle.x, 
                particle.y, 
                particle.colors.glow
            ));
            
            particle.hasExploded = true;
        }
    }

    animate() {
        if (!this.running || !this.canvas || !this.ctx) {
            console.log("[MegaBombastic] Animation stopped - missing resources");
            return;
        }
        
        if (Date.now() >= this.endTime) {
            this.cleanup();
            return;
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());

        // Clear with transparency instead of solid black
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fade effect with motion blur (reduce alpha for more transparency)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Launch new rockets
        if (Math.random() < this.config.rocketProbability && 
            this.rockets.length < this.config.simultaneousRockets) {
            this.rockets.push(this.createRocket());
        }

        // Update and draw rockets
        this.rockets = this.rockets.filter(rocket => {
            // Calculate movement
            const dx = rocket.targetX - rocket.x;
            const dy = rocket.targetY - rocket.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 5) {
                // Create mega explosion
                for (let i = 0; i < this.config.particlesPerExplosion; i++) {
                    this.particles.push(this.createParticle(rocket.x, rocket.y, rocket.colors));
                }
                // Add mega shockwave
                this.shockwaves.push(this.createShockwave(rocket.x, rocket.y, rocket.colors.glow));
                return false;
            }

            // Update position with wobble
            rocket.angle = Math.atan2(dy, dx);
            rocket.x += Math.cos(rocket.angle) * rocket.speed + Math.sin(Date.now() * 0.01) * rocket.wobble;
            rocket.y += Math.sin(rocket.angle) * rocket.speed;

            // Update trail
            rocket.trail.push({ x: rocket.x, y: rocket.y });
            if (rocket.trail.length > this.config.trailLength) {
                rocket.trail.shift();
            }

            // Draw rocket trail with glow
            if (rocket.trail.length > 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(rocket.trail[0].x, rocket.trail[0].y);
                rocket.trail.forEach(point => {
                    this.ctx.lineTo(point.x, point.y);
                });
                this.ctx.strokeStyle = rocket.colors.primary;
                this.ctx.lineWidth = 4;
                this.ctx.stroke();

                // Glow effect
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = rocket.colors.glow;
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            }

            // Add smoke particles
            if (Math.random() < 0.3) {
                rocket.smoke.push({
                    x: rocket.x,
                    y: rocket.y,
                    size: Math.random() * 2 + 1,
                    alpha: 0.5
                });
            }

            // Update and draw smoke
            rocket.smoke = rocket.smoke.filter(smoke => {
                smoke.y -= 0.5;
                smoke.alpha *= 0.95;
                this.ctx.beginPath();
                this.ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(200, 200, 200, ${smoke.alpha})`;
                this.ctx.fill();
                return smoke.alpha > 0.01;
            });

            return true;
        });

        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            // Update position
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.velocity.y += particle.gravity;
            
            // Add rotation
            particle.angle += particle.spin;
            
            // Update trail
            particle.trail.push({ x: particle.x, y: particle.y });
            if (particle.trail.length > this.config.trailLength) {
                particle.trail.shift();
            }

            // Random chance for secondary explosions
            if (!particle.isSecondary && !particle.isTertiary && 
                Math.random() < 0.02 && !particle.hasExploded) {
                this.triggerSecondaryExplosion(particle);
            }

            // Draw particle trail with glow
            if (particle.trail.length > 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
                particle.trail.forEach(point => {
                    this.ctx.lineTo(point.x, point.y);
                });
                this.ctx.strokeStyle = particle.colors.secondary;
                this.ctx.lineWidth = particle.size;
                this.ctx.stroke();

                // Glow effect
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = particle.colors.glow;
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            }

            // Draw particle
            this.drawGlow(
                particle.x, 
                particle.y, 
                particle.size * 4, 
                particle.colors.glow, 
                particle.alpha * this.config.glowIntensity
            );

            particle.alpha -= particle.decay;
            return particle.alpha > 0;
        });

        // Update and draw shockwaves
        this.shockwaves = this.shockwaves.filter(wave => {
            wave.radius += wave.expansion;
            wave.alpha *= 0.95;

            this.ctx.beginPath();
            this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(${this.hexToRgb(wave.color)}, ${wave.alpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            return wave.alpha > 0.01;
        });
    }

    start(duration) {
        console.log(`[MegaBombastic] Starting with duration: ${duration}`);
        
        // Make sure canvas is attached to the DOM
        if (!document.body.contains(this.canvas)) {
            console.log("[MegaBombastic] Attaching canvas to document body");
            document.body.appendChild(this.canvas);
        }
        
        // Set duration
        this.endTime = duration === "infinite" ? Infinity : Date.now() + duration;
        
        // Start animation if not already running
        if (!this.running) {
            this.running = true;
            this.animate();
            console.log("[MegaBombastic] Animation started");
        } else {
            console.log("[MegaBombastic] Animation already running");
        }
    }

    cleanup() {
        console.log("[MegaBombastic] Cleaning up resources");
        
        // Stop animation
        this.running = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clear data
        this.rockets = [];
        this.particles = [];
        this.shockwaves = [];
        
        // Remove window event listener
        window.removeEventListener('resize', this.resizeHandler);
        
        // Remove canvas from DOM
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            console.log("[MegaBombastic] Canvas removed from DOM");
        }
        
        // Remove any other megabombastic canvases
        document.querySelectorAll('.megabombastic-canvas').forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
                console.log("[MegaBombastic] Removed additional canvas");
            }
        });
    }
}