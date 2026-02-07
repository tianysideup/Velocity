# Velocity

A React TypeScript monorepo with web and mobile applications.

## Project Structure

- `web/` - Vite + React + TypeScript web application
- `mobile/` - React Native + TypeScript mobile application

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- For mobile development:
  - Android Studio (for Android)
  - Xcode (for iOS, macOS only)

### Installation

```bash
# Install all dependencies
npm install
```

### Running the Applications

#### Web Application

```bash
# Development server
npm run web

# Build for production
npm run web:build
```

#### Mobile Application

```bash
# Start Metro bundler
npm run mobile

# Run on Android
npm run mobile:android

# Run on iOS
npm run mobile:ios
```

## Development

- Web app runs on `http://localhost:5173`
- Mobile app uses Metro bundler for hot reloading

## License

MIT
