'use client';

import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import styles from './Auth.module.scss';
import { useStore } from '@/store';

type LoginFormProps = {
  embedded?: boolean;
  onSwitchToSignup?: () => void;
  onSuccess?: () => void;
};

const LoginForm = ({ embedded, onSwitchToSignup, onSuccess }: LoginFormProps) => {
  const router = useRouter();
  const params = useParams();
  const lang = typeof params?.lang === 'string' ? params.lang : 'ko';
  const setUser = useStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const onFinish = async (values: { email: string; password: string }) => {
    setServerError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.status) {
        setServerError(payload?.error || '로그인에 실패했습니다.');
        return;
      }

      setUser({
        id: payload?.data?.id || payload?.data?.user?.id,
        email: payload?.data?.email || payload?.data?.user?.email || values.email,
        name: payload?.data?.name || payload?.data?.user?.name,
        company_name: payload?.data?.company_name || payload?.data?.user?.company_name,
        write_permission_yn:
          payload?.data?.write_permission_yn || payload?.data?.user?.write_permission_yn,
      });
      if (onSuccess) {
        onSuccess();
        return;
      }

      router.push('/project-hub');
    } catch (error: any) {
      setServerError(error?.message || '로그인 요청 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        embedded
          ? `${styles.cardWrap} ${styles.cardWrapEmbedded}`
          : styles.cardWrap
      }
    >
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
          rules={[
            { required: true, message: '이메일을 입력해 주세요.' },
            { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
          ]}
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
          <Button type="primary" htmlType="submit" className={styles.submitButton} loading={loading}>
            로그인
          </Button>
        </Form.Item>
      </Form>
      {serverError ? <p className={styles.serverError}>{serverError}</p> : null}
      <p className={styles.footerLink}>
        아직 계정이 없으신가요?
        {embedded && onSwitchToSignup ? (
          <button type="button" className={styles.footerLinkButton} onClick={onSwitchToSignup}>
            회원가입
          </button>
        ) : (
          <Link href={`/${lang}/signup`}>회원가입</Link>
        )}
      </p>
    </div>
  );
};

export default LoginForm;
