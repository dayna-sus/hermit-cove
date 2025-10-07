# Hermit Cove - Social Anxiety Recovery App

## Overview

Hermit Cove is a web-based social anxiety recovery application that guides users through a 6-week structured program to overcome social anxiety. The app features a marine-themed interface with a crab mascot that evolves as users progress through daily challenges. Users complete daily suggestions, reflect on their experiences, maintain a journal, and receive AI-powered encouragement throughout their journey.

The application follows a full-stack architecture with React frontend, Express backend, PostgreSQL database using Drizzle ORM, and OpenAI integration for personalized encouragement and sentiment analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library and Tailwind CSS for styling
- **Design System**: Marine-themed color palette with custom CSS variables for light/dark mode support

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with JSON responses for user management, suggestions, reflections, journal entries, and feedback
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development Server**: Vite integration for development with middleware mode and HMR support

### Data Storage Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Design**: 
  - Users table for user profiles and progress tracking
  - Suggestions table for daily challenges organized by week and day
  - User reflections table linking users to completed suggestions with AI responses
  - Journal entries table for free-form user journaling with mood tracking
  - Weekly completions table for milestone celebrations
  - Feedback table for storing user feedback and suggestions submitted via the About the Creator page

### Authentication & Session Management
- **Session Storage**: Simple localStorage-based user ID persistence (no complex authentication required)
- **User Creation**: Single-step user onboarding with name collection

### AI Integration Architecture
- **Service**: OpenAI GPT-5 integration for generating personalized encouragement
- **Response Processing**: Structured JSON responses for message content, sentiment analysis, and encouragement level determination
- **Context Awareness**: AI responses consider user reflection content and challenge difficulty

### Progressive Enhancement Features
- **Visual Progress Tracking**: Animated crab mascot that evolves through different stages based on completion percentage
- **Gamification**: Week-based milestone celebrations with confetti animations
- **Responsive Design**: Mobile-first approach with bottom navigation for mobile devices

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database via `@neondatabase/serverless`
- **ORM**: Drizzle ORM with PostgreSQL dialect for schema management and queries
- **AI Service**: OpenAI API for generating contextual encouragement messages
- **UI Framework**: Radix UI component primitives for accessible UI components

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **CSS Framework**: Tailwind CSS with custom configuration for theme variables
- **Code Quality**: TypeScript for type safety across frontend, backend, and shared schemas

### Third-party Integrations
- **Replit Platform**: Integration with Replit's development environment including cartographer plugin and runtime error modal
- **Font Services**: Google Fonts for typography (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Session Management**: Simple client-side persistence without external authentication providers

The application is designed to be self-contained with minimal external dependencies, focusing on the core user experience of guided social anxiety recovery through structured daily challenges and AI-powered support.