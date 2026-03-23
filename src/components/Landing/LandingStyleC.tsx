'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
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
import {
  platformCards,
  flow,
  services,
  specRows,
  serviceStructureList,
  collabGridItems,
  collabOutlookItems,
  computeSummary,
  computeBars,
} from './landingData';
import styles from './LandingStyleC.module.scss';
import StyleNav from './StyleNav';

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

export default function LandingStyleC() {
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

  const summary = useMemo(
    () => computeSummary(grossFloorArea, floors),
    [grossFloorArea, floors]
  );
  const bars = computeBars(summary);

  const onMoveMain = () => {
    router.push('/project-hub');
  };

  return (
    <div className={styles.page}>
      <StyleNav />
      <div className={styles.container}>
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
            <Link href="/project-hub" className={styles.headerBtnSecondary}>
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
                {collabGridItems.map(([title, body]) => (
                  <div key={title} className={styles.collabBoxItem}>
                    <div className={styles.collabBoxItemTitle}>{title}</div>
                    <div className={styles.collabBoxItemBody}>{body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sectionGrid}>
          <div className={styles.serviceStructure}>
            <div className={styles.sectionLabel}>SERVICE STRUCTURE</div>
            <div className={styles.sectionTitle}>
              판단에서 실행까지 이어지는 서비스 구조
            </div>
            <div className={styles.serviceList}>
              {serviceStructureList.map(([title, body]) => (
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
              {collabOutlookItems.map((text) => (
                <div key={text} className={styles.collabOutlookItem}>
                  <span className={styles.collabOutlookDot} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

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
