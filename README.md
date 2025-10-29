# 🐚 Hermit Cove 🌊

A gentle 6-week journey to help you emerge from your shell and overcome social anxiety, one small step at a time.

![Hermit Cove Banner](https://img.shields.io/badge/Status-Active-success) ![License](https://img.shields.io/badge/License-MIT-blue) ![React](https://img.shields.io/badge/React-18.3.1-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178c6)

## 📖 About

Hermit Cove is a web-based social anxiety recovery application that guides users through a structured 6-week program to overcome social anxiety. The app features a marine-themed interface with an evolving crab mascot that grows as users progress through daily challenges.

### ✨ Key Features

- **📅 Structured 6-Week Program** - 42 carefully designed daily suggestions that gradually expand your comfort zone
- **🦀 Evolving Crab Mascot** - Visual progress tracking with a crab that emerges from its shell as you complete challenges
- **🤖 AI-Powered Encouragement** - Personalized responses using OpenAI GPT-5 with marine-themed metaphors
- **📝 Personal Journal** - Private journaling space to track thoughts, feelings, and progress
- **💭 Reflection System** - Record your experiences after each challenge with AI feedback
- **🎉 Weekly Celebrations** - Milestone celebrations when you complete each week
- **📊 Progress Dashboard** - Beautiful visualization of your journey and achievements
- **🌊 Marine Theme** - Calming ocean-inspired design with wave animations

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for lightweight routing
- **TanStack Query** (React Query) for server state management
- **Radix UI** + **shadcn/ui** for accessible components
- **Tailwind CSS** for styling
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database (Neon serverless)
- **Drizzle ORM** for type-safe database operations
- **OpenAI API** (GPT-5) for AI encouragement
- **Zod** for schema validation

### DevOps
- **Vite** for fast development and building
- **ESBuild** for server bundling
- **Drizzle Kit** for database migrations

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hermit-cove
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   PORT=5000
   ADMIN_TOKEN=your_secure_admin_token
   VITE_GA_MEASUREMENT_ID=your_google_analytics_id (optional)
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5000`

## 🎯 Usage

### For Users

1. **Start Your Journey** - Enter your name on the landing page
2. **Daily Practice** - Complete one gentle suggestion each day
3. **Reflect & Grow** - Share your experience and receive AI encouragement
4. **Track Progress** - Watch your crab mascot emerge as you complete challenges
5. **Journal Freely** - Write in your private journal anytime
6. **Celebrate Milestones** - Enjoy weekly celebrations as you progress

### For Admins

Access the admin dashboard at `/admin` with your admin token to view:
- User statistics
- Reflection analytics
- Journal entry trends
- Weekly completion rates
- User feedback

## 📁 Project Structure

```
hermit-cove/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Route pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/          # Utilities and helpers
│   │   └── hooks/        # Custom React hooks
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database storage layer
│   ├── services/         # External services (OpenAI)
│   └── db.ts            # Database connection
├── shared/               # Shared types and schemas
│   └── schema.ts        # Drizzle database schema
└── package.json
```

## 🗄️ Database Schema

The app uses PostgreSQL with the following main tables:

- **users** - User profiles and progress tracking
- **suggestions** - 42 daily challenge definitions
- **user_reflections** - User reflections with AI responses
- **journal_entries** - Private journal entries
- **weekly_completions** - Week completion milestones
- **feedback** - User feedback submissions

## 🌊 The 6-Week Journey

### Week 1: Building Awareness
Learn to notice your breathing, body sensations, and thought patterns in social situations.

### Week 2: Understanding Your Comfort Zone
Practice small interactions like eye contact, smiling, and brief conversations.

### Week 3: Small Interactions
Build confidence through asking questions, giving compliments, and joining conversations.

### Week 4: Group Settings
Attend group activities, participate in discussions, and connect with multiple people.

### Week 5: Deeper Connections
Share vulnerabilities, express needs, and develop meaningful relationships.

### Week 6: Confidence & Growth
Lead conversations, handle disagreements, and speak in larger group settings.

## 🤖 AI Integration

Hermit Cove uses OpenAI's GPT-5 to provide:
- Personalized encouragement after each reflection
- Sentiment analysis of user experiences
- Marine-themed metaphors and gentle support
- Journal entry encouragement based on mood

The app includes 19 fallback messages to ensure users always receive encouragement, even without an API connection.

## 🎨 Design Philosophy

- **Gentle & Non-Judgmental** - All suggestions are framed as invitations, not demands
- **Marine Theme** - Calming ocean metaphors throughout (waves, shells, tides)
- **Progressive Difficulty** - Challenges gradually increase in complexity
- **Self-Paced** - No pressure to complete daily, skip days when needed
- **Visual Progress** - Evolving crab mascot provides tangible sense of growth

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes
```

### Code Quality

- Full TypeScript coverage for type safety
- Zod schemas for runtime validation
- ESLint and Prettier (recommended for setup)
- Component-driven architecture

## 📊 Analytics

The app includes optional Google Analytics integration to track:
- Page views
- User journey progression
- Feature usage
- Engagement metrics

Set `VITE_GA_MEASUREMENT_ID` in your environment to enable.

## 🔒 Security

- No password authentication required (localStorage-based sessions)
- Admin endpoints protected with token authentication
- Environment variables for sensitive keys
- SQL injection protection via Drizzle ORM
- Input validation with Zod schemas

## 🌐 Deployment

The app is designed to be deployed on platforms like:
- **Replit** (recommended, with auto-deployment)
- Vercel
- Netlify
- Railway
- Heroku

Ensure all environment variables are set in your deployment platform.

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional suggestion content
- UI/UX enhancements
- Accessibility improvements
- Translation support
- Mobile app version

## 📝 License

MIT License - feel free to use this project for personal or educational purposes.

## 💬 Feedback

Users can submit feedback directly through the app at `/about-creator`. All feedback is stored and viewable by admins.

## 🙏 Acknowledgments

- Marine emoji themes for the calming aesthetic
- OpenAI for AI-powered encouragement
- The social anxiety recovery community for inspiration
- shadcn/ui for beautiful, accessible components

## 📧 Contact

For questions, suggestions, or support, please submit feedback through the app or open an issue on GitHub.

---

**Made with 🌊 for those ready to emerge from their shell**

*Remember: Growth happens one wave at a time. You're braver than you know! 🦀*
