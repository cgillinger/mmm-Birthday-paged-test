/**
 * @file MMM-Birthday-Paged.js
 * @description A MagicMirror² module that displays birthday celebrations with fireworks and confetti
 * @author Christian Gillinger
 * @license MIT
 * @version 1.5.0
 * 
 * Fork Info: This is a fork of MMM-Birthday specifically optimized for installations
 * using page-switching modules like MMM-pages or MMM-Carousel
 */

Module.register("MMM-Birthday-Paged", {
    defaults: {
        birthdays: [],           
        fireworkDuration: "infinite",
        confettiDuration: "infinite",
        debug: false,             
        startupDelay: 2000,
        immersiveMode: true  // NEW parameter: true = dim other modules (current behavior)
    },

    getStyles: function() {
        return ["MMM-Birthday-Paged.css"];
    },

    getScripts: function() {
        return [
            this.file('fireworks.js'),
            this.file('confetti.js')
        ];
    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            sv: "translations/sv.json",
            da: "translations/da.json",
            de: "translations/de.json",
            es: "translations/es.json",
            fi: "translations/fi.json",
            fr: "translations/fr.json",
            it: "translations/it.json",
            nl: "translations/nl.json",
            no: "translations/no.json",
            pt: "translations/pt.json",
            uk: "translations/uk.json"
        };
    },

    log: function(message, type = 'info') {
        if (this.config.debug) {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = `[MMM-Birthday-Paged][${timestamp}]`;
            switch(type.toLowerCase()) {
                case 'error':
                    console.error(prefix, message);
                    break;
                case 'warn':
                    console.warn(prefix, message);
                    break;
                case 'debug':
                    console.debug(prefix, message);
                    break;
                default:
                    console.log(prefix, message);
            }
        }
    },

    start: function() {
        this.log("Starting module initialization");
        
        this.loaded = false;
        this.fireworks = null;
        this.celebrating = false;
        this._wasCelebrating = false;
        this.celebrationInterval = null;
        this.currentCelebrant = null;
        this.overlay = null;
        this.moduleInitialized = false;
        this.blackBackground = null;

        this.language = config.language || 'en';
        this.log(`Using language: ${this.language}`);
        
        this.defaultTranslations = {
            MESSAGES: [
                "🎉 Happy Birthday, {name}! 🎂",
                "🎈 Best wishes on your special day, {name}! 🎁",
                "🌟 Have a fantastic birthday, {name}! 🎊"
            ]
        };
        
        // We won't schedule birthday checks here anymore
        // Instead we'll wait for ALL_MODULES_STARTED notification
    },

    notificationReceived: function(notification, payload, sender) {
        if (notification === "MODULE_DOM_CREATED") {
            this.log("MODULE_DOM_CREATED notification received");
            this.moduleInitialized = true;
        } 
        else if (notification === "ALL_MODULES_STARTED") {
            this.log("ALL_MODULES_STARTED notification received");
            // Start the birthday checks AFTER all modules have started
            this.scheduleNextCheck();
        }
    },

    cleanupCelebration: function() {
        this.log("Starting celebration cleanup");
        
        // Clean up blackBackground if it exists
        if (this.blackBackground && this.blackBackground.parentNode) {
            this.blackBackground.parentNode.removeChild(this.blackBackground);
            this.blackBackground = null;
            this.log("Removed black background overlay");
        }
        
        if (this.fireworks) {
            this.log("Cleaning up fireworks");
            this.fireworks.cleanup();
        }
        
        this.log("Cleaning up confetti");
        Confetti.cleanup();
        
        if (this.celebrationInterval) {
            this.log("Clearing celebration interval");
            clearInterval(this.celebrationInterval);
        }
        
        const wrapper = document.querySelector('.birthday-module');
        if (wrapper) {
            this.log("Removing celebration wrapper from DOM");
            wrapper.remove();
        }
        
        this.log("Resetting other modules' appearance");
        document.querySelectorAll('.module').forEach(module => {
            if (!module.classList.contains('birthday-module')) {
                module.style.filter = '';
                module.style.opacity = '1';
                module.style.visibility = 'visible';
                module.style.display = 'block';
            }
        });
        
        this.log("Celebration cleanup completed");
    },

    suspend: function() {
        this.log("Module suspend triggered");
        
        if (this.celebrating) {
            this.log(`Suspending active celebration for ${this.currentCelebrant}`);
            this._wasCelebrating = true;
            this.cleanupCelebration();
            this.celebrating = false;
            this.log("Celebration suspended successfully");
        } else {
            this.log("No active celebration to suspend");
        }
    },

    resume: function() {
        this.log("Module resume triggered");
        
        // Force a birthday check when this page becomes visible
        setTimeout(() => {
            this.log("Running birthday check on page visibility");
            this.checkBirthdays(true);
        }, 500);
        
        if (this._wasCelebrating) {
            this.log("Resuming previous celebration");
            
            this.cleanupCelebration();
            this._wasCelebrating = false;
            this.celebrating = true;
            
            const now = new Date();
            const currentDate = (now.getMonth() + 1).toString().padStart(2, '0') + 
                              "-" + now.getDate().toString().padStart(2, '0');
            
            this.log(`Checking if ${currentDate} matches any birthdays`);
            
            const birthdayPerson = this.config.birthdays.find(birthday => 
                birthday.date.startsWith(currentDate)
            );
            
            if (birthdayPerson) {
                this.log(`Birthday is still active for ${birthdayPerson.name}, restarting celebration`);
                this.currentCelebrant = birthdayPerson.name;
                setTimeout(() => {
                    this.celebrateBirthday(birthdayPerson.name);
                }, 500);
            } else {
                this.log("Birthday is no longer active, cleaning up", 'warn');
                this.celebrating = false;
                this._wasCelebrating = false;
                this.currentCelebrant = null;
                this.cleanupCelebration();
            }
        }
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "birthday-module";
        wrapper.id = "birthday-module-container";
        this.log("Created DOM wrapper");
        
        // Make sure the module doesn't have a black background
        wrapper.style.backgroundColor = "transparent";
        wrapper.style.background = "none";
        
        return wrapper;
    },

    scheduleNextCheck: function() {
        this.log("Scheduling birthday checks");
        
        // Initial check with a delay to ensure all modules are ready
        setTimeout(() => {
            this.log("Performing initial birthday check after startup delay");
            this.checkBirthdays();
        }, this.config.startupDelay);

        // Set up periodic checks
        setInterval(() => {
            this.checkBirthdays();
        }, 60000);
    },

    checkBirthdays: function(forceCheck = false) {
        const now = new Date();
        const currentDate = (now.getMonth() + 1).toString().padStart(2, '0') + 
                           "-" + now.getDate().toString().padStart(2, '0');

        this.log(`Checking birthdays for date: ${currentDate}`);

        if (!Array.isArray(this.config.birthdays)) {
            this.log("Birthdays configuration is not an array", 'error');
            return;
        }

        // Debug log all configured birthdays
        this.log(`Configured birthdays: ${JSON.stringify(this.config.birthdays)}`);

        const birthdayPerson = this.config.birthdays.find(birthday => 
            birthday.date.startsWith(currentDate)
        );
        
        if (birthdayPerson && (!this.celebrating || forceCheck)) {
            this.log(`Found birthday for ${birthdayPerson.name} on ${currentDate}`);
            this.currentCelebrant = birthdayPerson.name;
            this.celebrating = true;
            
            // Add small delay to ensure DOM is ready
            setTimeout(() => {
                this.celebrateBirthday(birthdayPerson.name);
            }, 100);
        }
    },

    getRandomMessage: function(name) {
        let messages;
        try {
            messages = this.translate("MESSAGES");
            if (messages === "MESSAGES") {
                this.log("Using default messages (translation not found)");
                messages = this.defaultTranslations.MESSAGES;
            }
        } catch (e) {
            this.log("Translation failed, using default messages", 'warn');
            messages = this.defaultTranslations.MESSAGES;
        }
        
        if (!Array.isArray(messages)) {
            this.log("Invalid translation format, using default messages", 'warn');
            messages = this.defaultTranslations.MESSAGES;
        }

        const message = messages[Math.floor(Math.random() * messages.length)];
        return message.replace('{name}', name);
    },

    celebrateBirthday: function(name) {
        this.log(`Starting celebration for ${name}`);
        
        // Clean up any existing celebrations first
        this.cleanupCelebration();
        
        // Initialize the message wrapper
        const msgWrapper = document.querySelector('#birthday-module-container') || this.createWrappedElement();
        msgWrapper.innerHTML = '';
        msgWrapper.style.display = 'block';
        
        // Create message element
        const messageDiv = document.createElement("div");
        messageDiv.className = "birthday-message";
        messageDiv.innerHTML = this.getRandomMessage(name);
        msgWrapper.appendChild(messageDiv);
        
        // Add debug info if enabled
        if (this.config.debug) {
            const debugDiv = document.createElement("div");
            debugDiv.className = "debug-info";
            debugDiv.innerHTML = `
                <p>Debug Info:</p>
                <p>Name: ${name}</p>
                <p>ImmersiveMode: ${this.config.immersiveMode}</p>
                <p>Wrapper exists: true</p>
                <p>Fireworks initialized: ${this.fireworks ? 'true' : 'false'}</p>
                <p>Time: ${new Date().toLocaleTimeString()}</p>
            `;
            msgWrapper.appendChild(debugDiv);
        }
        
        // Apply immersiveMode setting to other modules
        this.adjustOtherModules();
        
        // Initialize and start visual effects
        if (!this.fireworks) {
            this.fireworks = new Fireworks();
        }
        this.startFireworks();
        
        Confetti.init();
        this.startConfetti();
        
        // Set timeout if not infinite
        if (this.config.fireworkDuration !== "infinite") {
            this.log(`Setting celebration duration: ${this.config.fireworkDuration}ms`);
            setTimeout(() => {
                this.stopCelebration();
            }, this.config.fireworkDuration);
        }
    },

    createWrappedElement: function() {
        this.log("Creating new celebration wrapper");
        const wrapper = document.createElement("div");
        wrapper.id = "birthday-module-container";
        wrapper.className = "birthday-module";
        wrapper.style.position = "fixed";
        wrapper.style.top = "50%";
        wrapper.style.left = "50%";
        wrapper.style.transform = "translate(-50%, -50%)";
        wrapper.style.zIndex = "999999";
        wrapper.style.pointerEvents = "none";
        wrapper.style.display = "block";
        wrapper.style.backgroundColor = "transparent";
        wrapper.style.background = "none";
        
        document.body.appendChild(wrapper);
        return wrapper;
    },

    adjustOtherModules: function() {
        this.log("Adjusting other modules based on immersiveMode setting");
        
        // Remove existing black background if any
        if (this.blackBackground && this.blackBackground.parentNode) {
            this.blackBackground.parentNode.removeChild(this.blackBackground);
            this.blackBackground = null;
        }
        
        if (this.config.immersiveMode) {
            this.log("Immersive mode enabled - dimming other modules");
            
            // Rather than a full black background, we'll use a semi-transparent overlay
            const overlay = document.createElement("div");
            overlay.className = "birthday-dim-overlay";
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            overlay.style.zIndex = "999997"; // Just below fireworks and confetti
            overlay.style.pointerEvents = "none";
            
            document.body.appendChild(overlay);
            this.blackBackground = overlay;
            
            // Ensure all modules are still visible but dimmed
            document.querySelectorAll('.module').forEach(module => {
                if (!module.classList.contains('birthday-module')) {
                    module.style.filter = 'brightness(30%)';
                    module.style.transition = 'filter 0.5s ease-in-out';
                    module.style.zIndex = "1"; // Ensure modules are shown above default background
                }
            });
        } else {
            this.log("Immersive mode disabled - keeping other modules at normal brightness");
            // Normal mode - just ensure all modules are visible
            document.querySelectorAll('.module').forEach(module => {
                module.style.filter = '';
                module.style.opacity = '1';
                module.style.visibility = 'visible';
                module.style.display = 'block';
                module.style.zIndex = "1"; // Ensure modules are shown above default background
            });
        }
    },

    startFireworks: function() {
        this.log("Starting fireworks animation");
        if (this.fireworks) {
            this.fireworks.start(this.config.fireworkDuration);
        } else {
            this.log("ERROR: Fireworks object not initialized", 'error');
        }
    },

    startConfetti: function() {
        this.log("Starting confetti animation");
        const isInfinite = this.config.confettiDuration === "infinite";
        const end = isInfinite ? Infinity : Date.now() + this.config.confettiDuration;

        const fireBurst = () => {
            if (this.celebrating && (isInfinite || Date.now() < end)) {
                Confetti.fire();
                const nextDelay = 2000 + Math.random() * 6000;
                setTimeout(fireBurst, nextDelay);
            }
        };

        setTimeout(fireBurst, 1000);
    },

    stopCelebration: function() {
        this.log("Stopping celebration");
        
        if (this.celebrationInterval) {
            clearInterval(this.celebrationInterval);
        }
        
        // Remove the dim overlay if it exists
        if (this.blackBackground && this.blackBackground.parentNode) {
            this.blackBackground.parentNode.removeChild(this.blackBackground);
            this.blackBackground = null;
        }
        
        // Reset module display
        const msgWrapper = document.querySelector('#birthday-module-container');
        if (msgWrapper) {
            msgWrapper.style.display = 'none';
        }
        
        // Restore other modules
        document.querySelectorAll('.module').forEach(module => {
            module.style.filter = '';
            module.style.opacity = '1';
            module.style.visibility = 'visible';
            module.style.display = 'block';
        });
        
        // Reset state
        this.celebrating = false;
        this._wasCelebrating = false;
        this.currentCelebrant = null;
        
        // Clean up visual effects
        if (this.fireworks) {
            this.fireworks.cleanup();
        }
        Confetti.cleanup();
        
        this.log("Celebration stopped successfully");
    }
});
