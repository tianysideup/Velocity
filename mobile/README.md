# Velocity Mobile App

React Native mobile application for Velocity car rental service built with Expo.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo Go app installed on your mobile device
  - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on your device:**
   - Scan the QR code with Expo Go app (Android)
   - Scan with Camera app and tap the notification (iOS)

## Available Commands

- `npm start` - Start the Expo development server
- `npm run android` - Start on Android emulator/device
- `npm run ios` - Start on iOS simulator/device
- `npm run web` - Start in web browser

## Features

✅ **Authentication**
- User registration with email/password
- Login functionality
- Firebase authentication integration
- Persistent login sessions

🚗 **Coming Soon**
- Vehicle browsing and rental
- Testimonial submission
- Contact form
- User profile management

## Project Structure

```
mobile/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── navigation/
│   │   ├── AppNavigator.tsx     # Navigation setup
│   │   └── types.ts             # Navigation types
│   └── screens/
│       ├── LoginScreen.tsx      # Login screen
│       ├── RegisterScreen.tsx   # Registration screen
│       └── HomeScreen.tsx       # Home screen
├── App.tsx                      # Main app component
└── package.json                 # Dependencies
```

## Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
- **Firebase** - Authentication & backend
- **AsyncStorage** - Local data persistence

## Design

The mobile app follows the same design language as the web application:
- Dark theme (#030303 background)
- Orange accent color (#fb6b28)
- Modern card-based UI
- Responsive layouts

## Testing on Expo Go

1. Make sure your mobile device and computer are on the same network
2. Open Expo Go app on your device
3. Scan the QR code from the terminal
4. The app will load and you can test login/registration

## Troubleshooting

**QR code not scanning:**
- Ensure both devices are on the same WiFi network
- Try typing the URL manually in Expo Go

**Firebase errors:**
- Verify firebase.ts has correct configuration
- Check internet connection

**Build errors:**
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Next Steps

To continue development:
1. Add vehicle listing screens
2. Implement rental booking flow
3. Add testimonial submission
4. Create contact form
5. Add user profile management
