# Dashboard App Setup Guide

This guide will help you set up and run the Dashboard App on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)

To install pnpm if you haven't already:

```bash
npm install -g pnpm
```

## Installation Steps

### 1. Navigate to the Project Directory

```bash
cd /Users/eddieogola/dev/job/tzafon/sdk-tests/lightcone/dashboard/cua/wk_30_03_26/dash-app
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies including:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Lucide React (for icons)
- clsx & tailwind-merge (for utility functions)

### 3. Install taste-skill Design System (Optional)

The taste-skill design system can be added to enhance the UI components:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill
```

Note: If the taste-skill repository is not accessible or you encounter issues, the project is already set up with a comprehensive set of UI components that follow modern design patterns.

### 4. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` if needed with your specific configuration.

### 5. Run the Development Server

```bash
pnpm dev
```

The application will start on [http://localhost:3000](http://localhost:3000).

## Project Structure Overview

```
dash-app/
├── app/                           # Next.js App Router
│   ├── dashboard/                # Dashboard pages
│   │   ├── layout.tsx           # Dashboard layout
│   │   ├── page.tsx             # Main dashboard
│   │   ├── analytics/           # Analytics page
│   │   ├── users/               # Users page
│   │   ├── reports/             # Reports page
│   │   └── settings/            # Settings page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/                   # Reusable components
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── header.tsx          # Dashboard header
│   │   ├── sidebar.tsx         # Dashboard sidebar
│   │   └── stats-card.tsx      # Statistics card component
│   └── ui/                      # UI components
│       ├── badge.tsx           # Badge component
│       ├── button.tsx          # Button component
│       ├── card.tsx            # Card component
│       └── input.tsx           # Input component
├── lib/                         # Utility functions
│   └── utils.ts                # Helper utilities
└── public/                      # Static assets

## Features

### Landing Page
- Modern, gradient hero section
- Feature highlights
- Call-to-action buttons
- Responsive design

### Dashboard
- **Main Dashboard**: Overview with statistics cards and activity feed
- **Analytics**: Detailed analytics and insights
- **Users**: User management interface
- **Reports**: Report generation and download
- **Settings**: Account and notification settings

### UI Components
- **Button**: Multiple variants (default, outline, ghost, primary, secondary)
- **Card**: Flexible card component with header, content, and footer
- **Badge**: Status indicators with multiple variants
- **Input**: Styled form input
- **Stats Card**: Dashboard statistics with icons and trends

### Design Features
- Dark mode support
- Responsive layout
- Premium design system
- Lucide React icons
- Tailwind CSS utilities
- TypeScript type safety

## Available Scripts

```bash
# Development
pnpm dev          # Start development server

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
```

## Customization

### Tailwind Configuration

Edit `tailwind.config.ts` to customize:
- Colors
- Fonts
- Spacing
- Breakpoints

### Component Styling

All components use Tailwind CSS and support dark mode. Customize by:
1. Modifying the component files in `components/`
2. Updating global styles in `app/globals.css`

### Adding New Pages

1. Create a new directory in `app/dashboard/`
2. Add a `page.tsx` file
3. The route will be automatically available

### Environment Variables

Access environment variables:
```typescript
const appName = process.env.NEXT_PUBLIC_APP_NAME;
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
pnpm dev -- -p 3001
```

### Dependency Issues

If you encounter dependency issues:

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Errors

For TypeScript errors:

```bash
# Check TypeScript configuration
pnpm tsc --noEmit
```

## Next Steps

1. **Authentication**: Add NextAuth.js for user authentication
2. **Database**: Integrate Prisma or your preferred ORM
3. **API Routes**: Create API endpoints in `app/api/`
4. **Charts**: Add charting library (e.g., Recharts, Chart.js)
5. **Testing**: Set up Jest and React Testing Library
6. **CI/CD**: Configure GitHub Actions or similar

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Lucide Icons](https://lucide.dev)

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
