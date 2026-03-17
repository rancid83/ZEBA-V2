import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  ChevronDown,
  FileText,
  FolderKanban,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ZEBAHomepagePreview() {
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showResult, setShowResult] = useState(true);
  const [area, setArea] = useState("서울");
  const [usage, setUsage] = useState("업무시설");
  const [grossFloorArea, setGrossFloorArea] = useState("12000");
  const [floors, setFloors] = useState("10");
  const [targetGrade, setTargetGrade] = useState("4등급");
  const [expandedSpec, setExpandedSpec] = useState<string | null>(null);

  const summary = useMemo(() => {
    const areaNum = Number(grossFloorArea || 12000);
    const floorNum = Number(floors || 10);

    const selfSufficiency = Math.max(
      24,
      Math.min(48, Math.round(30 + areaNum / 1300 - floorNum * 0.2))
    );
    const predictedGrade =
      selfSufficiency >= 40 ? "4등급" : selfSufficiency >= 28 ? "5등급" : "등급 미달 우려";
    const production = selfSufficiency >= 40 ? 80.5 : 33.8;
    const demand = selfSufficiency >= 40 ? 120.5 : 129.0;

    return {
      predictedGrade,
      selfSufficiency,
      production,
      demand,
      stability: selfSufficiency >= 40 ? "달성 가능" : "추가 검토 필요",
      guidance:
        selfSufficiency >= 40
          ? "표준모델 기준으로 목표 등급 달성이 가능한 수준입니다. 상세 시나리오 비교는 프로젝트 생성 후 진행됩니다."
          : "목표 등급 달성을 위해 신재생 설비 또는 액티브 성능에 대한 추가 검토가 필요합니다.",
    };
  }, [grossFloorArea, floors]);

  const bars = [
    {
      label: "법규 기준",
      subtitle: "지자체 에너지 절약 기준",
      production: 8.1,
      demand: 185.8,
      grade: "-",
      ratio: 4.2,
    },
    {
      label: "의무 등급",
      subtitle: "[STEP-1] 의무 등급",
      production: 33.8,
      demand: 129.0,
      grade: "5등급",
      ratio: 20.8,
    },
    {
      label: "목표 등급",
      subtitle: "[STEP-2] 목표 등급",
      production: summary.production,
      demand: summary.demand,
      grade: summary.predictedGrade,
      ratio: summary.selfSufficiency,
    },
  ];

  const platformCards = [
    {
      icon: ShieldCheck,
      title: "설계 판단",
      body: "설계 초기 단계에서 ZEB 목표 등급과 법규 리스크를 먼저 판단합니다.",
    },
    {
      icon: FileText,
      title: "사전 검토",
      body: "EPI와 신재생 의무비율을 사후 대응이 아닌 설계 도구로 구조화합니다.",
    },
    {
      icon: Briefcase,
      title: "실행 연결",
      body: "판단 이후의 용역 이행은 검증된 전문가 연계와 내역 전달로 이어집니다.",
    },
  ];

  const flow = [
    "사업 개요 입력",
    "표준모델 생성",
    "법규 여유율 확인",
    "설비 조합 비교",
    "컨설턴트 연결",
  ];

  const services = [
    {
      title: "ZEB 예측",
      body: "랜딩의 간편 예측은 체험형 판단 서비스이고, 프로젝트 기반 예측은 설계 의사결정 서비스입니다.",
      badge: "핵심 기능",
    },
    {
      title: "법규 검토",
      body: "EPI와 신재생 의무비율을 설계 단계에서 미리 검토해 세움터 이전 판단을 돕습니다.",
      badge: "사전 검토",
    },
    {
      title: "실행 지원",
      body: "전문가 연계와 설계 내역 전달을 통해 판단 이후의 실무 수행이 자연스럽게 이어집니다.",
      badge: "실무 수행",
    },
  ];

  const specRows = [
    {
      category: "패시브",
      items: 4,
      summary: "외피 성능 기준 충족",
      details: ["외벽 열관류율 기준 반영", "창호 성능 기준 반영", "단열 구성 표준화"],
    },
    {
      category: "액티브",
      items: 5,
      summary: "설비 효율 중심 구성",
      details: ["냉난방 효율 기준 반영", "급탕·환기 조건 검토", "설비 효율 보정값 적용"],
    },
    {
      category: "신재생",
      items: 4,
      summary: "태양광 중심 제안",
      details: ["태양광 우선 조합 제안", "목표 등급 기준 자립률 반영", "기본 의무비율 판단 지원"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#1b1f24]">
      <div className="mx-auto max-w-[1480px] px-6 py-6 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 flex items-center justify-between rounded-[28px] border border-[#dbe1e8] bg-white px-6 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm"
        >
          <div>
            <div className="text-xs font-semibold tracking-[0.24em] text-[#0c7f87]">ZEBA MVP LANDING</div>
            <div className="mt-1 text-[26px] font-semibold tracking-[-0.03em]">
              세움터 이전 단계의 설계 판단 플랫폼
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full border border-[#d6dde4] px-4 py-2 text-sm font-medium text-[#4c5561]"
            >
              프로젝트 현황
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowQuickModal(true)}
              className="rounded-full bg-[#07111f] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(7,17,31,0.14)]"
            >
              ZEB 간편 예측
            </motion.button>
          </div>
        </motion.header>

        <section className="mt-8 grid items-stretch gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.45 }}
            className="rounded-[32px] border border-[#dbe1e8] bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d6edef] bg-[#eef8f8] px-3 py-1 text-xs font-medium text-[#0c7f87]">
              <Sparkles className="h-3.5 w-3.5" />
              Platform Identity
            </div>
            <h1 className="mt-5 text-[46px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#12171c]">
              설계 판단을 안정시키고,
              <br />
              판단 이후에는 <span className="text-[#0c7f87]">실행을 연결</span>합니다.
            </h1>
            <p className="mt-5 max-w-[720px] text-[16px] leading-8 text-[#5d6672]">
              ZEBA는 기술을 과시하는 분석 툴이 아니라, 설계자의 판단을 안정시키는 플랫폼입니다.
              리스크를 구조화해서 보여주고, 컨설턴트의 용역 이행 전 단계에서 필요한 의사결정을
              지원하며, 이후에는 전문가 연계와 실무 길잡이로 실행을 완결합니다.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {platformCards.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: 0.08 * idx + 0.15 }}
                    whileHover={{ y: -4 }}
                    className="rounded-[24px] border border-[#e5eaf0] bg-[#fafbfc] p-5 shadow-[0_6px_14px_rgba(15,23,42,0.03)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef8f8] text-[#0c7f87]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-[16px] font-semibold text-[#1c2229]">{item.title}</div>
                    <div className="mt-2 text-sm leading-6 text-[#69737f]">{item.body}</div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-8 rounded-[28px] border border-[#e1e7ed] bg-[#fcfcfd] p-6"
            >
              <div className="text-xs font-semibold tracking-[0.2em] text-[#7d8793]">JUDGMENT FLOW</div>
              <div className="mt-3 text-[22px] font-semibold tracking-[-0.03em]">
                감성이 아니라, 설계 판단의 흐름을 보여줍니다.
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-5">
                {flow.map((step, idx) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.42 + idx * 0.05 }}
                    className="relative rounded-[20px] border border-[#e5ebf1] bg-white px-4 py-4"
                  >
                    <div className="text-[11px] font-semibold tracking-[0.18em] text-[#8b95a1]">0{idx + 1}</div>
                    <div className="mt-2 text-sm font-medium leading-6 text-[#27303a]">{step}</div>
                    {idx < flow.length - 1 && (
                      <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-[#9ba6b2] md:block" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.45, delay: 0.12 }}
            className="rounded-[32px] border border-[#dbe1e8] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium tracking-[0.22em] text-[#7d8793]">QUICK ENTRY</div>
                <div className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">ZEB 간편 예측 박스</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQuickModal(true)}
                className="rounded-full bg-[#07111f] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(7,17,31,0.14)]"
              >
                예측 시작
              </motion.button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#67717d]">
              랜딩에서 바로 제공되는 체험형 판단 서비스입니다. 프로젝트 생성 전에도 설계 방향과
              등급 가능성을 빠르게 확인할 수 있습니다.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard title="입력 항목" items={["지역", "연면적", "층수", "건물 용도", "목표 ZEB 등급"]} />
              <InfoCard
                title="출력 방식"
                items={[
                  "단일 분석 결과",
                  "표준모델 기반 판단",
                  "기술 성능 편집 없음",
                  "로그 저장 없음",
                  "프로젝트 전환 CTA",
                ]}
              />
            </div>

            <div className="mt-5 rounded-[24px] border border-[#dce2e7] bg-[#f7fafb] p-5">
              <div className="text-sm font-medium text-[#51606c]">간편 예측은 ZEBA 전체 구조의 입구입니다.</div>
              <div className="mt-2 text-sm leading-6 text-[#73808c]">
                빠른 판단은 랜딩에서, 시나리오 비교와 저장은 프로젝트 기반 ZEB 예측에서 이어집니다.
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#dfe5eb] bg-white p-5 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2 text-[17px] font-semibold text-[#313943]">
                <FolderKanban className="h-5 w-5 text-[#62707c]" />
                협업 스페이스 방향성
              </div>
              <div className="mt-3 text-sm leading-7 text-[#6c7682]">
                MVP에서는 설계 및 인허가 수순까지 소비되더라도, 구조적으로는 간소화된 협업 스페이스와
                아카이빙이 내장됩니다. 향후 이 공간은 프로젝트 맥락을 축적해 건설 전 공정을 담당하는
                표준 프로세스 메이커의 기반이 됩니다.
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  ["현 단계", "설계 · 인허가 중심"],
                  ["잠재 기능", "협업 · 기록 · 전달"],
                  ["장기 방향", "공정 전반 락인 구조"],
                ].map(([title, body], idx) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.2 + idx * 0.06 }}
                    className="rounded-[18px] border border-[#e5eaf0] bg-[#fbfcfd] p-4"
                  >
                    <div className="text-sm font-semibold text-[#2d353e]">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-[#717b87]">{body}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.45, delay: 0.15 }}
            className="rounded-[32px] border border-[#dbe1e8] bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="text-xs font-medium tracking-[0.22em] text-[#7d8793]">SERVICE STRUCTURE</div>
            <div className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">판단에서 실행까지 이어지는 서비스 구조</div>
            <div className="mt-5 space-y-4">
              {[
                ["01 ZEB 간편 예측", "랜딩에서 빠르게 등급 가능성과 방향성을 확인하는 체험형 판단 서비스"],
                ["02 프로젝트 기반 ZEB 예측", "표준모델 카드 생성, 시나리오 복제, 다중 비교가 가능한 설계 의사결정 서비스"],
                ["03 법규 사전 검토", "EPI와 신재생 의무비율을 설계 단계에서 미리 검토하는 구조"],
                ["04 전문가 연계 및 전달", "판단 이후 용역 이행을 위한 내역 전달과 실무 길잡이 제공"],
              ].map(([title, body], idx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28, delay: 0.18 + idx * 0.08 }}
                  className="rounded-[22px] border border-[#e3e8ee] bg-[#fbfcfd] p-5"
                >
                  <div className="text-[15px] font-semibold text-[#25303a]">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-[#69737f]">{body}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.45, delay: 0.22 }}
            className="rounded-[32px] border border-[#dbe1e8] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium tracking-[0.22em] text-[#7d8793]">LANDING RESULT</div>
                <div className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">ZEB 간편 예측 결과 영역</div>
              </div>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowResult((v) => !v)}
                className="rounded-full border border-[#d6dde4] px-4 py-2 text-sm font-medium text-[#4b5662]"
              >
                {showResult ? "결과 숨기기" : "결과 보기"}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div
                  key="result-placeholder"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="mt-6 flex h-[640px] items-center justify-center rounded-[28px] border border-dashed border-[#d8dde4] bg-[#fafbfc] text-center"
                >
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef8f8] text-[#0c7f87]">
                      <BarChart3 className="h-7 w-7" />
                    </div>
                    <div className="mt-4 text-lg font-semibold">간편 예측 결과 미리보기</div>
                    <div className="mt-2 text-sm leading-6 text-[#6a7480]">
                      기존 랜딩 구조 안에서 결과가 박스인으로 출력됩니다.
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result-content"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-6 rounded-[28px] border border-[#dde2e8] bg-[#fcfcfd] p-5"
                >
                  <motion.div variants={staggerContainer} className="grid gap-4 md:grid-cols-3">
                    <ResultKpi title="예상 ZEB 등급" value={summary.predictedGrade} accent delay={0} />
                    <ResultKpi title="에너지 자립률" value={`${summary.selfSufficiency}%`} delay={1} />
                    <ResultKpi title="판단 상태" value={summary.stability} delay={2} />
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    transition={{ duration: 0.35, delay: 0.18 }}
                    className="mt-5 rounded-[24px] border border-[#dde2e8] bg-white p-5 shadow-[0_6px_16px_rgba(15,23,42,0.04)]"
                  >
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[18px] font-semibold text-[#353c44]">
                        <BarChart3 className="h-5 w-5 text-[#5d6672]" />
                        에너지 생산량 및 소요량
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge>1차 에너지 생산량</Badge>
                        <Badge light>1차 에너지 소요량</Badge>
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-[#edf1f4] bg-[#fbfcfd] px-4 py-5">
                      <div className="grid grid-cols-3 gap-4">
                        {bars.map((bar, idx) => (
                          <div key={bar.label} className="text-center">
                            <div className="mx-auto flex h-[240px] w-full max-w-[220px] items-end justify-center gap-4 rounded-[18px] border border-[#f0f3f6] bg-white px-4 py-4">
                              <div className="flex w-16 flex-col items-center justify-end">
                                <div className="mb-2 text-xs font-semibold text-[#15191f]">{bar.production}</div>
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: Math.max(24, bar.production * 1.45) }}
                                  transition={{ duration: 0.55, delay: 0.25 + idx * 0.08, ease: "easeOut" }}
                                  className="w-full rounded-t-[10px] bg-[#4eb8c0]"
                                />
                              </div>
                              <div className="flex w-16 flex-col items-center justify-end">
                                <div className="mb-2 text-xs font-semibold text-[#15191f]">{bar.demand}</div>
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: Math.max(48, bar.demand * 0.9) }}
                                  transition={{ duration: 0.65, delay: 0.3 + idx * 0.08, ease: "easeOut" }}
                                  className="w-full rounded-t-[10px] bg-[#cfeef2]"
                                />
                              </div>
                            </div>
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25, delay: 0.45 + idx * 0.06 }}
                              className="mt-3 text-[15px] font-medium text-[#4b545f]"
                            >
                              {bar.subtitle}
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={staggerContainer}
                    transition={{ delayChildren: 0.28, staggerChildren: 0.08 }}
                    className="mt-5 grid gap-4 lg:grid-cols-3"
                  >
                    {bars.map((item) => (
                      <motion.div
                        key={item.label}
                        variants={fadeUp}
                        whileHover={{ y: -3 }}
                        className="rounded-[22px] border border-[#dde2e8] bg-white p-5 shadow-[0_6px_16px_rgba(15,23,42,0.04)]"
                      >
                        <div className="text-[18px] font-semibold text-[#3c434b]">{item.label}</div>
                        <div className="mt-1 text-sm text-[#8a939f]">에너지 자립률</div>
                        <div className="mt-2 text-[42px] font-semibold tracking-[-0.04em] text-[#28464b]">{item.ratio}%</div>
                        <div className="mt-3 inline-flex rounded-full bg-[#0e8a90] px-3 py-1 text-xs font-semibold text-white">
                          ZEB 등급
                        </div>
                        <div className="mt-2 text-[24px] font-semibold text-[#0b7f86]">{item.grade}</div>
                        <div className="mt-5 space-y-2 text-sm text-[#5f6874]">
                          <MetricRow label="1차 에너지 생산량" value={`${item.production} kWh/㎡·yr`} />
                          <MetricRow label="1차 에너지 소요량" value={`${item.demand} kWh/㎡·yr`} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    transition={{ duration: 0.35, delay: 0.38 }}
                    className="mt-5 rounded-[24px] border border-[#dde2e8] bg-white p-5 shadow-[0_6px_16px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex items-center gap-2 text-[18px] font-semibold text-[#353c44]">
                      <Layers3 className="h-5 w-5 text-[#5d6672]" />
                      성능 내역 요약
                    </div>
                    <div className="mt-3 text-sm leading-6 text-[#7a848f]">
                      랜딩의 간편 예측에서는 편집 가능한 기술 성능 컴포넌트 없이, 항목군 요약만 제공합니다.
                    </div>
                    <div className="mt-5 space-y-3">
                      {specRows.map((row) => {
                        const isOpen = expandedSpec === row.category;
                        return (
                          <div key={row.category} className="rounded-[16px] border border-[#dfe4ea] bg-[#fbfcfd]">
                            <button
                              type="button"
                              onClick={() => setExpandedSpec(isOpen ? null : row.category)}
                              className="flex w-full items-center justify-between px-4 py-4 text-left"
                            >
                              <div>
                                <div className="text-[15px] font-semibold text-[#343b43]">{row.category}</div>
                                <div className="mt-1 text-sm text-[#7c8591]">{row.summary}</div>
                              </div>
                              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-4 text-sm text-[#6f7884]">
                                <span>({row.items} 항목)</span>
                                <ChevronDown className="h-4 w-4" />
                              </motion.div>
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.24 }}
                                  className="overflow-hidden"
                                >
                                  <div className="border-t border-[#e7ebf0] px-4 py-3 text-sm leading-6 text-[#69737f]">
                                    {row.details.map((detail) => (
                                      <div key={detail}>• {detail}</div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    transition={{ duration: 0.35, delay: 0.48 }}
                    className="mt-5 rounded-[24px] border border-[#dce2e7] bg-[#f7fafb] p-5"
                  >
                    <div className="text-[15px] font-medium leading-7 text-[#52606c]">{summary.guidance}</div>
                    <div className="mt-2 text-sm text-[#7d8792]">
                      본 결과는 표준모델 기반 간편 예측입니다. 상세 시나리오 비교 및 저장은 프로젝트 생성 후 가능합니다.
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-full bg-[#07111f] px-5 py-3 text-sm font-semibold text-white"
                      >
                        프로젝트 생성 후 이어서 비교하기
                      </motion.button>
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-full border border-[#d2d9e0] bg-white px-5 py-3 text-sm font-semibold text-[#36404b]"
                      >
                        결과만 확인하고 닫기
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.45, delay: 0.18 }}
            className="rounded-[32px] border border-[#dbe1e8] bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="text-xs font-medium tracking-[0.22em] text-[#7d8793]">CORE SERVICES</div>
            <div className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">MVP에서 보여줄 핵심 기능 구조</div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {services.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.2 + idx * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="rounded-[24px] border border-[#e5eaf0] bg-[#fafbfc] p-5"
                >
                  <div className="inline-flex rounded-full border border-[#d7ecee] bg-[#eef8f8] px-3 py-1 text-xs font-semibold text-[#0c7f87]">
                    {item.badge}
                  </div>
                  <div className="mt-4 text-[18px] font-semibold text-[#1d2329]">{item.title}</div>
                  <div className="mt-3 text-sm leading-7 text-[#6a7480]">{item.body}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.45, delay: 0.24 }}
            className="rounded-[32px] border border-[#dbe1e8] bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.22em] text-[#7d8793]">
              <Users className="h-4 w-4" />
              COLLABORATION OUTLOOK
            </div>
            <div className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">표준 프로세스 메이커로의 확장</div>
            <div className="mt-4 text-sm leading-7 text-[#69737f]">
              MVP에서는 직접적으로 강조하지 않더라도, ZEBA 내부에는 협업 스페이스와 아카이빙의 씨앗이 들어 있습니다.
              지금은 설계와 인허가 단계에 집중하지만, 장기적으로는 프로젝트 맥락이 누적되는 락인 구조를 통해
              건설 전 공정을 담당하는 표준 프로세스로 확장됩니다.
            </div>
            <div className="mt-6 space-y-3">
              {[
                "설계 판단 결과가 프로젝트 맥락으로 남음",
                "법규 검토와 실행 이력이 다음 단계로 전달됨",
                "협업 스페이스와 아카이빙이 향후 락인 구조를 형성함",
              ].map((text, idx) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28, delay: 0.24 + idx * 0.08 }}
                  className="flex items-start gap-3 rounded-[18px] border border-[#e5eaf0] bg-[#fbfcfd] px-4 py-4"
                >
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0c7f87]" />
                  <div className="text-sm leading-6 text-[#66707c]">{text}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>

      <AnimatePresence>
        {showQuickModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.36)] p-5"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-[740px] rounded-[24px] border border-[#d6dbe2] bg-[#f7f8fa] p-6 shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[31px] font-semibold tracking-[-0.04em] text-[#14181d]">ZEB 간편 예측</div>
                  <div className="mt-2 text-sm leading-6 text-[#68717d]">
                    프로젝트 생성 없이, 랜딩 화면에서 바로 표준모델 기반 단일 분석 결과를 확인합니다.
                  </div>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQuickModal(false)}
                  className="rounded-full p-2 text-[#67717e] hover:bg-white"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                <Field label="지역">
                  <select value={area} onChange={(e) => setArea(e.target.value)} className={inputClassName}>
                    <option>서울</option>
                    <option>경기</option>
                    <option>인천</option>
                    <option>부산</option>
                  </select>
                </Field>
                <Field label="용도">
                  <select value={usage} onChange={(e) => setUsage(e.target.value)} className={inputClassName}>
                    <option>업무시설</option>
                    <option>교육연구시설</option>
                    <option>공동주택</option>
                    <option>판매시설</option>
                  </select>
                </Field>
                <Field label="연면적(㎡)">
                  <input value={grossFloorArea} onChange={(e) => setGrossFloorArea(e.target.value)} className={inputClassName} />
                </Field>
                <Field label="층수">
                  <input value={floors} onChange={(e) => setFloors(e.target.value)} className={inputClassName} />
                </Field>
              </motion.div>

              <div className="mt-4">
                <Field label="목표 ZEB 등급">
                  <select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} className={inputClassName}>
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
                className="mt-4 rounded-[18px] bg-white px-4 py-3 text-sm leading-6 text-[#69727d] shadow-sm"
              >
                생성 후 결과는 랜딩 화면 내 결과 박스에 출력되며, 유저 계정에는 로그 저장되지 않습니다.
              </motion.div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQuickModal(false)}
                  className="rounded-full border border-[#d4dbe2] bg-white px-5 py-3 text-sm font-semibold text-[#4b5662]"
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
                  className="rounded-full bg-[#07111f] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(7,17,31,0.14)]"
                >
                  예측 시작
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.label variants={fadeUp} className="block">
      <div className="mb-2 text-sm font-semibold text-[#343c45]">{label}</div>
      {children}
    </motion.label>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-[22px] border border-[#dde2e8] bg-[#fbfcfd] p-4">
      <div className="text-sm font-semibold text-[#2b323a]">{title}</div>
      <div className="mt-3 space-y-2 text-sm text-[#67717d]">
        {items.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>
    </motion.div>
  );
}

function ResultKpi({
  title,
  value,
  accent = false,
  delay = 0,
}: {
  title: string;
  value: string;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.3, delay: delay * 0.08 }}
      whileHover={{ y: -2 }}
      className="rounded-[22px] border border-[#dde2e8] bg-white p-5 shadow-[0_6px_16px_rgba(15,23,42,0.04)]"
    >
      <div className="text-sm text-[#7a848f]">{title}</div>
      <div className={`mt-2 text-[34px] font-semibold tracking-[-0.04em] ${accent ? "text-[#0b7f86]" : "text-[#24303b]"}`}>
        {value}
      </div>
    </motion.div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="font-semibold text-[#22303b]">{value}</span>
    </div>
  );
}

function Badge({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`rounded-md px-3 py-1.5 text-xs font-semibold ${light ? "bg-[#cfeef2] text-[#25757c]" : "bg-[#8bdbe1] text-[#17696f]"}`}>
      {children}
    </div>
  );
}

const inputClassName =
  "w-full rounded-[16px] border border-[#d6dde4] bg-white px-4 py-3 text-[15px] text-[#1f252c] outline-none transition focus:border-[#9dbec4] focus:ring-2 focus:ring-[#d7ecee]";
