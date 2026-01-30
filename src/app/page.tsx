'use client';

import { LiffProvider, ProfileCard, ShareButton, QRScanner } from '@/components';
import styles from './page.module.css';

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || '';

function AppContent() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>LINE Mini App</h1>
          <p className={styles.subtitle}>ยินดีต้อนรับ</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>โปรไฟล์</h2>
          <ProfileCard />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>แชร์</h2>
          <div className={styles.card}>
            <p className={styles.cardText}>
              แชร์แอปนี้ให้เพื่อนของคุณ
            </p>
            <ShareButton
              message="ลองใช้ LINE Mini App นี้สิ!"
              buttonText="แชร์ให้เพื่อน"
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>สแกน QR</h2>
          <div className={styles.card}>
            <QRScanner
              onScan={(value) => {
                console.log('Scanned:', value);
                alert(`สแกนได้: ${value}`);
              }}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>ฟีเจอร์</h2>
          <div className={styles.featureGrid}>
            <FeatureCard
              icon="👤"
              title="โปรไฟล์"
              description="ดึงข้อมูลผู้ใช้จาก LINE"
            />
            <FeatureCard
              icon="💬"
              title="ส่งข้อความ"
              description="ส่งข้อความไปยังแชท"
            />
            <FeatureCard
              icon="📤"
              title="แชร์"
              description="แชร์ให้เพื่อนหรือกลุ่ม"
            />
            <FeatureCard
              icon="📷"
              title="สแกน QR"
              description="สแกน QR Code"
            />
            <FeatureCard
              icon="📍"
              title="ตำแหน่ง"
              description="เข้าถึงตำแหน่งผู้ใช้"
            />
            <FeatureCard
              icon="🔔"
              title="แจ้งเตือน"
              description="ส่ง Service Message"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.featureCard}>
      <span className={styles.featureIcon}>{icon}</span>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

export default function Home() {
  if (!LIFF_ID) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.error}>
            <h1>Configuration Error</h1>
            <p>กรุณาตั้งค่า NEXT_PUBLIC_LIFF_ID ใน .env.local</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <LiffProvider liffId={LIFF_ID}>
      <AppContent />
    </LiffProvider>
  );
}
