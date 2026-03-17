'use client';

import styles from './LoadingZeba.module.scss';

const LoadingZeba = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.logoContainer}>
        <div className={styles.pulseRing}></div>
        <div className={styles.pulseRing2}></div>
        <img
          src="/assets/images/zeba_logo.png"
          alt="Company Logo"
          className={styles.logo}
        />
      </div>

      <h2 className={styles.loadingText}>
        <span className={styles.textAnimation}>시스템 로딩 중</span>
        <span className={styles.dots}></span>
      </h2>

      <p className={styles.subText}>
        잠시만 기다려주세요.
        <br />
        최고의 경험을 위해 준비하고 있습니다.
      </p>

      <div className={styles.spinner}>
        <div className={styles.spinnerInner}></div>
      </div>
    </div>
  );
};

export default LoadingZeba;
