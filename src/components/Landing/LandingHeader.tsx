'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf } from 'lucide-react';
import type { LandingNavSlideSection } from './landingData';
import { useAuthStatus } from '@/hooks/useAuthStatus';

type LandingHeaderProps = {
  onLogin: () => void;
  onSignup: () => void;
  /** 설정 시 서비스 소개·설계 판단·이용 흐름은 앵커 대신 슬라이드 오버레이로 열립니다. */
  onOpenSlides?: (section: LandingNavSlideSection) => void;
};

export default function LandingHeader({ onLogin, onSignup, onOpenSlides }: LandingHeaderProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { authenticated, logout } = useAuthStatus();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: Array<{
    label: string;
    href: string;
    section: LandingNavSlideSection;
  }> = [
    { label: '서비스 소개', href: '#service', section: 'service' },
    { label: '설계 판단', href: '#diagnosis', section: 'diagnosis' },
    { label: '이용 흐름', href: '#flow', section: 'flow' },
  ];

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-[#0F2044]/90 shadow-lg backdrop-blur-xl'
          : 'bg-[#0F2044]'
      }`}
    >
      <div className="mx-auto flex max-w-[1480px] items-center justify-between px-6 py-3 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-[18px] font-bold tracking-[-0.02em] text-white">ZEBA</span>
          <span className="hidden border-l border-white/20 pl-3 text-[13px] font-medium text-white/50 md:block">
            ZEB 설계 판단 플랫폼
          </span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) =>
            onOpenSlides ? (
              <button
                key={link.label}
                type="button"
                onClick={() => onOpenSlides(link.section)}
                className="rounded-lg px-3 py-2 text-[14px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-[14px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {authenticated ? (
            <>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => router.push('/project-hub')}
                className="rounded-full border border-white/20 px-4 py-2 text-[14px] font-medium text-white/80 transition hover:border-white/40 hover:text-white"
              >
                마이페이지
              </motion.button>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={logout}
                className="rounded-full border border-white/20 px-4 py-2 text-[14px] font-medium text-white/80 transition hover:border-white/40 hover:text-white"
              >
                로그아웃
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onLogin}
                className="rounded-full border border-white/20 px-4 py-2 text-[14px] font-medium text-white/80 transition hover:border-white/40 hover:text-white"
              >
                로그인
              </motion.button>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onSignup}
                className="rounded-full border border-white/20 px-4 py-2 text-[14px] font-medium text-white/80 transition hover:border-white/40 hover:text-white"
              >
                회원가입
              </motion.button>
            </>
          )}
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/project-hub"
              className="inline-block rounded-full bg-teal-500 px-5 py-2 text-[14px] font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400"
            >
              프로젝트 생성
            </Link>
          </motion.div>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="메뉴 열기"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-white/10 bg-[#0F2044]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) =>
                onOpenSlides ? (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      onOpenSlides(link.section);
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </a>
                ),
              )}
              <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
                {authenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        router.push('/project-hub');
                      }}
                      className="rounded-full border border-white/20 py-2.5 text-[14px] font-medium text-white/80"
                    >
                      마이페이지
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        void logout();
                      }}
                      className="rounded-full border border-white/20 py-2.5 text-[14px] font-medium text-white/80"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onLogin();
                      }}
                      className="rounded-full border border-white/20 py-2.5 text-[14px] font-medium text-white/80"
                    >
                      로그인
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onSignup();
                      }}
                      className="rounded-full border border-white/20 py-2.5 text-[14px] font-medium text-white/80"
                    >
                      회원가입
                    </button>
                  </>
                )}
                <Link
                  href="/project-hub"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-teal-500 py-2.5 text-center text-[14px] font-semibold text-white"
                >
                  프로젝트 생성
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
