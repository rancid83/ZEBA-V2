'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './PresentationSlides.module.scss';
import Head from 'next/head';

const TOTAL = 8;
const AUTO_ADVANCE_MS = 6000;

const icons = ['🏗️', '📋', '⚡'];
const problems = [
  {
    icon: '📐',
    title: '복잡한 ZEB 법규',
    desc: 'EPI, 신재생 의무비율 등 세움터 이전에 파악해야 할 기준이 방대합니다.',
  },
  {
    icon: '🔮',
    title: '불확실한 등급 예측',
    desc: '설계 초기에 ZEB 달성 가능성을 판단할 도구가 없어 리스크가 누적됩니다.',
  },
  {
    icon: '🔗',
    title: '실행 연결의 단절',
    desc: '판단 이후 전문가 연계·내역 전달이 체계 없이 진행되어 손실이 발생합니다.',
  },
];

const flowSteps = [
  { num: '01', icon: '📝', text: '사업 개요\n입력' },
  { num: '02', icon: '🏗️', text: '표준모델\n생성' },
  { num: '03', icon: '⚖️', text: '법규 여유율\n확인' },
  { num: '04', icon: '🔧', text: '설비 조합\n비교' },
  { num: '05', icon: '🤝', text: '컨설턴트\n연결' },
];

const features = [
  {
    emoji: '⚡',
    title: 'ZEB 예측',
    badge: '핵심 기능',
    badgeClass: 'tealBadge' as const,
    cardClass: 'teal' as const,
    desc: '랜딩 간편 예측부터 프로젝트 기반 시나리오 비교까지, 설계 의사결정 전 과정을 지원합니다.',
  },
  {
    emoji: '📋',
    title: '법규 사전 검토',
    badge: '사전 검토',
    badgeClass: 'pinkBadge' as const,
    cardClass: 'pink' as const,
    desc: 'EPI와 신재생 의무비율을 설계 단계에서 미리 검토해 세움터 이전 판단을 돕습니다.',
  },
  {
    emoji: '🔗',
    title: '실행 지원',
    badge: '실무 수행',
    badgeClass: 'whiteBadge' as const,
    cardClass: 'white' as const,
    desc: '전문가 연계와 설계 내역 전달을 통해 판단 이후의 실무 수행이 자연스럽게 이어집니다.',
  },
];

export default function PresentationSlides() {
  const [current, setCurrent] = useState(0);
  const [key, setKey] = useState(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setKey((k) => k + 1);
  }, []);

  const prev = () => current > 0 && goTo(current - 1);
  const next = () => current < TOTAL - 1 && goTo(current + 1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => {
        if (c < TOTAL - 1) {
          setKey((k) => k + 1);
          return c + 1;
        }
        return c;
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current]);

  const progress = ((current + 1) / TOTAL) * 100;

  return (
    <>
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    </Head>
    <div className={styles.wrapper}>
      {/* Progress bar */}
      <div className={styles.progressBar} style={{ width: `${progress}%` }} />

      {/* Counter */}
      <div className={styles.counter}>{current + 1} / {TOTAL}</div>

      {/* ── Slide 1: Title ── */}
      <div className={`${styles.slide} ${current === 0 ? styles.active : ''}`}>
        <div className={styles.s1Bg} />
        <div className={styles.s1Grid} />
        <div className={`${styles.s1Content} ${current === 0 ? styles.animFadeUp : ''}`} key={`s1-${key}`}>
          <img src="/assets/zeba-logo.png" alt="ZEBA" className={styles.s1Logo} />
          <div className={`${styles.s1Eyebrow} ${styles.delay1} ${styles.animFadeUp}`}>
            설계 판단 플랫폼 · MVP LANDING
          </div>
          <h1 className={`${styles.s1Title} ${styles.delay2} ${styles.animFadeUp}`}>
            설계 판단을 안정시키고,<br />
            판단 이후엔 <span>실행을 연결</span>합니다.
          </h1>
          <p className={`${styles.s1Desc} ${styles.delay3} ${styles.animFadeUp}`}>
            세움터 이전 단계에서 ZEB 리스크를 구조화하고,<br />
            컨설턴트 연계까지 한 흐름으로 완결하는 플랫폼
          </p>
        </div>
        <div className={`${styles.s1Deco} ${styles.animScaleIn} ${styles.delay2}`} key={`s1d-${key}`}>
          <div className={styles.s1DecoInner} />
        </div>
      </div>

      {/* ── Slide 2: Problem ── */}
      <div className={`${styles.slide} ${current === 1 ? styles.active : ''}`}>
        <div className={styles.s2Bg} />
        <div className={styles.s2Layout} key={`s2-${key}`}>
          <div className={`${styles.s2Left} ${current === 1 ? styles.animSlideLeft : ''}`}>
            <h2>THE PROBLEM</h2>
            <h3>설계 판단,<br />왜 어려운가</h3>
            <p>ZEB 의무화가 확대되면서 설계 초기의 판단 리스크가 급증하고 있습니다. 하지만 체계적인 도구는 없습니다.</p>
          </div>
          <div className={styles.s2Right}>
            {problems.map((p, i) => (
              <div
                key={p.title}
                className={`${styles.s2Card} ${current === 1 ? styles.animSlideRight : ''}`}
                style={{ animationDelay: `${0.2 + i * 0.15}s` }}
              >
                <div className={styles.s2CardIcon}>{p.icon}</div>
                <div className={styles.s2CardText}>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Slide 3: Solution ── */}
      <div className={`${styles.slide} ${current === 2 ? styles.active : ''}`}>
        <div className={styles.s3Bg} />
        <div className={styles.s3Content} key={`s3-${key}`}>
          <div className={`${styles.s3Eyebrow} ${current === 2 ? styles.animFadeUp : ''}`}>THE SOLUTION</div>
          <h2 className={`${styles.s3Title} ${styles.delay1} ${current === 2 ? styles.animFadeUp : ''}`}>
            <span>ZEBA</span>가 해결합니다
          </h2>
          <p className={`${styles.s3Sub} ${styles.delay2} ${current === 2 ? styles.animFadeUp : ''}`}>
            기술을 과시하는 분석 툴이 아니라, 설계자의 판단을 안정시키는 플랫폼
          </p>
          <div className={styles.s3Cards}>
            {[
              { num: '01', title: '설계 판단', desc: 'ZEB 목표 등급과 법규 리스크를 설계 초기에 판단합니다.' },
              { num: '02', title: '사전 검토', desc: 'EPI와 신재생 의무비율을 사후가 아닌 설계 도구로 구조화합니다.' },
              { num: '03', title: '실행 연결', desc: '검증된 전문가 연계와 내역 전달로 판단 이후를 완결합니다.' },
            ].map((c, i) => (
              <div
                key={c.num}
                className={`${styles.s3Card} ${styles.delay3} ${current === 2 ? styles.animScaleIn : ''}`}
                style={{ animationDelay: `${0.35 + i * 0.15}s` }}
              >
                <div className={styles.s3CardNum}>{c.num}</div>
                <div className={styles.s3CardTitle}>{c.title}</div>
                <div className={styles.s3CardDesc}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Slide 4: Flow ── */}
      <div className={`${styles.slide} ${current === 3 ? styles.active : ''}`}>
        <div className={styles.s4Bg} />
        <div className={styles.s4Content} key={`s4-${key}`}>
          <div className={`${styles.slideEyebrow} ${current === 3 ? styles.animFadeUp : ''}`}>JUDGMENT FLOW</div>
          <h2 className={`${styles.slideTitle} ${styles.delay1} ${current === 3 ? styles.animFadeUp : ''}`}>
            감성이 아니라, <span>설계 판단의 흐름</span>을 보여줍니다
          </h2>
          <p className={`${styles.slideSub} ${styles.delay2} ${current === 3 ? styles.animFadeUp : ''}`}>
            5단계 판단 프로세스로 리스크를 구조화합니다
          </p>
          <div className={styles.s4Steps}>
            {flowSteps.map((step, i) => (
              <React.Fragment key={step.num}>
                <div
                  className={`${styles.s4Step} ${current === 3 ? styles.animFadeUp : ''}`}
                  style={{ animationDelay: `${0.3 + i * 0.12}s` }}
                >
                  <div className={styles.s4StepNum}>{step.num}</div>
                  <div className={styles.s4StepCircle}>{step.icon}</div>
                  <div className={styles.s4StepText}>{step.text.split('\n').map((t, j) => <React.Fragment key={j}>{t}{j === 0 && <br />}</React.Fragment>)}</div>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className={styles.s4Arrow}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Slide 5: ZEB Feature ── */}
      <div className={`${styles.slide} ${current === 4 ? styles.active : ''}`}>
        <div className={styles.s5Bg} />
        <div className={styles.s5Layout} key={`s5-${key}`}>
          <div className={`${styles.s5Left} ${current === 4 ? styles.animSlideLeft : ''}`}>
            <div className={styles.s5Eyebrow}>CORE FEATURE</div>
            <h3>ZEB <span>간편 예측</span>으로<br />빠른 판단을</h3>
            <p>랜딩에서 즉시 체험 가능한 ZEB 등급 예측 서비스. 프로젝트 생성 전에도 설계 방향과 등급 가능성을 빠르게 확인합니다.</p>
            <div className={styles.s5Tags}>
              {['지역', '연면적', '층수', '건물 용도', '목표 등급'].map((t) => (
                <span key={t} className={styles.s5Tag}>{t}</span>
              ))}
            </div>
          </div>
          <div className={styles.s5Right}>
            {[
              { num: '3', label: '단계', desc: '간편 예측 결과 단계' },
              { num: '5', label: '항목', desc: '입력 항목만으로 즉시 예측' },
              { num: '100%', label: '', desc: '표준모델 기반 무료 체험' },
            ].map((s, i) => (
              <div
                key={s.desc}
                className={`${styles.s5StatCard} ${current === 4 ? styles.animSlideRight : ''}`}
                style={{ animationDelay: `${0.2 + i * 0.15}s` }}
              >
                <div className={styles.s5StatNum}>{s.num}<span style={{ fontSize: '1.5vw', color: 'rgba(0,201,201,0.5)' }}>{s.label}</span></div>
                <div className={styles.s5StatDesc}>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Slide 6: Features Grid ── */}
      <div className={`${styles.slide} ${current === 5 ? styles.active : ''}`}>
        <div className={styles.s6Bg} />
        <div className={styles.s6Content} key={`s6-${key}`}>
          <div className={`${styles.slideEyebrow} ${current === 5 ? styles.animFadeUp : ''}`}>SERVICE STRUCTURE</div>
          <h2 className={`${styles.slideTitle} ${styles.delay1} ${current === 5 ? styles.animFadeUp : ''}`}>
            판단에서 실행까지 <span>이어지는 구조</span>
          </h2>
          <div className={styles.s6Grid}>
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`${styles.s6Card} ${styles[f.cardClass]} ${current === 5 ? styles.animScaleIn : ''}`}
                style={{ animationDelay: `${0.3 + i * 0.15}s` }}
              >
                <span className={styles.s6CardEmoji}>{f.emoji}</span>
                <div className={`${styles.s6CardBadge} ${styles[f.badgeClass]}`}>{f.badge}</div>
                <div className={styles.s6CardTitle}>{f.title}</div>
                <div className={styles.s6CardDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Slide 7: Big Stats ── */}
      <div className={`${styles.slide} ${current === 6 ? styles.active : ''}`}>
        <div className={styles.s7Bg} />
        <div className={styles.s7Content} key={`s7-${key}`}>
          <div className={`${styles.slideEyebrow} ${current === 6 ? styles.animFadeUp : ''}`}>BY THE NUMBERS</div>
          <h2 className={`${styles.slideTitle} ${styles.delay1} ${current === 6 ? styles.animFadeUp : ''}`}>
            숫자로 보는 <span>ZEBA</span>
          </h2>
          <div className={`${styles.s7Stats} ${styles.delay2} ${current === 6 ? styles.animFadeUp : ''}`}>
            <div className={styles.s7Stat}>
              <div className={styles.s7StatNum}>5</div>
              <div className={styles.s7StatLabel}>단계 판단 프로세스</div>
              <div className={styles.s7StatSub}>사업 개요 → 컨설턴트 연결</div>
            </div>
            <div className={styles.s7Divider} />
            <div className={styles.s7Stat}>
              <div className={`${styles.s7StatNum} ${styles.delay3} ${current === 6 ? styles.animFadeUp : ''}`}>3</div>
              <div className={styles.s7StatLabel}>핵심 서비스</div>
              <div className={styles.s7StatSub}>예측·검토·실행 연결</div>
            </div>
            <div className={styles.s7Divider} />
            <div className={styles.s7Stat}>
              <div className={`${styles.s7StatNum} ${styles.delay4} ${current === 6 ? styles.animFadeUp : ''}`}>0</div>
              <div className={styles.s7StatLabel}>원 간편 예측</div>
              <div className={styles.s7StatSub}>로그인 없이 즉시 체험 가능</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Slide 8: Closing ── */}
      <div className={`${styles.slide} ${current === 7 ? styles.active : ''}`}>
        <div className={styles.s8Bg} />
        <div className={styles.s8Glow} />
        <div className={styles.s8Content} key={`s8-${key}`}>
          <img
            src="/assets/zeba-logo.png"
            alt="ZEBA"
            className={`${styles.s8Logo} ${current === 7 ? styles.animScaleIn : ''}`}
          />
          <h2 className={`${styles.s8Title} ${styles.delay1} ${current === 7 ? styles.animFadeUp : ''}`}>
            설계 판단의 시작,<br /><span>지금 ZEBA에서</span>
          </h2>
          <p className={`${styles.s8Sub} ${styles.delay2} ${current === 7 ? styles.animFadeUp : ''}`}>
            세움터 이전 단계의 모든 의사결정을 ZEBA와 함께
          </p>
          <div className={`${styles.s8Url} ${styles.delay3} ${current === 7 ? styles.animFadeUp : ''}`}>
            zeba.kr
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={prev} disabled={current === 0}>‹</button>
        <div className={styles.dots}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button className={styles.navBtn} onClick={next} disabled={current === TOTAL - 1}>›</button>
      </div>
    </div>
    </>
  );
}
