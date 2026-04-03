'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-[#07111f] text-white/60">
      <div className="mx-auto max-w-[1480px] px-6 py-12 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="text-[17px] font-bold tracking-[-0.02em] text-white">ZEBA</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-6 text-white/45">
              세움터 이전 단계의 ZEB 설계 판단 플랫폼으로, 초기 설계의 불확실성을 줄이고 근거 있는
              판단을 빠르게 고정합니다.
            </p>
            <p className="mt-4 text-[13px] text-white/30">
              © {new Date().getFullYear()} ZEBA. All rights reserved.
            </p>
          </div>

          <div>
            <div className="mb-4 text-[12px] font-semibold tracking-[0.18em] text-white/35 uppercase">
              서비스
            </div>
            <ul className="space-y-3">
              {[
                { label: '서비스 소개', href: '#service' },
                { label: '설계 판단', href: '#diagnosis' },
                { label: '이용 흐름', href: '#flow' },
                { label: '프로젝트 생성', href: '/project-hub' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[14px] text-white/50 transition hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-4 text-[12px] font-semibold tracking-[0.18em] text-white/35 uppercase">
              법적 안내
            </div>
            <ul className="space-y-3">
              {[
                { label: '이용약관', href: '/terms' },
                { label: '개인정보처리방침', href: '/privacy' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-white/50 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <div className="mb-1.5 text-[12px] font-semibold tracking-[0.18em] text-white/35 uppercase">
                팀 소개
              </div>
              <p className="text-[13px] leading-6 text-white/40">
                건축·에너지 분야 전문가들이 함께 만드는 설계 판단 인프라입니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[12px] text-white/25">
            본 서비스의 판단 결과는 참고용이며, 법적 효력을 갖지 않습니다.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-[12px] text-white/35 transition hover:text-white/60">
              이용약관
            </Link>
            <Link href="/privacy" className="text-[12px] text-white/35 transition hover:text-white/60">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
