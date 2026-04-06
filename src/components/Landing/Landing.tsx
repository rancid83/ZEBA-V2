'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  FileSearch,
  Link2,
  Shield,
  Sparkles,
  SunMedium,
  Target,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Modal } from 'antd';
import LoginForm from '@/components/Auth/LoginForm';
import SignupForm from '@/components/Auth/SignupForm';
import PresentationSlides from '@/components/Slides/PresentationSlides';
import landingStyles from './LandingStyleA.module.scss';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import {
  landingNavSlideStart,
  type LandingNavSlideSection,
} from './landingData';

const CUSTOM_EASE = [0.22, 1, 0.36, 1] as const;

const slideUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: CUSTOM_EASE },
  },
};

const slideUpFast = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: CUSTOM_EASE },
  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100';

type DiagnosisCard = {
  label: string;
  subtitle: string;
  ratio: number;
  grade: string;
  emphasis: 'low' | 'mid' | 'high';
  metricLabel: string;
  metricSuffix?: string;
  badgeLabel: string;
  gradeLabel: string;
  metaLabel: string;
  metaValue: string;
  detailRows?: Array<{ label: string; value: string }>;
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

export default function Landing() {
  const router = useRouter();
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [area, setArea] = useState('서울');
  const [usage, setUsage] = useState('업무시설');
  const [grossFloorArea, setGrossFloorArea] = useState('12000');
  const [floors, setFloors] = useState('10');
  const [targetGrade, setTargetGrade] = useState('4등급');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [slidesOpen, setSlidesOpen] = useState(false);
  const [slidesSessionId, setSlidesSessionId] = useState(0);
  const [slidesSection, setSlidesSection] = useState<LandingNavSlideSection>('service');

  const openSlides = useCallback((section: LandingNavSlideSection) => {
    setSlidesSection(section);
    setSlidesSessionId((id) => id + 1);
    setSlidesOpen(true);
  }, []);

  useEffect(() => {
    if (!slidesOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [slidesOpen]);

  const safeArea =
    Number.isFinite(Number(grossFloorArea)) && Number(grossFloorArea) > 0
      ? Number(grossFloorArea)
      : 12000;
  const safeFloors =
    Number.isFinite(Number(floors)) && Number(floors) > 0 ? Number(floors) : 10;

  const draftProjectName = `${area}_${usage}_${safeArea}㎡`;

  const summary = useMemo(() => {
    const selfSufficiency = Math.max(
      24,
      Math.min(48, Math.round(30 + safeArea / 1300 - safeFloors * 0.2)),
    );

    const predictedGrade =
      selfSufficiency >= 40
        ? '4등급'
        : selfSufficiency >= 28
          ? '5등급'
          : '등급 미달 우려';

    const production = selfSufficiency >= 40 ? 80.5 : 33.8;
    const demand = selfSufficiency >= 40 ? 120.5 : 129.0;
    const renewableRatio = Math.max(
      12,
      Math.min(28, Math.round(14 + safeArea / 2200 + safeFloors * 0.35)),
    );

    return {
      predictedGrade,
      selfSufficiency,
      production,
      demand,
      renewableRatio,
      guidance:
        selfSufficiency >= 40
          ? '표준모델 기준으로 목표 등급 달성이 가능한 수준입니다. 상세 시나리오 비교는 프로젝트 생성 후 진행됩니다.'
          : '목표 등급 달성을 위해 신재생 설비 또는 액티브 성능에 대한 추가 검토가 필요합니다.',
    };
  }, [safeArea, safeFloors]);

  const diagnosisCards: (DiagnosisCard & { icon: LucideIcon })[] = [
    {
      label: '신재생 의무설치비율',
      icon: SunMedium,
      subtitle: 'Baseline',
      ratio: summary.renewableRatio,
      grade: '기준 충족',
      emphasis: 'low',
      metricLabel: '의무 설치비율',
      metricSuffix: '%',
      badgeLabel: '신재생 기준',
      gradeLabel: '판단 상태',
      metaLabel: '신재생 설비 기준',
      metaValue: '연면적 기준 적용',
    },
    {
      label: 'ZEB 의무 등급',
      icon: Shield,
      subtitle: 'Required',
      ratio: 20.8,
      grade: '5등급',
      emphasis: 'mid',
      metricLabel: '에너지 자립률',
      metricSuffix: '%',
      badgeLabel: 'ZEB 등급',
      gradeLabel: '등급 기준',
      metaLabel: 'ZEB 등급 기준',
      metaValue: '공공 의무 기준',
      detailRows: [
        { label: '1차 에너지 생산량', value: '33.8 kWh/㎡·yr' },
        { label: '1차 에너지 소요량', value: '129.0 kWh/㎡·yr' },
      ],
    },
    {
      label: 'ZEB 목표 등급',
      icon: Target,
      subtitle: 'User Target',
      ratio: summary.selfSufficiency,
      grade: summary.predictedGrade,
      emphasis: 'high',
      metricLabel: '에너지 자립률',
      metricSuffix: '%',
      badgeLabel: 'ZEB 등급',
      gradeLabel: '목표 등급',
      metaLabel: 'ZEB 등급 기준',
      metaValue: '사용자 목표 입력',
      detailRows: [
        { label: '1차 에너지 생산량', value: `${summary.production} kWh/㎡·yr` },
        { label: '1차 에너지 소요량', value: `${summary.demand} kWh/㎡·yr` },
      ],
    },
  ];

  const identityCards = [
    { icon: Shield, title: '설계 판단', body: '초기 판단값을 먼저 고정', color: 'indigo' as const },
    { icon: FileSearch, title: '판단 확장', body: '필요 시 법규 리스크 확장', color: 'violet' as const },
    { icon: Link2, title: '실행 연결', body: '전문가 연계와 내역 전달', color: 'emerald' as const },
  ];

  const flow = [
    '입력값 정규화',
    '기준 모델 생성',
    '법규 교차 판단',
    '시나리오 비교',
    '실행 전환',
  ];

  const serviceLine = [
    '간편 진단',
    '프로젝트 기반 ZEB 예측',
    '법규 사전 검토',
    '전문가 연계',
  ];

  const coreServices = [
    {
      icon: Zap,
      title: '설계 판단',
      body: '초기 입력만으로 핵심 판단값을 빠르게 고정합니다.',
      badge: '핵심 기능',
      color: 'amber' as const,
    },
    {
      icon: BookOpen,
      title: '사전 검토',
      body: '필요 시 신재생, EPI, 기타 법규 검토로 확장할 수 있습니다.',
      badge: '선택 기능',
      color: 'sky' as const,
    },
    {
      icon: Link2,
      title: '실행 지원',
      body: '판단 결과를 실무 전달 구조로 연결해 용역 이행을 돕습니다.',
      badge: '실무 수행',
      color: 'emerald' as const,
    },
  ];

  const expansionNotes = [
    '판단 결과가 프로젝트 맥락으로 남음',
    '법규 검토와 실행 이력이 다음 단계로 전달됨',
    '협업 기록과 파일 축적 구조로 이어짐',
  ];

  const goMain = () => {
    setShowTransitionModal(false);
    router.push('/project-hub');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <LandingHeader
        onLogin={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onSignup={() => {
          setAuthModalMode('signup');
          setAuthModalOpen(true);
        }}
        onOpenSlides={openSlides}
      />

      <div className="mx-auto max-w-[1480px] px-6 pb-6 pt-20 lg:px-10">
        <section id="diagnosis" className="mt-8 grid items-start gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          {/* Hero Left */}
          <motion.div
            id="service"
            variants={slideUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              <Sparkles className="h-3.5 w-3.5" />
              ZEB 설계 판단 플랫폼
            </div>

            <h1 className="mt-5 text-[32px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#0F2044] lg:text-[36px]">
              설계 판단을 먼저 고정하고,
              <br />
              이후에는 <span className="text-teal-600">실행을 연결</span>합니다.
            </h1>

            <p className="mt-5 max-w-[700px] text-[14px] leading-8 text-slate-600">
              ZEBA는 설계 초기의 불확실성을 줄이기 위해 입력값을 구조화하고, 기준 모델을 생성한 뒤,
              핵심 판단값을 먼저 고정하는 플랫폼입니다.
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="mt-8 grid gap-4 md:grid-cols-3"
            >
              {identityCards.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={slideUpFast}
                    whileHover={{ y: -3 }}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                  >
                    <IconContainer color={item.color}>
                      <Icon className="h-5 w-5" />
                    </IconContainer>
                    <div className="mt-4 text-[14px] font-semibold text-slate-800">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-500">{item.body}</div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="mt-8 space-y-8"
            >
              <motion.div
                id="flow"
                variants={slideUp}
                className="rounded-[28px] border border-slate-200 bg-slate-50 p-6"
              >
                <div className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                  SERVICE FLOW
                </div>
                <div className="mt-3 text-[18px] font-semibold tracking-[-0.03em] text-slate-900">
                  판단 엔진의 흐름과 서비스 제공 흐름을 한 번에 보여줍니다.
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  className="mt-5 grid gap-3 md:grid-cols-5"
                >
                  {flow.map((step, idx) => (
                    <motion.div
                      key={step}
                      variants={slideUpFast}
                      className="relative rounded-[20px] border border-slate-200 bg-white px-4 py-4"
                    >
                      <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                        0{idx + 1}
                      </div>
                      <div className="mt-2 text-sm font-medium leading-6 text-slate-700">
                        {step}
                      </div>
                      {idx < flow.length - 1 ? (
                        <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-400 md:block" />
                      ) : null}
                    </motion.div>
                  ))}
                </motion.div>

                <div className="mt-6 rounded-[22px] border border-slate-200 bg-white px-5 py-4">
                  <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">
                    SERVICE LINE
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
                    {serviceLine.map((item, idx) => (
                      <React.Fragment key={item}>
                        <span className="rounded-full bg-slate-100 px-3 py-2">{item}</span>
                        {idx < serviceLine.length - 1 ? (
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        ) : null}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={slideUp}
                className="rounded-[28px] border border-slate-200 bg-slate-50 p-6"
              >
                <div className="text-xs font-medium tracking-[0.22em] text-slate-500">
                  CORE SERVICES · EXPANSION
                </div>
                <div className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-slate-900">
                  현재 제공 기능과 이후 확장 구조를 함께 보여줍니다.
                </div>

                <div className="mt-5 space-y-6">
                  <div>
                    <div className="text-sm font-semibold text-slate-700">현재 제공 기능</div>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: '-40px' }}
                      className="mt-4 grid gap-4 md:grid-cols-3"
                    >
                      {coreServices.map((item) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.title}
                            variants={slideUpFast}
                            whileHover={{ y: -2 }}
                            className="rounded-[24px] border border-slate-200 bg-white p-5"
                          >
                            <IconContainer color={item.color}>
                              <Icon className="h-5 w-5" />
                            </IconContainer>
                            <div className="mt-3 inline-flex rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                              {item.badge}
                            </div>
                            <div className="mt-3 text-[14px] font-semibold text-slate-900">
                              {item.title}
                            </div>
                            <div className="mt-2 text-sm leading-7 text-slate-500">{item.body}</div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <div className="text-sm font-semibold text-slate-700">이후 확장 구조</div>
                    <div className="mt-4 text-sm leading-7 text-slate-500">
                      현재는 설계 판단과 인허가 전 검토에 집중하지만, 판단 결과 저장과 파일 축적 구조는 이후 협업과 실행 전달의 기반이 됩니다.
                    </div>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: '-40px' }}
                      className="mt-5 space-y-3"
                    >
                      {expansionNotes.map((text, idx) => (
                        <motion.div
                          key={`${text}-${idx}`}
                          variants={slideUpFast}
                          className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-4"
                        >
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-700" />
                          <div className="text-sm leading-6 text-slate-600">{text}</div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Hero Right */}
          <motion.div
            variants={slideUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.1 }}
            className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-medium tracking-[0.22em] text-slate-500">
                  QUICK ENTRY
                </div>
                <div className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-slate-900">
                  간편 진단 박스
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQuickModal(true)}
                className="rounded-full bg-[#0F2044] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1a3066]"
              >
                간편 진단
              </motion.button>
            </div>

            <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-4 md:p-5">
              {showResult ? (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid gap-4 md:grid-cols-3"
                >
                  {diagnosisCards.map((item) => {
                    const CardIcon = item.icon;
                    const strong = item.emphasis === 'high';
                    return (
                      <motion.div
                        key={item.label}
                        variants={slideUpFast}
                        whileHover={{ y: -2 }}
                        className={`rounded-[22px] border p-5 ${
                          strong
                            ? 'border-teal-100 bg-teal-50 shadow-sm'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="min-h-[64px]">
                          <div className="flex items-center gap-2">
                            <IconContainer variant={strong ? 'strong' : 'default'}>
                              <CardIcon className="h-4 w-4" />
                            </IconContainer>
                            <div className="text-[14px] font-semibold leading-6 text-slate-800">
                              {item.label}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">{item.subtitle}</div>
                        </div>
                        <div className="mt-3 text-sm text-slate-500">{item.metricLabel}</div>
                        <div
                          className={`mt-6 flex items-end gap-1 text-[30px] font-semibold tracking-[-0.04em] ${
                            strong ? 'text-teal-700' : 'text-slate-700'
                          }`}
                        >
                          <span>{item.ratio}</span>
                          {item.metricSuffix ? (
                            <span className="mb-1 text-[18px] font-semibold">
                              {item.metricSuffix}
                            </span>
                          ) : null}
                        </div>
                        <div
                          className={`mt-6 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            strong
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badgeLabel}
                        </div>
                        <div className="mt-3 text-xs font-medium tracking-[0.16em] text-slate-400">
                          {item.gradeLabel}
                        </div>
                        <div
                          className={`mt-1 text-[20px] font-semibold ${
                            strong ? 'text-teal-700' : 'text-slate-700'
                          }`}
                        >
                          {item.grade}
                        </div>
                        <div className="mt-7 space-y-3 text-sm text-slate-600">
                          <MetricRow label={item.metaLabel} value={item.metaValue} />
                          {item.detailRows?.map((row) => (
                            <MetricRow
                              key={`${item.label}-${row.label}`}
                              label={row.label}
                              value={row.value}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-white text-center">
                  <div>
                    <div className="mx-auto mb-4">
                      <IconContainer size="lg">
                        <BarChart2 className="h-6 w-6" />
                      </IconContainer>
                    </div>
                    <div className="text-sm font-medium text-slate-500">
                      아직 생성된 간편 진단 결과가 없습니다
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      상단의 간편 진단 버튼으로 입력 후 결과를 생성합니다
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showResult ? (
              <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6">
                <div className="text-[14px] font-medium leading-7 text-slate-700">
                  {summary.guidance}
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-500">
                  본 결과는 표준모델 기반 간편 진단입니다. 상세 시나리오 비교 및 저장은 프로젝트 생성 후 가능합니다.
                </div>
                <div className="mt-6 flex flex-nowrap items-center gap-3 overflow-x-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowTransitionModal(true)}
                    className="shrink-0 rounded-full bg-[#0F2044] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1a3066]"
                  >
                    다중 시나리오로 이어서 검토하기
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowQuickModal(true)}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    다시 예측하기
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowResult(false)}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    닫기
                  </motion.button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </section>
      </div>

      <LandingFooter onOpenSlides={openSlides} />

      <Modal
        open={authModalOpen}
        onCancel={() => setAuthModalOpen(false)}
        footer={null}
        width={440}
        centered
        closable
        className={landingStyles.authModal}
        classNames={{ wrapper: landingStyles.authModalWrap }}
        styles={{ body: { padding: 0 } }}
      >
        {authModalMode === 'login' ? (
          <LoginForm embedded onSwitchToSignup={() => setAuthModalMode('signup')} />
        ) : (
          <SignupForm embedded onSwitchToLogin={() => setAuthModalMode('login')} />
        )}
      </Modal>

      <AnimatePresence>
        {showTransitionModal ? (
          <ModalBackdrop onClose={() => setShowTransitionModal(false)}>
            <div className="w-full max-w-[560px] rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-slate-500">
                    PROJECT TRANSITION
                  </div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-slate-900">
                    표준모델 결과를 프로젝트로 이어갑니다
                  </div>
                  <div className="mt-3 text-sm leading-6 text-slate-500">
                    현재 입력값과 간편 진단 결과를 프로젝트 초안으로 전환합니다. 이후 다중 시나리오 비교와 상세 검토가 가능합니다.
                  </div>
                </div>
                <IconButton onClick={() => setShowTransitionModal(false)}>
                  <X className="h-5 w-5" />
                </IconButton>
              </div>

              <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold tracking-[0.14em] text-slate-500">
                  자동 생성 프로젝트명
                </div>
                <div className="mt-2 text-[18px] font-semibold text-slate-800">
                  {draftProjectName}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  '현재 입력값을 프로젝트 초안으로 저장',
                  '표준모델 1안을 기준 시나리오로 승계',
                  '프로젝트 허브에서 다중안 비교 시작',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-700" />
                    <div className="text-sm leading-6 text-slate-600">{item}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTransitionModal(false)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600"
                >
                  닫기
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goMain}
                  className="rounded-full bg-[#0F2044] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1a3066]"
                >
                  프로젝트 생성 후 이동
                </motion.button>
              </div>
            </div>
          </ModalBackdrop>
        ) : null}

        {showQuickModal ? (
          <ModalBackdrop onClose={() => setShowQuickModal(false)}>
            <div className="w-full max-w-[740px] rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[26px] font-semibold tracking-[-0.04em] text-slate-900">
                    간편 진단
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-500">
                    프로젝트 생성 없이, 랜딩 화면에서 바로 핵심 판단값 3개를 확인합니다.
                  </div>
                </div>
                <IconButton onClick={() => setShowQuickModal(false)}>
                  <X className="h-5 w-5" />
                </IconButton>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                <Field label="지역">
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className={inputClassName}
                  >
                    <option>서울</option>
                    <option>경기</option>
                    <option>인천</option>
                    <option>부산</option>
                  </select>
                </Field>
                <Field label="용도">
                  <select
                    value={usage}
                    onChange={(e) => setUsage(e.target.value)}
                    className={inputClassName}
                  >
                    <option>업무시설</option>
                    <option>교육연구시설</option>
                    <option>공동주택</option>
                    <option>판매시설</option>
                  </select>
                </Field>
                <Field label="연면적(㎡)">
                  <input
                    value={grossFloorArea}
                    onChange={(e) => setGrossFloorArea(e.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="층수">
                  <input
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </motion.div>

              <div className="mt-4">
                <Field label="목표 ZEB 등급">
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className={inputClassName}
                  >
                    <option>5등급</option>
                    <option>4등급</option>
                    <option>3등급</option>
                  </select>
                </Field>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.18 }}
                className="mt-4 rounded-[18px] bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm"
              >
                생성 후 결과는 랜딩 화면 내 결과 박스에 출력되며, 유저 계정에는 저장되지 않습니다.
              </motion.div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQuickModal(false)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600"
                >
                  취소
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowQuickModal(false);
                    setShowResult(true);
                  }}
                  className="rounded-full bg-[#0F2044] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1a3066]"
                >
                  예측 시작
                </motion.button>
              </div>
            </div>
          </ModalBackdrop>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {slidesOpen ? (
          <motion.div
            key="landing-slides-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="ZEBA 서비스 소개 슬라이드"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: CUSTOM_EASE }}
            className="fixed inset-0 z-200"
          >
            <PresentationSlides
              key={slidesSessionId}
              variant="overlay"
              initialSlide={landingNavSlideStart[slidesSection]}
              onClose={() => setSlidesOpen(false)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type IconColor = 'teal' | 'indigo' | 'violet' | 'emerald' | 'amber' | 'sky';

const iconColorMap: Record<IconColor, { default: string; strong: string }> = {
  teal: {
    default: 'border-teal-100 bg-gradient-to-br from-teal-50 to-teal-100/60 text-teal-700',
    strong: 'border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100/60 text-teal-700',
  },
  indigo: {
    default: 'border-indigo-100 bg-gradient-to-br from-indigo-50 to-indigo-100/60 text-indigo-700',
    strong: 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100/60 text-indigo-700',
  },
  violet: {
    default: 'border-violet-100 bg-gradient-to-br from-violet-50 to-violet-100/60 text-violet-700',
    strong: 'border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100/60 text-violet-700',
  },
  emerald: {
    default: 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-700',
    strong: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-700',
  },
  amber: {
    default: 'border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-700',
    strong: 'border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-700',
  },
  sky: {
    default: 'border-sky-100 bg-gradient-to-br from-sky-50 to-sky-100/60 text-sky-700',
    strong: 'border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100/60 text-sky-700',
  },
};

function IconContainer({
  children,
  variant = 'default',
  size = 'md',
  color = 'teal',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'strong';
  size?: 'md' | 'lg';
  color?: IconColor;
}) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 rounded-2xl' : 'h-10 w-10 rounded-xl';
  const colorClass = iconColorMap[color][variant];
  return (
    <div
      className={`flex shrink-0 items-center justify-center border ${sizeClass} ${colorClass}`}
    >
      {children}
    </div>
  );
}

function HeaderButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
    >
      {children}
    </motion.button>
  );
}

function ModalBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function IconButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ rotate: 90 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
    >
      {children}
    </motion.button>
  );
}

function Field({ label, children }: FieldProps) {
  return (
    <motion.label variants={slideUpFast} className="block">
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
      {children}
    </motion.label>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
