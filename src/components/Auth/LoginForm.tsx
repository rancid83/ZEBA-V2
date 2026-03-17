'use client';

import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import styles from './Auth.module.scss';

type LoginFormProps = {
  embedded?: boolean;
  onSwitchToSignup?: () => void;
};

const LoginForm = ({ embedded, onSwitchToSignup }: LoginFormProps) => {
  const onFinish = () => {
    console.log('로그인 제출 (미연동)');
  };

  return (
    <div className={styles.cardWrap}>
      <div className={styles.brandBar} />
      <div className={styles.brandHeader}>
        <img
          src="/assets/images/zeba_logo.png"
          alt="ZEBA"
          className={styles.brandLogo}
        />
        <p className={styles.brandTagline}>세움터 이전 단계의 설계 판단 플랫폼</p>
      </div>
      <div className={styles.divider} />
      <h1 className={styles.title}>로그인</h1>
      <p className={styles.subtitle}>ZEBA 서비스 이용을 위해 로그인해 주세요.</p>
      <Form
        name="login"
        className={styles.form}
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: '이메일을 입력해 주세요.' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="이메일"
            size="large"
            autoComplete="email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="비밀번호"
            size="large"
            autoComplete="current-password"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className={styles.submitButton}>
            로그인
          </Button>
        </Form.Item>
      </Form>
      <p className={styles.footerLink}>
        아직 계정이 없으신가요?
        {embedded && onSwitchToSignup ? (
          <button type="button" className={styles.footerLinkButton} onClick={onSwitchToSignup}>
            회원가입
          </button>
        ) : (
          <Link href="/signup">회원가입</Link>
        )}
      </p>
    </div>
  );
};

export default LoginForm;
