# 🏰 Aethel's Forge - AI-Moderated D&D RPG

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.7-green.svg)](https://github.com/pmndrs/zustand)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-orange.svg)](https://openai.com/)

> **A browser-based, AI-moderated Dungeons & Dragons RPG with sophisticated Director AI for dynamic game mastering**

Aethel's Forge combines comfortable onboarding, balanced character generation, dynamic scenarios, and AI-driven game mastering into a beautiful, fast, and stable application. Experience the best single/hot-seat RPG sessions without needing a human Dungeon Master.

---

## 🌟 Key Features

### 🎭 **AI Game Master**
- **Intelligent Director AI**: Advanced pacing analysis, spotlight distribution, and difficulty balancing
- **Dynamic Storytelling**: Real-time story beat recognition and character arc progression
- **Enhanced Character Interaction**: AI addresses characters by name and responds to their individual traits
- **Smart Tool Integration**: Automated dice rolls and character updates through validated tool calls

### 🎲 **Complete RPG Experience**
- **Full Character Creation**: 8-step wizard with race abilities, class restrictions, and portrait selection
- **Enhanced Race System**: 10 races with unique stat bonuses and special abilities
- **Class Weapon Restrictions**: Realistic weapon proficiency system with visual indicators
- **Dynamic Inventory**: Auto-equip starter equipment with categorized trait display
- **Visual Dice System**: Beautiful 3D dice roller overlay with physics

### 🎵 **Immersive Audio**
- **Scene-Based Music**: 15+ ambient tracks that change based on game context
- **Smart Audio Management**: Music persists through navigation, no restarts on actions
- **UI Sound Effects**: Responsive audio feedback for all interactions
- **Automatic Scene Detection**: AI analyzes game state to select appropriate atmosphere

### 🏗️ **Robust Architecture**
- **State Management**: Zustand store with localStorage persistence
- **Type Safety**: Full TypeScript integration with Zod schema validation
- **Effects System**: Deterministic gameplay through validated Effects objects
- **Auto-Save**: Intelligent background saves with conflict resolution

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **OpenRouter API Key** (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/dnd-ai.git
cd dnd-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Copy example environment file
cp .env.example .env.local

# Add your OpenRouter API key
echo "OPENROUTER_API_KEY=sk-or-v1-your-key-here" >> .env.local
echo "OPENROUTER_BASE_URL=https://openrouter.ai/api/v1" >> .env.local
echo "OPENROUTER_MODEL=openai/gpt-oss-20b:free" >> .env.local
```

4. **Start development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000` and start your adventure!

---

## 🎮 How to Play

### 1. **Campaign Setup**
- Choose from predefined adventures or create custom scenarios
- Select difficulty level and estimated duration
- Pick your preferred theme and setting

### 2. **Character Creation**
- **Race Selection**: Choose from 10 enhanced races with unique abilities
- **Class Selection**: Pick your class with realistic weapon restrictions
- **Portrait Selection**: AI-generated character portraits with race-specific traits
- **Auto-Generation**: Complete character stats, inventory, and backstory

### 3. **Gameplay**
- **Chat Interface**: Natural language interaction with the AI DM
- **Side Panel**: Access character sheets, inventory, and quest log
- **Dice System**: Automatic and manual dice rolls with beautiful animations
- **Director AI**: Background analysis ensures balanced, engaging gameplay

---

## 🏗️ Architecture Overview

### Core Technologies

```
Frontend:    Next.js 15.4.6 + React 19 + TypeScript
State:       Zustand + Persistence Middleware  
AI:          OpenRouter + OpenAI GPT Models
Styling:     Tailwind CSS + Custom Themes
Audio:       Web Audio API + Scene Management
Validation:  Zod Schemas + Type Safety
```

### Data Flow Pattern

```
GameView → Zustand Store → API Routes → OpenRouter → Director AI → Effects → Store Update
```

**Key Principle**: All game state changes flow through `Effects` objects validated by Zod schemas, ensuring deterministic and reproducible gameplay.

### Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes (AI, saves, settings)
│   ├── components/        # React components
│   └── pages/            # Route pages
├── lib/                   # Business logic
│   ├── ai/               # OpenRouter integration & prompts
│   ├── audio/            # Scene-based music system
│   ├── character/        # Character generation & systems  
│   ├── engine/           # Game engine & Director AI
│   └── state/            # Zustand store management
├── public/               # Static assets (music, portraits, sounds)
├── schemas/              # Zod validation schemas
└── styles/               # Global CSS & theme system
```

---

## 🧠 AI Director System

The heart of Aethel's Forge is its sophisticated AI Director that analyzes gameplay in real-time:

### **Pacing Analysis**
- Monitors action/exploration/social balance
- Suggests appropriate scene transitions
- Prevents gameplay stagnation

### **Spotlight Management** 
- Tracks individual character involvement
- Ensures fair participation across party members
- Activates quiet players with targeted opportunities

### **Difficulty Scaling**
- Analyzes party capability vs recent challenges
- Dynamically adjusts encounter difficulty
- Maintains engagement without frustration

### **Story Progression**
- Recognizes story beats and character arcs
- Suggests plot developments and emotional moments
- Maintains narrative tension and pacing

---

## 🎨 Themes & Customization

### Available Themes
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Elegant dark theme  
- **Auto Mode**: System-based switching
- **Fantasy Variants**: Immersive themed experiences

### Audio Scenes
- **15+ Music Tracks**: Cave, city, combat, campfire, woods, mountains, etc.
- **Dynamic Switching**: AI detects context and changes music appropriately  
- **Smooth Transitions**: Fade in/out prevents jarring audio changes
- **UI Sound Effects**: Button clicks, dice rolls, notifications

### Character Portraits
- **Race-Specific**: Unique portrait sets for each race
- **Fallback System**: Graceful handling of missing images
- **Enhanced Display**: Race abilities shown during selection

---

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Production build with type checking  
npm run start    # Start production server
npm run lint     # ESLint code analysis
```

### Environment Variables

```bash
# Required for AI features
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-oss-20b:free

# Optional customization
NEXT_PUBLIC_APP_NAME=Aethel's Forge
NEXT_PUBLIC_VERSION=0.1.0
```

### Key Development Patterns

#### **State Management**
```typescript
// Always use store actions, never mutate directly
const { startGame, applyEffects } = useGameStore();

// Get current state in async operations
const { history, party } = useGameStore.getState();
```

#### **Effects System**
```typescript
// All game changes flow through validated Effects
const effects: Effects = {
  party: [{ name: 'Hero', hpDelta: -5 }],
  inventory: [{ op: 'add', item: 'Health Potion' }]
};
applyEffects(effects);
```

#### **Director Integration**
```typescript
// Include Director AI analysis in API calls
const directorAdvice = getEnhancedDirectorAdvice({ 
  history, 
  party, 
  historyCount: history.length 
});
```

---

## 🎯 Game Features Deep Dive

### **Enhanced Race System**
- **10 Unique Races**: Human, Elf, Dwarf, Halfling, Gnome, Half-Elf, Half-Orc, Tiefling, Dragonborn, Genasi
- **Stat Bonuses**: Race-specific attribute modifications
- **Special Abilities**: Unique traits like Darkvision, Lucky, Rage, etc.
- **Visual Integration**: Race info displayed during character creation

### **Class Weapon Restrictions** 
- **Realistic Proficiencies**: Classes limited to appropriate weapon types
- **Visual Indicators**: Color-coded compatibility (Green/Yellow/Red)
- **Efficiency Display**: Damage effectiveness percentages
- **Primary Weapons**: 3 main weapon types per class

### **Intelligent Inventory**
- **Auto-Equip**: Starter equipment automatically equipped
- **Location Tracking**: Items properly categorized (equipped/backpack)
- **Visual Management**: Clear inventory organization
- **Weapon Compatibility**: Real-time proficiency checking

### **Dynamic Quest System**
- **Automatic Generation**: AI creates contextual quests
- **Progress Tracking**: Quest completion and updates
- **Integration**: Quests influence Director AI decisions

---

## 🌍 Internationalization

Currently supports:
- **German (de)**: Primary language
- **English (en)**: Secondary support

Translation system built with `react-i18next` and `next-i18next` for seamless language switching.

---

## 📱 Browser Compatibility

### Supported Browsers
- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support  
- **Safari**: Core features supported
- **Mobile**: Responsive design, touch-friendly

### Required Features
- **Web Audio API**: For music and sound effects
- **LocalStorage**: For game persistence
- **ES2020+**: Modern JavaScript features
- **CSS Grid/Flexbox**: Layout systems

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Make your changes with tests
6. Submit a pull request

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code standards
- **Prettier**: Automatic formatting
- **Conventional Commits**: Clear commit messages

### Key Areas for Contribution

- **New Races/Classes**: Expand character options
- **Music/Sound**: Additional audio assets
- **AI Prompts**: Improve Director AI intelligence  
- **UI/UX**: Enhanced visual design
- **Localization**: Additional language support

---

## 🐛 Known Issues & Roadmap

### Current Limitations
- **Single Player**: Multi-player support planned for v2.0
- **English AI**: German-native AI responses in development
- **Mobile UX**: Touch interface optimizations ongoing
- **Offline Mode**: Full offline capability planned

### Upcoming Features
- **Campaign Builder**: Visual campaign creation tools
- **Custom Races**: User-defined race creation
- **Voice Integration**: Speech recognition and text-to-speech
- **Enhanced Graphics**: Improved visual assets
- **Community Features**: Campaign sharing and collaboration

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **D&D 5e**: Game mechanics and inspiration from Wizards of the Coast
- **OpenRouter**: AI model access and integration
- **Next.js Team**: Excellent React framework
- **Zustand**: Simple and effective state management
- **Community**: Feedback and feature suggestions

---

## 📞 Support

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/yourusername/dnd-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dnd-ai/discussions)
- **Documentation**: Check the `docs/` folder for technical details

### Reporting Bugs
When reporting bugs, please include:
1. **Browser and version**
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Console errors** (if any)
5. **Game state** (if relevant)

---

**Ready to embark on your AI-powered D&D adventure? Start your quest now!** 🗡️✨

---

*Built with ❤️ for the D&D community by passionate developers and dungeon masters.*
