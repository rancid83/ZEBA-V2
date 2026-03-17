'use client';

import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import styles from './Auth.module.scss';

type SignupFormProps = {
  embedded?: boolean;
  onSwitchToLogin?: () => void;
};

const SignupForm = ({ embedded, onSwitchToLogin }: SignupFormProps) => {
  const onFinish = () => {
    // DB 연동 전이므로 화면만 동작
    console.log('회원가입 제출 (미연동)');
  };

  return (
    <div className={styles.cardWrap}>
      <h1 className={styles.title}>회원가입</h1>
      <p className={styles.subtitle}>ZEBA 서비스를 이용하려면 회원가입을 진행해 주세요.</p>
      <Form
        name="signup"
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
            prefix={<MailOutlined />}
            placeholder="이메일"
            size="large"
            autoComplete="email"
          />
        </Form.Item>
        <Form.Item
          name="name"
          rules={[{ required: true, message: '이름을 입력해 주세요.' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="이름"
            size="large"
            autoComplete="name"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: '비밀번호를 입력해 주세요.' },
            { min: 8, message: '비밀번호는 8자 이상이어야 합니다.' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="비밀번호 (8자 이상)"
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item
          name="passwordConfirm"
          dependencies={['password']}
          rules={[
            { required: true, message: '비밀번호를 다시 입력해 주세요.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="비밀번호 확인"
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className={styles.submitButton}>
            가입하기
          </Button>
        </Form.Item>
      </Form>
      <p className={styles.footerLink}>
        이미 계정이 있으신가요?
        {embedded && onSwitchToLogin ? (
          <button type="button" className={styles.footerLinkButton} onClick={onSwitchToLogin}>
            로그인
          </button>
        ) : (
          <Link href="/login">로그인</Link>
        )}
      </p>
    </div>
  );
};

export default SignupForm;
