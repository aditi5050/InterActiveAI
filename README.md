# WaavyAI - AI Workflow Builder

<img width="1470" height="800" alt="Screenshot 2026-02-15 at 1 40 14 AM" src="https://github.com/user-attachments/assets/b4789a29-e8e1-4c1d-9b3e-e543f41e203c" />

**WaavyAI** is a powerful, node-based AI workflow platform that enables users to create, manage, and execute complex AI pipelines using a visual drag-and-drop interface. Built as a modern web application with Next.js 15, it provides an intuitive way to chain AI models together for content generation, image analysis, and more.

<img width="1460" height="792" alt="Screenshot 2026-02-15 at 1 49 20 AM" src="https://github.com/user-attachments/assets/3d300690-fc64-4fd7-ab2b-dea1d7c95a69" />

---

## 🚀 Features

### Core Functionality
- **Visual Workflow Builder** - Drag-and-drop nodes to create AI pipelines
- **Multiple Node Types**:
  - 📝 **Text Input** - Enter prompts and descriptions

  - 🖼️ **Image Input** - Upload images for analysis
  - 🤖 **LLM Node** - Connect to Gemini models for processing, accepts system prompt, user message, and images (supports multiple) as inputs
  - 🖼️ **Upload Video Node** - File upload via Transloadit
  - 🖼️ **Crop Image Node** - Accepts image input, Configurable crop parameters (x%, y%, width%, height & Executes via FFmpeg on Trigger.dev
  - 🖼️  **Extract Frame from Video Node** - Accepts video URL input, Configurable timestamp parameter (seconds or percentage) & Extracts a single frame as image


- **Real-time Connections** - Connect nodes with animated edges
- **Workflow Persistence** - Save, load, and manage workflows
- **Sample Workflows** - Pre-built templates to get started quickly

### Authentication
- **CLERK** - One-click sign in with Google
- **Email/Password** - Traditional credential authentication
- **Secure Sessions** - JWT-based session management

### User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Modern dark UI for reduced eye strain
- **Keyboard Shortcuts** - Delete nodes with Del/Backspace
- **Undo/Redo** - Full history support for workflow changes
- **Export/Import** - Share workflows as JSON files

---
## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js (App Router) | React framework |
| TypeScript | Type safety |
| PostgreSQL | Database |
| Prisma | ORM |
| Clerk | Authentication |
| React Flow | Visual workflow editor |
| Trigger.dev | Node execution |
| Transloadit | File uploads |
| FFmpeg | Media processing |
| Tailwind CSS | Styling |
| Zustand | State management |
| Zod | Validation |
| Gemini API | LLM integration |
| Lucide React | Icons |

---


## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (v18+)
- PostgreSQL database (Supabase / Neon / local)
- npm or pnpm
- Clerk account (for authentication)
- Trigger.dev account
- Google AI Studio (Gemini API key)

### Installation

 **Clone the repository**
   ```bash
   git clone  https://github.com/aditi5050/NamahAI.git
   cd NamahAI
   ```

 **Install dependencies**
   ```bash
   npm install
   ```
**Prisma Setup (VERY IMPORTANT)**

```Add this after install:

### Prisma Setup

Generate Prisma client:

```bash
npx prisma generate
 ``` 

### ⚙️ Set up Environment Variables

Create a `.env.local` file in the project root:

```env
# Database (PostgreSQL / Supabase / Neon)
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
CLERK_TRUST_HOST=true

# Gemini API (Google Generative AI)
GEMINI_API_KEY=your_gemini_api_key

# Trigger.dev
TRIGGER_SECRET_KEY=your_trigger_secret

# Transloadit (File uploads & media processing)
TRANSLOADIT_KEY=your_transloadit_key
TRANSLOADIT_SECRET=your_transloadit_secret
```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🌐 Deployment (Vercel)

### Quick Deploy

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy :-) 

## 🎯 How to Use

### Creating a Workflow

1. **Sign In** - Use Google or create an account
2. **Create New Workflow** - Click "Create New File" on dashboard
3. **Add Nodes** - Drag nodes from sidebar:
   - **Text** - For prompts and descriptions
   - **Image** - Upload product images
   - **LLM** - AI processing nodes 
4. **Connect Nodes** - Drag from output handle to input handle
5. **Configure LLM** - Set system prompt and select model
6. **Run** - Click "Run Model" to execute the workflow
7. **Save** - Save workflow for later use

---

## 👨‍💻 Author

**Aditi**


---
