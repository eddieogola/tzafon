# Dashboard App - Project Information

## Overview

A premium Next.js dashboard application with a modern design system, built using TypeScript, Tailwind CSS, and featuring a comprehensive set of UI components.

## Technology Stack

### Core Framework
- **Next.js 15.1.6** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development

### Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS & Autoprefixer** - CSS processing
- **clsx & tailwind-merge** - Dynamic class name utilities

### Icons & Assets
- **Lucide React 0.309** - Beautiful, consistent icon set

### Development Tools
- **ESLint 9** - Code quality and consistency
- **eslint-config-next** - Next.js specific linting rules

## Project Structure

```
dash-app/
├── app/                              # Next.js App Router
│   ├── api/                         # API routes
│   │   ├── logs/                    # Log endpoints
│   │   ├── results/                 # Results endpoints
│   │   └── screenshots/             # Screenshot endpoints
│   ├── dashboard/                   # Dashboard application
│   │   ├── layout.tsx              # Dashboard layout with sidebar
│   │   ├── page.tsx                # Main dashboard page
│   │   ├── analytics/              # Analytics page
│   │   │   └── page.tsx
│   │   ├── users/                  # User management page
│   │   │   └── page.tsx
│   │   ├── reports/                # Reports page
│   │   │   └── page.tsx
│   │   └── settings/               # Settings page
│   │       └── page.tsx
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   └── globals.css                 # Global styles
├── components/                      # React components
│   ├── dashboard/                  # Dashboard-specific
│   │   ├── header.tsx             # Top navigation bar
│   │   ├── sidebar.tsx            # Side navigation menu
│   │   ├── stats-card.tsx         # Statistics card
│   │   └── index.ts               # Component exports
│   ├── ui/                        # Reusable UI components
│   │   ├── badge.tsx              # Badge component
│   │   ├── button.tsx             # Button component
│   │   ├── card.tsx               # Card component
│   │   ├── input.tsx              # Input component
│   │   └── index.ts               # Component exports
│   ├── ScreenshotComparison.tsx   # Screenshot comparison
│   ├── TaskSummaryCard.tsx        # Task summary
│   ├── TaskTimeline.tsx           # Task timeline
│   └── VerificationStatus.tsx     # Verification status
├── hooks/                          # Custom React hooks
│   └── useResults.ts              # Results fetching hook
├── lib/                           # Utility libraries
│   ├── utils.ts                   # General utilities & cn()
│   ├── types.ts                   # TypeScript type definitions
│   ├── file-utils.ts              # File handling utilities
│   ├── markdown-parser.ts         # Markdown parsing
│   └── parseMarkdown.ts           # Additional markdown parsing
├── types/                         # TypeScript type definitions
│   └── index.ts                   # Type exports
├── public/                        # Static assets
├── .env.example                   # Environment template
├── .env.local                     # Local environment
├── .eslintrc.json                # ESLint configuration
├── .gitignore                     # Git ignore rules
├── next.config.ts                # Next.js configuration
├── package.json                   # Dependencies
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── README.md                      # Project overview
├── SETUP.md                       # Setup instructions
└── PROJECT_INFO.md               # This file

## Key Features

### Landing Page
- Modern hero section with gradient text
- Feature highlights with icons
- Call-to-action buttons
- Fully responsive design
- Dark mode support

### Dashboard
- **Main Dashboard**
  - 4 statistics cards (Users, Revenue, Growth, Active Now)
  - Overview chart placeholder
  - Recent activity feed
  - Real-time data display

- **Analytics Page**
  - Traffic sources visualization
  - Page views analytics
  - Chart placeholders for integration

- **Users Page**
  - User list with avatars
  - Edit and delete actions
  - Add new user button
  - User management interface

- **Reports Page**
  - Monthly, quarterly, and annual reports
  - Download functionality
  - Generate report button

- **Settings Page**
  - Profile settings form
  - Notification preferences
  - Email and push notification toggles

### UI Component Library

#### Button Component
- Variants: default, outline, ghost, primary, secondary
- Sizes: default, sm, lg, icon
- Full TypeScript support
- Accessible by default

#### Card Component
- Flexible container component
- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Perfect for dashboard layouts

#### Badge Component
- Variants: default, secondary, success, warning, danger, outline
- Status indicators
- Notification badges

#### Input Component
- Styled form input
- Dark mode support
- Focus states
- Accessible

#### StatsCard Component
- Custom dashboard component
- Displays statistics with icons
- Shows change trends (positive/negative/neutral)
- Highly customizable

### Layout Features

#### Dashboard Layout
- Fixed sidebar navigation
- Sticky header with search
- User actions (notifications, profile)
- Responsive padding and spacing
- Overflow handling

#### Sidebar Navigation
- Dashboard, Analytics, Users, Reports, Settings
- Active state indication
- Icon + text labels
- Smooth transitions
- Dark mode support

#### Header
- Search bar
- Notification bell
- User profile button
- Clean, minimal design

## Design System

### Color Palette
- **Primary**: Blue (600-700 range)
- **Secondary**: Purple (600 range)
- **Success**: Green (600 range, 100/900 for badges)
- **Warning**: Yellow (100/900 for badges)
- **Danger**: Red (100/900 for badges)
- **Neutral**: Slate (50-950 range)

### Typography
- System font stack
- Font weights: medium (500), semibold (600), bold (700)
- Responsive text sizes

### Spacing
- Consistent padding and margin using Tailwind scale
- Gap utilities for flexbox/grid layouts

### Dark Mode
- Automatic dark mode support
- Uses CSS variables
- Prefers-color-scheme detection
- Toggle-able (can be extended)

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

```bash
# Navigate to project
cd /Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26/dash-app

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Available Commands

```bash
pnpm dev      # Start development server (http://localhost:3000)
pnpm build    # Create production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_APP_NAME="Dashboard App"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## Customization Guide

### Adding New Pages

1. Create directory in `app/dashboard/`
2. Add `page.tsx` file
3. Update sidebar navigation in `components/dashboard/sidebar.tsx`

Example:
```typescript
// app/dashboard/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>
}
```

### Creating New Components

1. Add component file in `components/ui/` or `components/dashboard/`
2. Use the `cn()` utility for dynamic classes
3. Export from index file

Example:
```typescript
// components/ui/new-component.tsx
import { cn } from "@/lib/utils";

export function NewComponent({ className, ...props }) {
  return (
    <div className={cn("base-classes", className)} {...props} />
  )
}
```

### Styling Guidelines

- Use Tailwind utility classes
- Leverage the `cn()` helper for conditional classes
- Support dark mode with `dark:` prefix
- Use semantic color names

### TypeScript Types

Add custom types to `lib/types.ts` or `types/index.ts`:

```typescript
export interface CustomType {
  id: string;
  name: string;
}
```

## Integration Notes

### taste-skill Design System

The project is set up to integrate with the taste-skill design system. To add it:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill
```

The current UI components follow modern design patterns and can be extended or replaced with taste-skill components as needed.

### Chart Libraries

For the chart placeholders, consider:
- **Recharts** - React + D3, easy to use
- **Chart.js** - Flexible, popular
- **Victory** - React-native compatible
- **Tremor** - Built for dashboards

### Authentication

Integrate NextAuth.js:
```bash
pnpm add next-auth
```

### Database

Recommended ORMs:
- **Prisma** - Type-safe, modern
- **Drizzle** - Lightweight, fast

### State Management

Consider:
- **Zustand** - Minimal, fast
- **Jotai** - Atomic state
- **React Context** - Built-in

## Performance Optimizations

### Current Optimizations
- Next.js Image optimization ready
- Tree-shaking with ES modules
- CSS purging via Tailwind
- TypeScript for type safety

### Recommended Additions
- Add `next/image` for images
- Implement dynamic imports for code splitting
- Add caching strategies
- Use React Server Components where possible

## Testing Strategy

### Recommended Setup
```bash
# Install testing libraries
pnpm add -D jest @testing-library/react @testing-library/jest-dom
pnpm add -D @testing-library/user-event
```

### Testing Focus Areas
1. UI components in isolation
2. Dashboard page interactions
3. Form submissions
4. Navigation flows
5. Dark mode toggles

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Docker
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Setup
- Set environment variables in hosting platform
- Configure domain and SSL
- Set up CI/CD pipeline

## Troubleshooting

### Common Issues

**Port already in use**
```bash
pnpm dev -- -p 3001
```

**Module not found errors**
```bash
rm -rf node_modules pnpm-lock.yaml .next
pnpm install
```

**TypeScript errors**
```bash
pnpm tsc --noEmit
```

**Build failures**
```bash
# Clear Next.js cache
rm -rf .next
pnpm build
```

## Roadmap

### Phase 1 (Current)
- ✅ Basic dashboard structure
- ✅ UI component library
- ✅ Responsive layouts
- ✅ Dark mode support

### Phase 2 (Next Steps)
- [ ] Authentication integration
- [ ] Real data fetching
- [ ] Chart implementations
- [ ] Form validation

### Phase 3 (Future)
- [ ] Real-time updates
- [ ] Advanced analytics
- [ ] Export functionality
- [ ] Mobile app

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Lucide Icons](https://lucide.dev)

## Contributing

When contributing:
1. Follow the existing code style
2. Use TypeScript for all new code
3. Add prop types and JSDoc comments
4. Test dark mode compatibility
5. Ensure responsive design

## License

This project is part of the larger tzafon/sdk-tests repository.

## Support

For questions or issues:
1. Check SETUP.md for installation help
2. Review this document for architecture
3. Refer to the main project documentation

---

Built with ❤️ using Next.js, React, and TypeScript
