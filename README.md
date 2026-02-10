# LetsFocus
A minimal focus timer with scientifically-designed ambient sounds for deep work and productivity.
## Features
- **9 Sound Profiles**: Binaural beats, rain sounds, brown noise, lo-fi beats, and more
- **Pomodoro Timer**: Customizable focus sessions
- **Full-Screen Design**: Minimal, distraction-free interface
- **Mobile Responsive**: Works on all devices
- **No Ads**: Free and open source
### Sound Profiles

1. ** Deep Focus** - Ambient generative soundscape
2. ** Alpha Waves** - Binaural beats for relaxed focus (8-13 Hz)
3. ** Beta Waves** - Binaural beats for active concentration (14-30 Hz)
4. ** Brown Noise** - Deep noise for blocking distractions
5. ** White Noise** - Classic white noise
6. ** Rain Sounds** - Realistic rain ambience
7. ** Lo-fi Beats** - Chill hip-hop inspired beats (70 BPM)
8. ** Minimal Tones** - Simple sine wave patterns
9. ** Forest Ambience** - Natural soundscape with bird chirps

## Quick Start
```bash
git clone https://github.com/MrGKanev/letsfocus.git
cd letsfocus
npm install
npm run dev
```
App runs at `http://localhost:5173\`
### Build
```bash
npm run build
npm run preview
```
## Project Structure
```
letsfocus/
├── js/audio/       # Audio engines
├── js/timer/       # Timer logic
├── js/ui/          # UI components
├── styles/         # Tailwind CSS
├── index.html
└── package.json
```
## Customization
Add new sound profiles in `js/audio/soundProfiles.js`:
```javascript
export const SOUND_PROFILES = {
MY_PROFILE: {
id: 'my_profile',
name: 'My Profile',
description: 'Description',
icon: '🎵',
config: { type: 'noise', /* ... */ }
}
}
```
