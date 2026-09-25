import type { ReactNode } from 'react';

import { cx } from '../utils';

import styles from './IconButton.module.css';

interface Props {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}

export function IconButton({ label, onClick, className, children }: Props) {
  return (
    <button type="button" className={cx(styles.button, className)} onClick={onClick} title={label} aria-label={label}>
      {children}
    </button>
  );
}
