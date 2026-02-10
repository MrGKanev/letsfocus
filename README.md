# LetsFocus 🎧

A beautiful, minimal focus timer with scientifically-designed ambient sounds. Perfect for deep work, studying, and productivity.

## ✨ Features

- **9 Sound Profiles**: Choose from binaural beats, rain sounds, brown noise, lo-fi beats, and more
- **Pomodoro Timer**: Customizable focus sessions
- **Full-Screen Design**: Minimal, distraction-free interface
- **Mobile Responsive**: Works perfectly on all devices
- **No Ads**: Completely free and open source

### Sound Profiles

1. **🎵 Deep Focus** - Ambient generative soundscape
2. **🧠 Alpha Waves** - Binaural beats for relaxed focus (8-13 Hz)
3. **⚡ Beta Waves** - Binaural beats for active concentration (14-30 Hz)
4. **🌊 Brown Noise** - Deep noise for blocking distractions
5. **❄️ White Noise** - Classic white noise
6. **🌧️ Rain Sounds** - Realistic rain ambience
7. **🎧 Lo-fi Beats** - Chill hip-hop inspired beats (70 BPM)
8. **〰️ Minimal Tones** - Simple sine wave patterns
9. **🌲 Forest Ambience** - Natural soundscape with bird chirps

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/MrGKanev/letsfocus.git
cd letsfocus

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

The app will open at \`http://localhost:5173\` (or the port Vite assigns)

### Build for Production

\`\`\`bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
\`\`\`

## 📁 Project Structure

\`\`\`
letsfocus/
├── js/
│   ├── audio/          # Audio engines and profiles
│   ├── timer/          # Timer logic
│   ├── ui/             # UI components
│   └── main.js         # App entry point
├── styles/
│   └── main.css        # Tailwind CSS with @theme
├── index.html          # Main HTML
├── package.json        # Dependencies
└── vite.config.js      # Vite config
\`\`\`

## 🎨 Customization

### Adding New Sound Profiles

Edit \`js/audio/soundProfiles.js\`:

\`\`\`javascript
export const SOUND_PROFILES = {
    MY_PROFILE: {
        id: 'my_profile',
        name: 'My Profile',
        description: 'Description here',
        icon: '🎵',
        config: {
            type: 'noise',
            // ... configuration
        }
    }
}
\`\`\`

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
