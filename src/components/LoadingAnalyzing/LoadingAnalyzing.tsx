'use client';

import styles from './LoadingAnalyzing.module.scss';

interface LoadingAnalyzingProps {
  message?: string;
  subMessage?: string;
  spinnerType?: 'default' | 'pulse' | 'dots';
  isVisible?: boolean;
}

const LoadingAnalyzing = ({
  message = '분석 중입니다...',
  subMessage = '잠시만 기다려주세요',
  spinnerType = 'default',
  isVisible = true,
}: LoadingAnalyzingProps) => {
  if (!isVisible) return null;

  const renderSpinner = () => {
    switch (spinnerType) {
      case 'pulse':
        return <div className={styles.pulseSpinner}></div>;
      case 'dots':
        return (
          <div className={styles.dotsSpinner}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        );
      default:
        return <div className={styles.spinner}></div>;
    }
  };

  return (
    <div className={styles.loadingContainer}>
      {renderSpinner()}
      <div className={styles.loadingText}>{message}</div>
      {subMessage && <div className={styles.loadingSubText}>{subMessage}</div>}
    </div>
  );
};

export default LoadingAnalyzing;
