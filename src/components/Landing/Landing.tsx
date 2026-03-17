'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SafetyCertificateOutlined,
  FileTextOutlined,
  LinkOutlined,
  BarChartOutlined,
  DownOutlined,
  CloseOutlined,
  ThunderboltOutlined,
  ApartmentOutlined,
  TeamOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Select } from 'antd';
import LoginForm from '@/components/Auth/LoginForm';
import SignupForm from '@/components/Auth/SignupForm';
import styles from './Landing.module.scss';

const platformCards = [
  {
    icon: SafetyCertificateOutlined,
    title: '설계 판단',
    body: '설계 초기 단계에서 ZEB 목표 등급과 법규 리스크를 먼저 판단합니다.',
  },
  {
    icon: FileTextOutlined,
    title: '사전 검토',
    body: 'EPI와 신재생 의무비율을 사후 대응이 아닌 설계 도구로 구조화합니다.',
  },
  {
    icon: LinkOutlined,
    title: '실행 연결',
    body: '판단 이후의 용역 이행은 검증된 전문가 연계와 내역 전달로 이어집니다.',
  },
];

const flow = [
  '사업 개요 입력',
  '표준모델 생성',
  '법규 여유율 확인',
  '설비 조합 비교',
  '컨설턴트 연결',
];

const services = [
  {
    title: 'ZEB 예측',
    body: '랜딩의 간편 예측은 체험형 판단 서비스이고, 프로젝트 기반 예측은 설계 의사결정 서비스입니다.',
    badge: '핵심 기능',
  },
  {
    title: '법규 검토',
    body: 'EPI와 신재생 의무비율을 설계 단계에서 미리 검토해 세움터 이전 판단을 돕습니다.',
    badge: '사전 검토',
  },
  {
    title: '실행 지원',
    body: '전문가 연계와 설계 내역 전달을 통해 판단 이후의 실무 수행이 자연스럽게 이어집니다.',
    badge: '실무 수행',
  },
];

const specRows = [
  {
    category: '패시브',
    items: 4,
    summary: '외피 성능 기준 충족',
    details: ['외벽 열관류율 기준 반영', '창호 성능 기준 반영', '단열 구성 표준화'],
  },
  {
    category: '액티브',
    items: 5,
    summary: '설비 효율 중심 구성',
    details: ['냉난방 효율 기준 반영', '급탕·환기 조건 검토', '설비 효율 보정값 적용'],
  },
  {
    category: '신재생',
    items: 4,
    summary: '태양광 중심 제안',
    details: ['태양광 우선 조합 제안', '목표 등급 기준 자립률 반영', '기본 의무비율 판단 지원'],
  },
];

function InfoCard({
  title,
  items,
  className,
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <div className={`${styles.infoCard} ${className || ''}`}>
      <div className={styles.infoCardTitle}>{title}</div>
      <div className={styles.infoCardList}>
        {items.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>
    </div>
  );
}

function ResultKpi({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={styles.resultKpi}>
      <div className={styles.resultKpiLabel}>{title}</div>
      <div className={accent ? styles.resultKpiValueAccent : styles.resultKpiValue}>
        {value}
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metricRow}>
      <span>{label}</span>
      <span className={styles.metricRowValue}>{value}</span>
    </div>
  );
}

export default function Landing() {
  const router = useRouter();
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showResult, setShowResult] = useState(true);
  const [area, setArea] = useState('서울');
  const [usage, setUsage] = useState('업무시설');
  const [grossFloorArea, setGrossFloorArea] = useState('12000');
  const [floors, setFloors] = useState('10');
  const [targetGrade, setTargetGrade] = useState('4등급');
  const [expandedSpec, setExpandedSpec] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const summary = useMemo(() => {
    const areaNum = Number(grossFloorArea || 12000);
    const floorNum = Number(floors || 10);
    const selfSufficiency = Math.max(
      24,
      Math.min(48, Math.round(30 + areaNum / 1300 - floorNum * 0.2))
    );
    const predictedGrade =
      selfSufficiency >= 40
        ? '4등급'
        : selfSufficiency >= 28
          ? '5등급'
          : '등급 미달 우려';
    const production = selfSufficiency >= 40 ? 80.5 : 33.8;
    const demand = selfSufficiency >= 40 ? 120.5 : 129.0;
    return {
      predictedGrade,
      selfSufficiency,
      production,
      demand,
      stability: selfSufficiency >= 40 ? '달성 가능' : '추가 검토 필요',
      guidance:
        selfSufficiency >= 40
          ? '표준모델 기준으로 목표 등급 달성이 가능한 수준입니다. 상세 시나리오 비교는 프로젝트 생성 후 진행됩니다.'
          : '목표 등급 달성을 위해 신재생 설비 또는 액티브 성능에 대한 추가 검토가 필요합니다.',
    };
  }, [grossFloorArea, floors]);

  const bars = [
    {
      label: '법규 기준',
      subtitle: '지자체 에너지 절약 기준',
      production: 8.1,
      demand: 185.8,
      grade: '-',
      ratio: 4.2,
    },
    {
      label: '의무 등급',
      subtitle: '[STEP-1] 의무 등급',
      production: 33.8,
      demand: 129.0,
      grade: '5등급',
      ratio: 20.8,
    },
    {
      label: '목표 등급',
      subtitle: '[STEP-2] 목표 등급',
      production: summary.production,
      demand: summary.demand,
      grade: summary.predictedGrade,
      ratio: summary.selfSufficiency,
    },
  ];

  const onMoveMain = () => {
    router.push('/main');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLogo}>
            <img src="/assets/zeba-logo.png" alt="ZEBA" className={styles.headerLogoImg} />
            <div className={styles.headerLogoTagline}>세움터 이전 단계의 설계 판단 플랫폼</div>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.headerLinkText}
              onClick={() => {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              }}
            >
              로그인
            </button>
            <button
              type="button"
              className={styles.headerLinkText}
              onClick={() => {
                setAuthModalMode('signup');
                setAuthModalOpen(true);
              }}
            >
              회원가입
            </button>
            <Link href="/main" className={styles.headerBtnSecondary}>
              프로젝트 현황
            </Link>
            <Button
              type="primary"
              className={styles.headerBtnPrimary}
              onClick={() => setShowQuickModal(true)}
            >
              ZEB 간편 예측
            </Button>
          </div>
        </header>

        {/* Hero section: left + right */}
        <section className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <div className={styles.badgeTeal}>
              <ThunderboltOutlined />
              Platform Identity
            </div>
            <h1 className={styles.heroTitle}>
              설계 판단을 안정시키고,
              <br />
              판단 이후에는 <span className={styles.heroTitleAccent}>실행을 연결</span>합니다.
            </h1>
            <p className={styles.heroDesc}>
              ZEBA는 기술을 과시하는 분석 툴이 아니라, 설계자의 판단을 안정시키는 플랫폼입니다.
              리스크를 구조화해서 보여주고, 컨설턴트의 용역 이행 전 단계에서 필요한 의사결정을
              지원하며, 이후에는 전문가 연계와 실무 길잡이로 실행을 완결합니다.
            </p>

            <div className={styles.platformCards}>
              {platformCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={styles.platformCard}>
                    <div className={styles.platformCardIcon}>
                      <Icon />
                    </div>
                    <div className={styles.platformCardTitle}>{item.title}</div>
                    <div className={styles.platformCardBody}>{item.body}</div>
                  </div>
                );
              })}
            </div>

            <div className={styles.flowBox}>
              <div className={styles.flowLabel}>JUDGMENT FLOW</div>
              <div className={styles.flowTitle}>
                감성이 아니라, 설계 판단의 흐름을 보여줍니다.
              </div>
              <div className={styles.flowSteps}>
                {flow.map((step, idx) => (
                  <React.Fragment key={step}>
                    <div className={styles.flowStep}>
                      <div className={styles.flowStepNum}>0{idx + 1}</div>
                      <div className={styles.flowStepText}>{step}</div>
                    </div>
                    {idx < flow.length - 1 && (
                      <div className={styles.flowStepArrow}>→</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.quickEntryHeader}>
              <div>
                <div className={styles.quickEntryLabel}>QUICK ENTRY</div>
                <div className={styles.quickEntryTitle}>ZEB 간편 예측 박스</div>
              </div>
              <Button
                type="primary"
                className={styles.quickEntryBtn}
                onClick={() => setShowQuickModal(true)}
              >
                예측 시작
              </Button>
            </div>
            <p className={styles.quickEntryDesc}>
              랜딩에서 바로 제공되는 체험형 판단 서비스입니다. 프로젝트 생성 전에도 설계 방향과
              등급 가능성을 빠르게 확인할 수 있습니다.
            </p>
            <div className={styles.quickEntryCards}>
              <InfoCard
                title="입력 항목"
                items={['지역', '연면적', '층수', '건물 용도', '목표 ZEB 등급']}
              />
              <InfoCard
                title="출력 방식"
                items={[
                  '단일 분석 결과',
                  '표준모델 기반 판단',
                  '기술 성능 편집 없음',
                  '로그 저장 없음',
                  '프로젝트 전환 CTA',
                ]}
              />
            </div>
            <div className={styles.quickEntryNote}>
              <div className={styles.quickEntryNoteTitle}>
                간편 예측은 ZEBA 전체 구조의 입구입니다.
              </div>
              <div className={styles.quickEntryNoteBody}>
                빠른 판단은 랜딩에서, 시나리오 비교와 저장은 프로젝트 기반 ZEB 예측에서 이어집니다.
              </div>
            </div>
            <div className={styles.collabBox}>
              <div className={styles.collabBoxTitle}>
                <FolderOutlined /> 협업 스페이스 방향성
              </div>
              <div className={styles.collabBoxBody}>
                MVP에서는 설계 및 인허가 수순까지 소비되더라도, 구조적으로는 간소화된 협업 스페이스와
                아카이빙이 내장됩니다. 향후 이 공간은 프로젝트 맥락을 축적해 건설 전 공정을 담당하는
                표준 프로세스 메이커의 기반이 됩니다.
              </div>
              <div className={styles.collabBoxGrid}>
                {[
                  ['현 단계', '설계 · 인허가 중심'],
                  ['잠재 기능', '협업 · 기록 · 전달'],
                  ['장기 방향', '공정 전반 락인 구조'],
                ].map(([title, body]) => (
                  <div key={title} className={styles.collabBoxItem}>
                    <div className={styles.collabBoxItemTitle}>{title}</div>
                    <div className={styles.collabBoxItemBody}>{body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Service structure + Result */}
        <section className={styles.sectionGrid}>
          <div className={styles.serviceStructure}>
            <div className={styles.sectionLabel}>SERVICE STRUCTURE</div>
            <div className={styles.sectionTitle}>
              판단에서 실행까지 이어지는 서비스 구조
            </div>
            <div className={styles.serviceList}>
              {[
                [
                  '01 ZEB 간편 예측',
                  '랜딩에서 빠르게 등급 가능성과 방향성을 확인하는 체험형 판단 서비스',
                ],
                [
                  '02 프로젝트 기반 ZEB 예측',
                  '표준모델 카드 생성, 시나리오 복제, 다중 비교가 가능한 설계 의사결정 서비스',
                ],
                [
                  '03 법규 사전 검토',
                  'EPI와 신재생 의무비율을 설계 단계에서 미리 검토하는 구조',
                ],
                [
                  '04 전문가 연계 및 전달',
                  '판단 이후 용역 이행을 위한 내역 전달과 실무 길잡이 제공',
                ],
              ].map(([title, body]) => (
                <div key={title} className={styles.serviceItem}>
                  <div className={styles.serviceItemTitle}>{title}</div>
                  <div className={styles.serviceItemBody}>{body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.resultPanel}>
            <div className={styles.resultPanelHeader}>
              <div>
                <div className={styles.sectionLabel}>LANDING RESULT</div>
                <div className={styles.sectionTitle}>ZEB 간편 예측 결과 영역</div>
              </div>
              <Button
                className={styles.resultToggleBtn}
                onClick={() => setShowResult((v) => !v)}
              >
                {showResult ? '결과 숨기기' : '결과 보기'}
              </Button>
            </div>

            {!showResult ? (
              <div className={styles.resultPlaceholder}>
                <div className={styles.resultPlaceholderIcon}>
                  <BarChartOutlined />
                </div>
                <div className={styles.resultPlaceholderTitle}>
                  간편 예측 결과 미리보기
                </div>
                <div className={styles.resultPlaceholderDesc}>
                  기존 랜딩 구조 안에서 결과가 박스인으로 출력됩니다.
                </div>
              </div>
            ) : (
              <div className={styles.resultContent}>
                <div className={styles.resultKpis}>
                  <ResultKpi
                    title="예상 ZEB 등급"
                    value={summary.predictedGrade}
                    accent
                  />
                  <ResultKpi
                    title="에너지 자립률"
                    value={`${summary.selfSufficiency}%`}
                  />
                  <ResultKpi title="판단 상태" value={summary.stability} />
                </div>

                <div className={styles.energyChartBox}>
                  <div className={styles.energyChartHeader}>
                    <div className={styles.energyChartTitle}>
                      <BarChartOutlined /> 에너지 생산량 및 소요량
                    </div>
                    <div className={styles.energyChartBadges}>
                      <span className={styles.badge}>1차 에너지 생산량</span>
                      <span className={styles.badgeLight}>1차 에너지 소요량</span>
                    </div>
                  </div>
                  <div className={styles.barsRow}>
                    {bars.map((bar) => (
                      <div key={bar.label} className={styles.barCol}>
                        <div className={styles.barChart}>
                          <div className={styles.barGroup}>
                            <div className={styles.barWrapper}>
                              <span className={styles.barValue}>{bar.production}</span>
                              <div
                                className={styles.barFill}
                                style={{
                                  height: `${Math.max(24, bar.production * 1.45)}px`,
                                }}
                              />
                            </div>
                            <div className={styles.barWrapper}>
                              <span className={styles.barValue}>{bar.demand}</span>
                              <div
                                className={styles.barFillLight}
                                style={{
                                  height: `${Math.max(48, bar.demand * 0.9)}px`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={styles.barSubtitle}>{bar.subtitle}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.barCards}>
                  {bars.map((item) => (
                    <div key={item.label} className={styles.barCard}>
                      <div className={styles.barCardLabel}>{item.label}</div>
                      <div className={styles.barCardSub}>에너지 자립률</div>
                      <div className={styles.barCardRatio}>{item.ratio}%</div>
                      <div className={styles.barCardGradeBadge}>ZEB 등급</div>
                      <div className={styles.barCardGrade}>{item.grade}</div>
                      <div className={styles.barCardMetrics}>
                        <MetricRow
                          label="1차 에너지 생산량"
                          value={`${item.production} kWh/㎡·yr`}
                        />
                        <MetricRow
                          label="1차 에너지 소요량"
                          value={`${item.demand} kWh/㎡·yr`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.specBox}>
                  <div className={styles.specBoxTitle}>
                    <ApartmentOutlined /> 성능 내역 요약
                  </div>
                  <div className={styles.specBoxDesc}>
                    랜딩의 간편 예측에서는 편집 가능한 기술 성능 컴포넌트 없이, 항목군 요약만 제공합니다.
                  </div>
                  <div className={styles.specAccordions}>
                    {specRows.map((row) => {
                      const isOpen = expandedSpec === row.category;
                      return (
                        <div key={row.category} className={styles.specAccordion}>
                          <button
                            type="button"
                            className={styles.specAccordionBtn}
                            onClick={() =>
                              setExpandedSpec(isOpen ? null : row.category)
                            }
                          >
                            <div>
                              <div className={styles.specAccordionTitle}>
                                {row.category}
                              </div>
                              <div className={styles.specAccordionSummary}>
                                {row.summary}
                              </div>
                            </div>
                            <div className={styles.specAccordionMeta}>
                              <span>({row.items} 항목)</span>
                              <DownOutlined
                                className={styles.specChevron}
                                style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
                              />
                            </div>
                          </button>
                          {isOpen && (
                            <div className={styles.specAccordionBody}>
                              {row.details.map((detail) => (
                                <div key={detail}>• {detail}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.guidanceBox}>
                  <div className={styles.guidanceText}>{summary.guidance}</div>
                  <div className={styles.guidanceNote}>
                    본 결과는 표준모델 기반 간편 예측입니다. 상세 시나리오 비교 및 저장은 프로젝트
                    생성 후 가능합니다.
                  </div>
                  <div className={styles.guidanceActions}>
                    <Button
                      type="primary"
                      className={styles.guidanceBtnPrimary}
                      onClick={onMoveMain}
                    >
                      프로젝트 생성 후 이어서 비교하기
                    </Button>
                    <Button
                      className={styles.guidanceBtnSecondary}
                      onClick={() => setShowResult(false)}
                    >
                      결과만 확인하고 닫기
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Core services + Collaboration */}
        <section className={styles.sectionGrid2}>
          <div className={styles.coreServices}>
            <div className={styles.sectionLabel}>CORE SERVICES</div>
            <div className={styles.sectionTitle}>
              MVP에서 보여줄 핵심 기능 구조
            </div>
            <div className={styles.coreCards}>
              {services.map((item) => (
                <div key={item.title} className={styles.coreCard}>
                  <div className={styles.coreCardBadge}>{item.badge}</div>
                  <div className={styles.coreCardTitle}>{item.title}</div>
                  <div className={styles.coreCardBody}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.collabOutlook}>
            <div className={styles.collabOutlookLabel}>
              <TeamOutlined /> COLLABORATION OUTLOOK
            </div>
            <div className={styles.sectionTitle}>표준 프로세스 메이커로의 확장</div>
            <div className={styles.collabOutlookBody}>
              MVP에서는 직접적으로 강조하지 않더라도, ZEBA 내부에는 협업 스페이스와 아카이빙의
              씨앗이 들어 있습니다. 지금은 설계와 인허가 단계에 집중하지만, 장기적으로는 프로젝트
              맥락이 누적되는 락인 구조를 통해 건설 전 공정을 담당하는 표준 프로세스로 확장됩니다.
            </div>
            <div className={styles.collabOutlookList}>
              {[
                '설계 판단 결과가 프로젝트 맥락으로 남음',
                '법규 검토와 실행 이력이 다음 단계로 전달됨',
                '협업 스페이스와 아카이빙이 향후 락인 구조를 형성함',
              ].map((text) => (
                <div key={text} className={styles.collabOutlookItem}>
                  <span className={styles.collabOutlookDot} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 로그인 / 회원가입 Modal */}
      <Modal
        open={authModalOpen}
        onCancel={() => setAuthModalOpen(false)}
        footer={null}
        width={480}
        centered
        closable={true}
        className={styles.authModal}
      >
        <div className={styles.authModalBody}>
          {authModalMode === 'login' ? (
            <LoginForm
              embedded
              onSwitchToSignup={() => setAuthModalMode('signup')}
            />
          ) : (
            <SignupForm
              embedded
              onSwitchToLogin={() => setAuthModalMode('login')}
            />
          )}
        </div>
      </Modal>

      {/* ZEB 간편 예측 Modal */}
      <Modal
        open={showQuickModal}
        onCancel={() => setShowQuickModal(false)}
        footer={null}
        width={740}
        centered
        closable={false}
        className={styles.quickModal}
      >
        <div className={styles.quickModalInner}>
          <div className={styles.quickModalHeader}>
            <div>
              <div className={styles.quickModalTitle}>ZEB 간편 예측</div>
              <div className={styles.quickModalDesc}>
                프로젝트 생성 없이, 랜딩 화면에서 바로 표준모델 기반 단일 분석 결과를 확인합니다.
              </div>
            </div>
            <button
              type="button"
              className={styles.quickModalClose}
              onClick={() => setShowQuickModal(false)}
              aria-label="닫기"
            >
              <CloseOutlined />
            </button>
          </div>

          <div className={styles.quickModalFields}>
            <div className={styles.quickModalField}>
              <label>지역</label>
              <Select
                value={area}
                onChange={setArea}
                options={[
                  { value: '서울', label: '서울' },
                  { value: '경기', label: '경기' },
                  { value: '인천', label: '인천' },
                  { value: '부산', label: '부산' },
                ]}
                className={styles.quickModalInput}
              />
            </div>
            <div className={styles.quickModalField}>
              <label>용도</label>
              <Select
                value={usage}
                onChange={setUsage}
                options={[
                  { value: '업무시설', label: '업무시설' },
                  { value: '교육연구시설', label: '교육연구시설' },
                  { value: '공동주택', label: '공동주택' },
                  { value: '판매시설', label: '판매시설' },
                ]}
                className={styles.quickModalInput}
              />
            </div>
            <div className={styles.quickModalField}>
              <label>연면적(㎡)</label>
              <Input
                value={grossFloorArea}
                onChange={(e) => setGrossFloorArea(e.target.value)}
                className={styles.quickModalInput}
              />
            </div>
            <div className={styles.quickModalField}>
              <label>층수</label>
              <Input
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
                className={styles.quickModalInput}
              />
            </div>
          </div>
          <div className={styles.quickModalFieldFull}>
            <label>목표 ZEB 등급</label>
            <Select
              value={targetGrade}
              onChange={setTargetGrade}
              options={[
                { value: '5등급', label: '5등급' },
                { value: '4등급', label: '4등급' },
                { value: '3등급', label: '3등급' },
              ]}
              className={styles.quickModalInput}
            />
          </div>
          <div className={styles.quickModalNote}>
            생성 후 결과는 랜딩 화면 내 결과 박스에 출력되며, 유저 계정에는 로그 저장되지 않습니다.
          </div>
          <div className={styles.quickModalFooter}>
            <Button
              className={styles.quickModalCancel}
              onClick={() => setShowQuickModal(false)}
            >
              취소
            </Button>
            <Button
              type="primary"
              className={styles.quickModalSubmit}
              onClick={() => {
                setShowQuickModal(false);
                setShowResult(true);
              }}
            >
              예측 시작
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
