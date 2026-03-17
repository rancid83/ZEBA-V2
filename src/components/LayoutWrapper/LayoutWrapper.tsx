'use client';

import { useStore } from '@/store';
import LoadingAnalyzing from '@/components/LoadingAnalyzing/LoadingAnalyzing';
import { ConfigProvider } from 'antd';
import { useState, useEffect } from 'react';

const LayoutWrapper = (props: any) => {
  const { isLoading } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 초기 크기 설정
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            horizontalMargin: '0',
            cardPaddingLG: '8px 57px',
          },
          Select: {
            optionSelectedBg: '#007676',
            optionSelectedColor: '#ffffff',
            optionSelectedFontWeight: 400,
          },
          Button: {
            colorBorder: '#007676',
            defaultColor: '#007676',
          },
        },
        token: {
          colorPrimary: '#007676',
          colorInfo: '#007676',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif',
        },
      }}
    >
      <div
        style={
          isMounted
            ? {
                height: `${screenSize.height}px`,
              }
            : {}
        }
      >
        {props.children} {isLoading && <LoadingAnalyzing />}
      </div>
    </ConfigProvider>
  );
};

export default LayoutWrapper;
