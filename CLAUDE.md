# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev        # Start development server on localhost:8080
npm run build      # Production build
npm run build:dev  # Development mode build
npm run lint       # Run ESLint code 
checking
npm run preview    # Preview production build
npm i              # Install dependencies
```

Note: This project supports both npm and Bun package managers.

## Technology Stack & Architecture

**Core Framework**: React 18 + TypeScript + Vite with SWC
**UI Framework**: shadcn/ui components with Radix UI primitives
**Styling**: Tailwind CSS with custom design system
**Routing**: React Router DOM 6
**State Management**: TanStack React Query 5 + React Hook Form with Zod validation
**Development**: ESLint 9 with flat config, TypeScript 5.8

## Project Structure

```
src/
├── components/ui/     # 55+ shadcn/ui components + custom sections
├── pages/            # Route components (Index.tsx, NotFound.tsx)  
├── hooks/            # Custom React hooks (use-mobile, use-toast)
├── lib/              # Utilities (utils.ts with cn helper)
├── assets/           # Images and static resources
├── main.tsx          # Application entry point
├── App.tsx           # Root component with routing
└── index.css         # Global styles and design system
```

## Component Architecture

**Pattern**: Uses shadcn/ui compound component pattern with Radix UI primitives
**Path Aliases**: `@/*` maps to `./src/*`
**Styling**: HSL-based design tokens in `index.css`, utility-first with Tailwind
**Forms**: React Hook Form + Zod validation pattern
**State**: React Query for server state, custom hooks for local state

## Design System

**Primary Colors**: Orange (#FF6600), Dark Blue
**Component Variants**: Uses `class-variance-authority` for component variations
**Responsive**: Mobile-first approach
**Icons**: Lucide React icon library
**Animations**: Tailwind CSS Animate for transitions

## Key Architectural Notes

**Modern Development**: Built with modern React development practices and tools
**Component Architecture**: Clean component structure following React best practices
**No Backend**: Pure frontend SPA with no API integration currently
**No Testing**: No test framework configured
**Routing**: Simple routing with catch-all 404 handling in App.tsx

## Development Workflow

1. Run `npm run dev` to start development server on port 8080
2. Components follow shadcn/ui patterns - check existing components for consistency
3. Use TypeScript interfaces for component props (relaxed TS config)
4. Custom sections for landing page are in `components/ui/` (hero-section, benefits-section, etc.)
5. Toast notifications use custom system + Sonner library
6. Always run `npm run lint` before committing changes

## Business Context

Immigration services platform for Brazilian families moving to the United States. Focus on educational content, community features, and subscription-based services.