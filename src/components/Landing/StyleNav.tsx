'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './StyleNav.module.scss';

const variants = [
  { key: 'style-a', label: 'Style A', sublabel: 'Dark Glassmorphism' },
  { key: 'style-b', label: 'Style B', sublabel: 'Minimal Clean' },
  { key: 'style-c', label: 'Style C', sublabel: 'Bold Gradient' },
];

export default function StyleNav() {
  const pathname = usePathname();

  return (
    <div className={styles.styleNav}>
      <span className={styles.styleNavLabel}>스타일 비교</span>
      <div className={styles.styleNavItems}>
        {variants.map((v) => {
          const href = `/landing/${v.key}`;
          const isActive = pathname?.includes(v.key);
          return (
            <Link
              key={v.key}
              href={href}
              className={`${styles.styleNavItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.styleNavItemLabel}>{v.label}</span>
              <span className={styles.styleNavItemSub}>{v.sublabel}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
