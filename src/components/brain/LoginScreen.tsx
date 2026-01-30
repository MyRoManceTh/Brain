'use client';

import styles from './login.module.css';

interface LoginScreenProps {
  onLogin: () => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function LoginScreen({ onLogin, isLoading, error }: LoginScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Logo/Icon */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🧠</span>
        </div>

        {/* Title */}
        <h1 className={styles.title}>Second Brain</h1>
        <p className={styles.subtitle}>สมองที่ 2 ของคุณ</p>

        {/* Description */}
        <div className={styles.description}>
          <p>บันทึกและจัดการข้อมูลส่วนตัว</p>
          <ul className={styles.features}>
            <li>📝 บันทึกข้อความ</li>
            <li>🖼️ เก็บรูปภาพ</li>
            <li>🔗 บันทึก Links</li>
            <li>✨ สรุปด้วย AI</li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.error}>
            เกิดข้อผิดพลาด: {error.message}
          </div>
        )}

        {/* Login Button */}
        <button
          className={styles.loginButton}
          onClick={onLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.loadingText}>กำลังเข้าสู่ระบบ...</span>
          ) : (
            <>
              <svg
                className={styles.lineIcon}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              <span>เข้าสู่ระบบด้วย LINE</span>
            </>
          )}
        </button>

        {/* Privacy Note */}
        <p className={styles.privacyNote}>
          เราจะเข้าถึงเฉพาะข้อมูลโปรไฟล์พื้นฐานของคุณ
        </p>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Powered by LINE Mini App</p>
      </footer>
    </div>
  );
}
