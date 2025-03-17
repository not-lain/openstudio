# OpenStudio

A modern web application built with Next.js, TypeScript, and Tailwind CSS. This project provides a studio-like environment for creative work and content management.

## Features

- 🎨 Modern UI components using Radix UI
- 🌙 Dark/Light mode support
- 📱 Responsive design
- 🎯 Type-safe development with TypeScript
- 🎭 Beautiful animations and transitions
- 🎨 Tailwind CSS for styling
- 📦 Component-based architecture

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **Charts:** Recharts
- **Date Handling:** date-fns
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/openstudio.git
cd openstudio
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the production application
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint

## Project Structure

```
openstudio/
├── app/                    # Next.js app directory
│   ├── studio/            # Studio feature
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── public/               # Static assets
└── styles/               # Global styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
