# MMM-Birthday-Paged

A MagicMirror² module that celebrates birthdays with animated fireworks and confetti effects, specifically designed for use with page-switching modules like MMM-pages and MMM-Carousel.

This is a specialized version of [MMM-Birthday](https://github.com/cgillinger/MMM-Birthday) optimized for multi-page MagicMirror setups. If you're running a single-page setup where you want birthday celebrations to overlay existing content, please use the original [MMM-Birthday](https://github.com/cgillinger/MMM-Birthday) module instead.

## Key Features

- Designed for dedicated celebration pages in multi-page setups
- Multiple firework effects to choose from
- Two display modes: immersive (dims other content) or standard (overlays content)
- Optimized for page transitions
- Enhanced compatibility with MMM-pages and MMM-Carousel
- Improved startup behavior with page-switching modules

![Example](example.webp)

## Installation

1. Navigate to your MagicMirror's modules directory:
```bash
cd ~/MagicMirror/modules
```

2. Clone this repository:
```bash
git clone https://github.com/cgillinger/MMM-Birthday-Paged.git
```

3. Install dependencies:
```bash
cd MMM-Birthday-Paged
npm install
```

## Configuration

### Basic Module Configuration

Add the module to your `config/config.js` file:

```javascript
{
    module: "MMM-Birthday-Paged",
    position: "middle_center",
    config: {
        birthdays: [
            { name: "Anna", date: "03-15" },
            { name: "Beth", date: "07-22" },
            { name: "Charlie", date: "12-25 08:00" }
        ],
        fireworkDuration: "infinite", // or specific duration in milliseconds
        confettiDuration: "infinite", // or specific duration in milliseconds
        immersiveMode: true           // Set to false for standard overlay mode
    }
}
```

### Display Modes

The module offers two display modes, controlled by the `immersiveMode` parameter:

1. **Immersive Mode** (`immersiveMode: true`, default): Other modules are dimmed to 30% brightness during birthday celebrations, creating a focused celebration experience.

2. **Standard Mode** (`immersiveMode: false`): Fireworks and message appear over other modules without dimming them, similar to the original MMM-Birthday module.

### Firework Effects

The module comes with several firework effects located in the `fireworks` directory. You can choose between:

- `classic` - Traditional starburst firework effect (default)
- `sparkle` - CSS-based effect with glowing sparks and trails
- `spiral` - Rotating star-shaped particles in spiral patterns
- `comet_trail` - Long-lasting trails with comet-like effects
- `glow` - Enhanced glowing effects with improved physics
- `jellyfish` - Unique jellyfish-inspired effect with tentacles
- `kaleidoscope` - Geometric patterns with rotating elements
- `waterfall` - Cascading color-shifting effects
- `megabombastic` - High-intensity effect (requires powerful hardware)

To change the firework effect:

1. Navigate to the module's `fireworks` directory
2. Choose the effect you want to use
3. Copy your chosen effect file to the module's root directory
4. Rename the copied file to `fireworks.js` (this is important!)

For example, to use the spiral effect:
```bash
cd ~/MagicMirror/modules/MMM-Birthday-Paged
cp fireworks/spiral_fireworks.js fireworks.js
```

Note: The ability to select effects via config.js will be added in a future update.

### Using with MMM-pages

This module works seamlessly with MMM-pages. You can configure different behavior on different pages:

```javascript
// In your config.js file:
{
    module: "MMM-Birthday-Paged",
    position: "middle_center",
    classes: "page2",            // Show on page 2
    config: {
        birthdays: [
            { name: "Anna", date: "03-15" }
        ],
        immersiveMode: true      // Dim other modules on this page
    }
},
{
    module: "MMM-Birthday-Paged",
    position: "middle_center",
    classes: "page3",            // Show on page 3
    config: {
        birthdays: [
            { name: "Beth", date: "07-22" }
        ],
        immersiveMode: false     // Don't dim other modules on this page
    }
},
{
    module: "MMM-pages",
    config: {
        modules: [
            ["clock", "calendar", "weather"],  // Page 1
            ["MMM-Birthday-Paged"],           // Page 2 - Immersive celebration
            ["MMM-Birthday-Paged", "weather"] // Page 3 - Standard celebration with weather
        ],
        fixed: ["alert"],
        rotationTime: 15000,
        rotationDelay: 15000,
    }
}
```

### Using with MMM-Carousel

Example configuration with MMM-Carousel:

```javascript
{
    module: "MMM-Birthday-Paged",
    position: "middle_center",
    classes: "slide1",           // Show on slide 1
    config: {
        birthdays: [
            { name: "Anna", date: "03-15" }
        ],
        immersiveMode: true      // Dim other modules
    }
},
{
    module: "MMM-Carousel",
    config: {
        transitionInterval: 15000,
        mode: "slides",
        slides: [
            ["MMM-Birthday-Paged"],          // Slide 1 with immersive mode
            ["clock", "calendar"]            // Slide 2
        ]
    }
}
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `birthdays` | Array of birthday objects containing name and date | `[]` |
| `fireworkDuration` | Duration of fireworks in ms or "infinite" | "infinite" |
| `confettiDuration` | Duration of confetti in ms or "infinite" | "infinite" |
| `immersiveMode` | If true, other modules are dimmed during celebration | `true` |
| `debug` | Enable detailed logging for troubleshooting | `false` |
| `startupDelay` | Delay before first birthday check in ms | `2000` |

### Birthday Format
- Date format: `MM-DD` or `MM-DD HH:mm`
- Example: `"12-25"` for December 25th
- Example with time: `"12-25 08:00"` for December 25th at 8:00 AM

## Advanced Configuration Examples

### Different Display Modes Based on Pages

You can create a setup with different display modes for different pages:

```javascript
// Page 1: Standard calendar view
// Page 2: Immersive birthday celebration view (dims other content)
// Page 3: Standard birthday celebration view (shows other content)

{
    module: "clock",
    position: "top_left",
    classes: "page1 page3"   // Show on pages 1 and 3
},
{
    module: "calendar",
    position: "top_right",
    classes: "page1 page3"   // Show on pages 1 and 3
},
{
    module: "MMM-Birthday-Paged",
    position: "middle_center",
    classes: "page2",        // Show on page 2
    config: {
        birthdays: [
            { name: "Anna", date: "03-15" }
        ],
        immersiveMode: true  // Dim other modules (full celebration)
    }
},
{
    module: "MMM-Birthday-Paged", 
    position: "lower_third",
    classes: "page3",        // Show on page 3
    config: {
        birthdays: [
            { name: "Beth", date: "07-22" }
        ],
        immersiveMode: false // Don't dim other modules
    }
},
{
    module: "MMM-pages",
    config: {
        modules: [
            ["page1"],       // Page 1: Regular content
            ["page2"],       // Page 2: Full immersive celebration
            ["page3"]        // Page 3: Birthday with other visible content
        ],
        fixed: ["alert"],
        rotationTime: 15000
    }
}
```

### Dedicated Celebration Page Setup

This example shows how to set up a dedicated celebration page that only appears on birthdays:

```javascript
// Setup with notification control to show the birthday page only on birthdays
{
    module: "MMM-pages",
    config: {
        modules: [
            ["clock", "calendar", "weather"],  // Page 1: Daily view
            ["newsfeed", "MMM-MyModule"],      // Page 2: News view
        ],
        fixed: ["alert", "MMM-page-indicator"],
        hiddenPages: {
            "birthdayPage": ["MMM-Birthday-Paged"] // Hidden page that shows only on birthdays
        },
        rotationTime: 30000
    }
},
{
    module: "MMM-Birthday-Paged",
    position: "middle_center",
    classes: "birthdayPage",
    config: {
        birthdays: [
            { name: "Anna", date: "03-15" },
            { name: "Beth", date: "07-22" }
        ],
        immersiveMode: true,
        onBirthdayNotification: true // Will emit a notification when a birthday is detected
    }
}
```

Then, you can use a custom module or script that listens for the birthday notification and shows the hidden page:

```javascript
// In a custom module
notificationReceived: function(notification, payload) {
    if (notification === "BIRTHDAY_DETECTED") {
        this.sendNotification("SHOW_HIDDEN_PAGE", "birthdayPage");
        
        // Optional: Return to normal pages after celebration
        setTimeout(() => {
            this.sendNotification("LEAVE_HIDDEN_PAGE");
        }, 60000); // After 1 minute
    }
}
```

## Technical Details

### Page Switching Behavior

When using this module with page-switching modules:
1. The module fully creates a proper celebration experience on its page(s)
2. The `immersiveMode` setting controls whether other content is dimmed
3. First startup/transition might behave slightly differently due to module initialization timing
4. Subsequent transitions will work smoothly
5. The module automatically handles cleanup during page transitions

### Firework Effects Performance

Different firework effects have varying performance requirements:
- `classic`, `sparkle`, and `comet_trail` are optimized for all devices including Raspberry Pi
- `spiral`, `glow`, and `waterfall` require moderate processing power
- `megabombastic` is designed for powerful hardware and should be used with caution on low-power devices
- All other effects should work well on most modern devices

### Debug Logging

Enable debug logging in your config to troubleshoot any issues:
```javascript
config: {
    debug: true,
    ...
}
```

## Dependencies

- MagicMirror²: Minimum version 2.15.0
- Node.js: Minimum version 12.0.0
- canvas-confetti: ^1.9.3
- MMM-pages or MMM-Carousel (recommended)

## Credits

This module is a specialized version of the original [MMM-Birthday](https://github.com/cgillinger/MMM-Birthday) module, modified specifically for use with page-switching modules.

## Author

- Christian Gillinger
- License: MIT
- Version: 1.1.0

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/cgillinger/MMM-Birthday-Paged/issues).

## Changelog

### Version 1.1.0
- Added new `immersiveMode` option to control whether other modules are dimmed
- Fixed transparency issues with all firework effects
- Improved compatibility with different page-switching modules
- Added better debug logging for troubleshooting
- Enhanced cleanup process to prevent resource leaks

### Version 1.0.0
- Initial release based on MMM-Birthday v1.4.2
- Added multiple firework effect options
- Added custom firework effect support
- Specialized for page-switching environments
- Enhanced page transition handling
- Added comprehensive debug logging
- Improved module state management for page switches