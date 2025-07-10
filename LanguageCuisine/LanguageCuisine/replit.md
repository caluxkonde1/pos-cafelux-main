# replit.md

## Overview

This is a Point of Sale (POS) system called "Qasir" built as a full-stack web application. It provides comprehensive business management features including sales transactions, inventory management, customer relationship management, and business reporting. The application uses a modern tech stack with React for the frontend, Express.js for the backend, and PostgreSQL with Drizzle ORM for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API architecture

### UI/UX Design
- **Component System**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for Qasir branding
- **Responsive Design**: Mobile-first approach with desktop-optimized layouts
- **Icons**: Lucide React icon library

## Key Components

### Database Schema
The application uses a comprehensive schema defined in `shared/schema.ts`:
- **Users**: Authentication and role-based access (admin, kasir, pemilik)
- **Products**: Inventory management with categories, pricing, and stock tracking
- **Categories**: Product categorization system
- **Customers**: Customer relationship management with purchase history
- **Transactions**: Sales transaction records with line items
- **Transaction Items**: Individual product sales within transactions

### Frontend Pages
- **Dashboard**: Real-time business metrics and overview
- **Penjualan (Sales)**: POS interface and transaction management
- **Produk (Products)**: Inventory management and product catalog
- **Pelanggan (Customers)**: Customer database and relationship management
- **Pegawai (Employees)**: Staff management and role assignment
- **Laporan (Reports)**: Business analytics and reporting

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **API Routes**: RESTful endpoints for all business operations
- **Dashboard Analytics**: Real-time statistics calculation
- **Transaction Processing**: Complete sales workflow management

## Data Flow

### Sales Transaction Flow
1. User selects products through POS interface
2. Shopping cart accumulates selected items
3. Customer information is optionally captured
4. Payment method is selected (cash, card, e-wallet, QRIS)
5. Transaction is processed and stored with audit trail
6. Inventory levels are automatically updated
7. Customer purchase history is updated

### Inventory Management Flow
1. Products are created/updated through admin interface
2. Stock levels are tracked automatically
3. Low stock alerts are generated
4. Categories help organize product catalog
5. Pricing and product information is maintained

### Reporting Data Flow
1. Transaction data is aggregated in real-time
2. Dashboard statistics are calculated on-demand
3. Sales reports can be filtered by date ranges
4. Top-selling products are identified
5. Customer analytics track purchase patterns

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for Neon
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Type-safe CSS variant management

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development Environment
- Vite development server for frontend hot reloading
- Express server with TypeScript compilation via tsx
- In-memory storage implementation for rapid prototyping
- Replit-specific optimizations for cloud development

### Production Build
- Frontend built using Vite with optimized asset bundling
- Backend compiled using esbuild for efficient Node.js deployment
- Database migrations managed through Drizzle Kit
- Environment variables for database and configuration

### Database Management
- PostgreSQL database with Drizzle ORM migrations
- Schema versioning through migration files
- Connection pooling for production environments
- Backup and recovery considerations for business data

## Changelog

- July 05, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.