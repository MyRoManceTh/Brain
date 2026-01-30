# LINE Mini App

LINE Mini App template with LIFF SDK integration built with Next.js and TypeScript.

## Features

- **LIFF SDK Integration** - Full wrapper for LIFF SDK with React hooks
- **Service Message API** - Send notifications to users
- **React Components** - Ready-to-use components (ProfileCard, ShareButton, QRScanner)
- **TypeScript** - Full type safety
- **Next.js 14** - App Router with API routes

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your LINE credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_LIFF_ID` - Your LIFF ID from LINE Developers Console
- `LINE_CHANNEL_ID` - Channel ID for Service Messages
- `LINE_CHANNEL_SECRET` - Channel Secret for Service Messages

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── health/        # Health check endpoint
│   │   ├── reservation/   # Reservation example
│   │   └── service-message/ # Service Message API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/            # React Components
│   ├── LiffProvider.tsx   # LIFF Context Provider
│   ├── ProfileCard.tsx    # User profile display
│   ├── QRScanner.tsx      # QR code scanner
│   └── ShareButton.tsx    # Share message button
└── lib/
    ├── liff/              # LIFF SDK Wrapper
    │   ├── client.ts      # LIFF client class
    │   ├── hooks.ts       # React hooks
    │   └── types.ts       # TypeScript types
    └── service-message/   # Service Message API
        ├── client.ts      # API client
        └── types.ts       # TypeScript types
```

## Usage

### LIFF Provider

Wrap your app with `LiffProvider`:

```tsx
import { LiffProvider } from '@/components';

export default function App() {
  return (
    <LiffProvider liffId="YOUR_LIFF_ID">
      <YourApp />
    </LiffProvider>
  );
}
```

### Use LIFF Context

```tsx
import { useLiffContext } from '@/components';

function MyComponent() {
  const { profile, isLoggedIn, login, logout } = useLiffContext();

  if (!isLoggedIn) {
    return <button onClick={() => login()}>Login</button>;
  }

  return <div>Hello, {profile?.displayName}</div>;
}
```

### Send Messages

```tsx
import { useLiffMessages } from '@/lib/liff';

function MessageButton() {
  const { sendText, shareMessage, sending } = useLiffMessages();

  return (
    <button onClick={() => sendText('Hello!')} disabled={sending}>
      Send Message
    </button>
  );
}
```

### Service Messages (Server-side)

```ts
import { createServiceMessageClient } from '@/lib/service-message';

const client = createServiceMessageClient({
  channelId: 'YOUR_CHANNEL_ID',
  channelSecret: 'YOUR_CHANNEL_SECRET',
});

// Issue notification token
const token = await client.issueNotificationToken(liffAccessToken);

// Send reservation confirmation
await client.sendReservationConfirmation(token.notificationToken, {
  storeName: 'My Restaurant',
  reservationDate: '2024-01-15',
  reservationTime: '18:00',
  numberOfPeople: 4,
});
```

## LINE Developers Console Setup

1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Create a new provider (or select existing)
3. Create a LINE Mini App channel
4. In LIFF settings:
   - Add your LIFF app
   - Set Endpoint URL to your deployed app URL
   - Note the LIFF ID
5. In Basic settings:
   - Note the Channel ID and Channel Secret

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Other Platforms

Build the app:

```bash
npm run build
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/service-message?action=token` | POST | Issue notification token |
| `/api/service-message?action=send` | POST | Send service message |
| `/api/reservation` | POST | Send reservation confirmation |

## Resources

- [LINE Mini App Documentation](https://developers.line.biz/en/docs/line-mini-app/)
- [LIFF API Reference](https://developers.line.biz/en/reference/liff/)
- [Service Message API](https://developers.line.biz/en/docs/line-mini-app/develop/service-messages/)
