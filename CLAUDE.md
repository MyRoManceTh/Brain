# LINE Mini App Project

โปรเจคนี้เป็น LINE Mini App ที่ใช้ LIFF SDK และ Next.js

## Agent Instructions

ให้อ่านและใช้ความรู้จากไฟล์ `linemini.md` เป็น reference หลักในการพัฒนา

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **LINE SDK:** @line/liff
- **Styling:** CSS Modules

## Project Structure

```
src/
├── app/           # Pages และ API Routes
├── components/    # React Components
└── lib/
    ├── liff/              # LIFF SDK Wrapper
    └── service-message/   # Service Message API
```

## Commands

```bash
npm run dev      # Development server
npm run build    # Build for production
npm run start    # Start production server
```

## Environment Variables

ต้องตั้งค่าใน `.env.local`:
- `NEXT_PUBLIC_LIFF_ID` - LIFF ID
- `LINE_CHANNEL_ID` - Channel ID
- `LINE_CHANNEL_SECRET` - Channel Secret

## Development Guidelines

1. ใช้ TypeScript เสมอ
2. ใช้ React Hooks จาก `@/lib/liff` สำหรับ LIFF operations
3. ใช้ `LiffProvider` wrap app component
4. Handle error cases ทุกครั้ง
5. ทดสอบทั้งใน LINE App และ External Browser
