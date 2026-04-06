# Getting Started with Dash-App

This guide will help you get the dashboard application up and running.

## Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm package manager
- Git (optional, for version control)

## Installation

1. Navigate to the dash-app directory:
```bash
cd dash-app
```

2. Install dependencies:
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm (recommended)
pnpm install
```

## Running the Development Server

Start the development server:

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
dash-app/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── results/            # Verification results endpoint
│   │   │   └── route.ts        # GET /api/results, /api/results?id={id}
│   │   ├── screenshots/        # Screenshots endpoint
│   │   │   └── route.ts        # GET /api/screenshots
│   │   └── logs/               # Logs endpoint
│   │       └── route.ts        # GET /api/logs, /api/logs?file={file}
│   ├── dashboard/              # Dashboard pages
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── lib/                         # Utility functions
│   ├── types.ts                # TypeScript type definitions
│   ├── markdown-parser.ts      # Markdown parsing utilities
│   └── file-utils.ts           # File system utilities
├── components/                  # Reusable components
├── public/                      # Static assets
├── API.md                       # API documentation
├── README.md                    # Project overview
├── GETTING_STARTED.md           # This file
├── test-api.sh                  # API testing script
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── next.config.ts              # Next.js configuration
```

## API Routes

The application provides four main API endpoints:

### 1. Results API

- **List all results**: `GET /api/results`
- **Get specific result**: `GET /api/results?id={resultId}`

Serves verification summary data from `../results/` directory.

### 2. Screenshots API

- **List screenshots**: `GET /api/screenshots`

Lists available screenshots from `../expected/` directory.

### 3. Logs API

- **List log files**: `GET /api/logs`
- **Read log file**: `GET /api/logs?file={filename}&page={page}&limit={limit}`

Provides access to agent logs from `../logs/` directory with pagination support.

## Testing the API

Use the provided test script to verify all API endpoints:

```bash
./test-api.sh
```

Or test manually with curl:

```bash
# List all results
curl http://localhost:3000/api/results | jq '.'

# Get specific result
curl http://localhost:3000/api/results?id=home_completions | jq '.'

# List screenshots
curl http://localhost:3000/api/screenshots | jq '.'

# List log files
curl http://localhost:3000/api/logs | jq '.'

# Read log file
curl "http://localhost:3000/api/logs?file=lightcone_agent_20260405_195655.log&page=1&limit=10" | jq '.'
```

## Development Workflow

### Building for Production

```bash
npm run build
npm start
```

### Type Checking

TypeScript will automatically check types during development. To run type checking manually:

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## API Response Format

All API endpoints return JSON responses in a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error category",
  "message": "Detailed error message"
}
```

## Security Features

The API includes several security features:

1. **Path Traversal Protection**: All file paths are validated
2. **Filename Sanitization**: User inputs are sanitized
3. **File Extension Validation**: Only allowed file types are accessible
4. **Safe Path Checking**: Ensures files are within allowed directories

## Common Issues

### Port Already in Use

If port 3000 is already in use:

```bash
# Run on a different port
PORT=3001 npm run dev
```

### Missing Dependencies

If you encounter module not found errors:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

If you see TypeScript errors:

```bash
# Delete Next.js cache and rebuild
rm -rf .next
npm run dev
```

## Next Steps

1. Read the [API Documentation](./API.md) for detailed endpoint information
2. Explore the [README](./README.md) for project overview
3. Check out the dashboard pages at `/dashboard`
4. Customize the UI components in the `components/` directory

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.
