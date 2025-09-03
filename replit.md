# Overview

Aethermoor Chronicles is a text-based role-playing game (RPG) built with React, TypeScript, and Express.js. The application features an interactive fantasy adventure where players create characters, explore story paths through interactive fiction, and engage in turn-based combat. The game includes AI-powered dungeon master responses, character progression systems, inventory management, and immersive audio elements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built using React 18 with TypeScript and Vite as the build tool. The application uses a component-based architecture with custom UI components built on Radix UI primitives and styled with Tailwind CSS. Game state is managed through multiple Zustand stores (character, inventory, story engine, AI agents, audio) providing reactive state management across components.

The main game flow consists of three phases: welcome screen, character creation, and game interface. The story system uses Ink.js for interactive fiction parsing, allowing for complex branching narratives with conditional logic.

## Backend Architecture
The server uses Express.js with TypeScript in ES module format. The architecture follows a modular approach with separate route handlers and storage interfaces. Currently implements an in-memory storage system with plans for database integration.

The backend serves as both an API server and static file server, with Vite integration for development hot-reloading. Production builds use esbuild for server bundling and Vite for client bundling.

## Data Storage Solutions
Database configuration uses Drizzle ORM with PostgreSQL dialect, specifically configured for Neon Database serverless. The schema defines user tables with authentication fields. Currently using in-memory storage with a clean interface for future database integration.

Game state persistence is handled through localStorage for client-side save/load functionality, with plans for server-side save synchronization.

## Authentication and Authorization
Basic user schema includes username/password authentication fields. No authentication middleware is currently implemented, suggesting future implementation of session-based or token-based authentication.

## Game Systems Architecture
- **Character System**: Class-based RPG mechanics with six core stats (strength, dexterity, intelligence, constitution, wisdom, charisma), level progression, and experience points
- **Inventory System**: Item management with weapon/armor stats, consumables, and rarity tiers
- **Combat System**: Turn-based combat with AI enemies, damage calculation, and victory/defeat conditions
- **Story Engine**: Ink.js integration for interactive fiction with choice trees and variable tracking
- **AI Agents**: Simulated AI responses for dungeon master commentary and NPC interactions using template-based response systems

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **Build Tools**: Vite with React plugin, TypeScript, esbuild for production builds
- **UI Framework**: Radix UI component primitives, Tailwind CSS for styling

## Database and ORM
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Database Tools**: Drizzle Kit for migrations and schema management

## Game-Specific Libraries
- **Ink.js**: Interactive fiction story parsing and execution
- **Three.js Ecosystem**: @react-three/fiber, @react-three/drei, @react-three/postprocessing for potential 3D graphics
- **Audio Support**: Native Web Audio API integration through custom hooks

## Development Tools
- **TypeScript**: Full type safety across client and server
- **PostCSS**: CSS processing with Autoprefixer
- **GLSL Support**: Shader support via vite-plugin-glsl for advanced graphics
- **Error Handling**: @replit/vite-plugin-runtime-error-modal for development debugging

## Utility Libraries
- **Date Handling**: date-fns for date manipulation
- **Class Management**: clsx and class-variance-authority for conditional styling
- **State Management**: Zustand stores for game state
- **Form Validation**: Zod schemas for type validation
- **Session Management**: connect-pg-simple for future session storage