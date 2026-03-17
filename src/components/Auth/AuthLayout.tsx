'use client';

import { Layout } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import styles from './Auth.module.scss';

const { Content } = Layout;

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout className={styles.wrapper}>
      <Content>
        <div className={styles.container}>
          <div className={styles.header}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeftOutlined />
              홈으로
            </Link>
            <div className="logoContainer landingLogo">
              <img
                src="/assets/images/zeba_logo.png"
                alt="ZEBA"
                className="logoImage"
              />
            </div>
            <div style={{ width: 72 }} />
          </div>
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
