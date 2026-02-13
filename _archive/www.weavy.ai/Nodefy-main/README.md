# Nodefy - AI Workflow Builder

<div align="center">
  <img src="public/screenshots/landing.png" alt="Nodefy Landing Page" width="100%">
</div>

**Nodefy** is a powerful, node-based AI workflow platform that enables users to create, manage, and execute complex AI pipelines using a visual drag-and-drop interface. Built as a modern web application with Next.js 15, it provides an intuitive way to chain AI models together for content generation, image analysis, and more.

## 📸 Screenshots

### Landing Page
![Landing Page](public/screenshots/landing.png)
*Beautiful, responsive landing page with interactive workflow preview*

### Dashboard
![Dashboard](public/screenshots/dashboard.png)
*User workspace showing saved workflows with easy access to create new ones*

---

## 🚀 Features

### Core Functionality
- **Visual Workflow Builder** - Drag-and-drop nodes to create AI pipelines
- **Multiple Node Types**:
  - 📝 **Text Input** - Enter prompts and descriptions
  - 🖼️ **Image Input** - Upload images for analysis
  - 🤖 **LLM Node** - Connect to OpenAI models for processing
- **Real-time Connections** - Connect nodes with animated edges
- **Workflow Persistence** - Save, load, and manage workflows
- **Sample Workflows** - Pre-built templates to get started quickly

### Authentication
- **Google OAuth** - One-click sign in with Google
- **Email/Password** - Traditional credential authentication
- **Secure Sessions** - JWT-based session management

### User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Modern dark UI for reduced eye strain
- **Keyboard Shortcuts** - Delete nodes with Del/Backspace
- **Undo/Redo** - Full history support for workflow changes
- **Export/Import** - Share workflows as JSON files

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.0 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **@xyflow/react** | 12.10.0 | Node-based flow editor |
| **Zustand** | 5.0.9 | State management |
| **Lucide React** | 0.562.0 | Icon library |

### Backend & APIs
| Technology | Version | Purpose |
|------------|---------|---------|
| **NextAuth.js** | 4.24.13 | Authentication |
| **MongoDB** | via Mongoose 9.0.2 | Database |
| **OpenAI SDK** | 6.15.0 | GPT-4o, GPT-4o Mini, GPT-4 Turbo |
| **bcryptjs** | 3.0.3 | Password hashing |
| **Zod** | 4.2.1 | Schema validation |

---

## 📁 Project Structure

```
workflow-builder/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # NextAuth endpoints
│   │   │   ├── openai/         # OpenAI proxy endpoint
│   │   │   └── workflows/      # Workflow CRUD
│   │   ├── dashboard/          # User dashboard
│   │   ├── login/              # Authentication page
│   │   ├── workflow/[id]/      # Workflow editor
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── landing/            # Landing page components
│   │   │   ├── Navbar.tsx
│   │   │   ├── HeroFlow.tsx
│   │   │   ├── StickyModelsSection.tsx
│   │   │   ├── ExploreWorkflows.tsx
│   │   │   └── Footer.tsx
│   │   ├── nodes/              # Workflow node components
│   │   │   ├── TextNode.tsx
│   │   │   ├── ImageNode.tsx
│   │   │   └── LLMNode.tsx
│   │   ├── Canvas.tsx          # React Flow canvas
│   │   └── Sidebar.tsx         # Workflow sidebar
│   ├── lib/
│   │   ├── mongodb.ts          # Database connection
│   │   └── openai.ts           # OpenAI client
│   ├── models/
│   │   └── User.ts             # Mongoose user model
│   ├── store/
│   │   └── workflowStore.ts    # Zustand state store
│   └── types/
│       └── workflow.ts         # TypeScript types
├── public/
│   ├── images/                 # Static images
│   ├── background/             # Background images
│   ├── infinite-scroll/        # Carousel images
│   └── screenshots/            # README screenshots
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project (for OAuth)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nodefy-workflow-builder.git
   cd nodefy-workflow-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nodefy

   # OpenAI API
   OPENAI_API_KEY=your-openai-api-key
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
4. Deploy!

### Environment Variables for Vercel

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | Your Vercel domain (e.g., `https://nodefy.vercel.app`) |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `OPENAI_API_KEY` | From platform.openai.com |

> ⚠️ **Important**: Update Google OAuth redirect URI to include your Vercel domain

---

## 🎯 How to Use

### Creating a Workflow

1. **Sign In** - Use Google or create an account
2. **Create New Workflow** - Click "Create New File" on dashboard
3. **Add Nodes** - Drag nodes from sidebar:
   - **Text** - For prompts and descriptions
   - **Image** - Upload product images
   - **LLM** - AI processing nodes (GPT-4o, GPT-4o Mini, GPT-4 Turbo)
4. **Connect Nodes** - Drag from output handle to input handle
5. **Configure LLM** - Set system prompt and select model
6. **Run** - Click "Run Model" to execute the workflow
7. **Save** - Save workflow for later use

### Sample Workflow

Click "Sample Workflow" to load a pre-configured **Product Listing Generator**:
- Image input with product photo
- Text input with product description
- Analysis LLM for product insights
- Three output LLMs for:
  - Instagram captions
  - SEO meta descriptions
  - Amazon listings

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/[...nextauth]` | NextAuth handlers |
| POST | `/api/openai` | OpenAI LLM proxy |
| GET | `/api/workflows` | List user workflows |
| POST | `/api/workflows` | Create workflow |
| GET | `/api/workflows/[id]` | Get workflow |
| PUT | `/api/workflows/[id]` | Update workflow |
| DELETE | `/api/workflows/[id]` | Delete workflow |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sumit Attri**

Built with ❤️ using Next.js, React, and modern web technologies.

---

<div align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong>
</div>
