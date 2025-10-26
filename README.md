<img width="2900" height="2160" alt="extradosed-unclimaxed-carmel ngrok-free dev_" src="https://github.com/user-attachments/assets/df859a66-df95-4331-866b-4ed23036b965" />
<img width="1234" height="1061" alt="mm-2" src="https://github.com/user-attachments/assets/5903b78b-a2aa-4783-b4ce-ec3044ca2315" />

# AI Manga Maker
🎨

An AI-powered manga creation game where players assume the role of an overworked manga artist, picking up work projects from their high-pressure boss and creating manga panels to fulfill client contracts.

## 🎮 Demo

- **Live Deployment**: [https://manga-maker-five.vercel.app/](https://manga-maker-five.vercel.app/)
- **Video Demo**: [Watch on YouTube](https://www.youtube.com/watch?v=LuINLqlHpnQ)

## 📖 About

Inspired by role-based simulation games like **Game Dev Tycoon** and **Papa's Burgeria**, this game puts you in the shoes of a manga artist working on tight deadlines.

### How It Works

1. **Receive Contracts**: AI procedurally generates unique work contracts for creating manga panels
2. **Create Manga**: Use our manga editor UI to assemble panels, speech bubbles, and VFX
3. **Generate Images**: Input prompts to generate anime-style images for your panels using our backend API
4. **Get Graded**: AI evaluates your creation based on artistic quality and how well you fulfilled the contract requirements

## ✨ Features

- 🤖 AI-generated work contracts with unique requirements
- 🎨 Interactive manga panel editor
- 💬 Speech bubble and VFX tools
- 🖼️ AI-powered image generation for manga panels
- 📊 AI-based grading system
- 🎵 Immersive audio and visual effects

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19)
- **UI Libraries**: Konva, React-Konva, Lucide React, Motion
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Image Generation**: Kodo AI API
- **LLM**: OpenAI
- **Language**: TypeScript

## 🚀 Running Locally

### Prerequisites

- Node.js 18+ and npm installed
- API keys (see API Setup below)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/realmverse/manga-maker.git
cd manga-maker
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# OpenAI API Key (for contract generation and grading)
OPENAI_API_KEY=your_openai_api_key_here

# Kodo AI API Key (for anime image generation)
KODO_API_KEY=your_kodo_api_key_here
KODO_API_URL=your_kodo_api_url_here
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to play the game!

## 🎨 Kodo AI API

This project uses the **Kodo AI API**, our proprietary anime AI model tech stack for generating high-quality anime-style images.

### 🔑 Requesting API Access

Kodo AI is currently in **beta** and opening soon. To request access:

- **Message us** to request API credentials
- **Follow us on X**: [@kodo_ai](https://x.com/kodo_ai)
- **Subscribe to our Substack**: [kodoai.substack.com](https://substack.com/@kodoai)

We'll be posting API updates and access information on these channels!

## 📝 Project Structure

```
manga-maker/
├── app/
│   ├── api/           # API routes (Kodo, LLM)
│   ├── components/    # React components
│   ├── gameloop/      # Game logic (contracts, grading)
│   ├── genai/         # AI integration
│   └── llm/           # OpenAI integration
├── public/
│   ├── audio/         # Sound effects and music
│   ├── images/        # Game assets
│   ├── speech-bubbles/# Speech bubble SVGs
│   └── vfx/           # Visual effects
└── lib/               # Utility functions
```

## 🎮 How to Play

1. **Start the Game**: Click through the title screen
2. **View Tutorial**: Learn the basics (optional)
3. **Accept a Contract**: Your boss will give you a manga project
4. **Create Your Manga**:
   - Add image panels to the canvas
   - Generate AI images with prompts
   - Add speech bubbles and text
   - Apply VFX effects
5. **Submit for Grading**: See how well you fulfilled the contract!

## 🏆 Hackathon Project

This project was created for Supercell AI hackathon. 

## 📄 License

This project is open source and available for educational and non-commercial use.

## 🔗 Links

- **Repository**: [github.com/realmverse/manga-maker](https://github.com/realmverse/manga-maker)
- **Kodo AI on X**: [@kodo_ai](https://x.com/kodo_ai)
- **Kodo AI Substack**: [kodoai.substack.com](https://substack.com/@kodoai)

---

Made with ❤️ by Realm Studios
