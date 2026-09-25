import type { ReactNode } from 'react';

import { cx } from '../utils';

import styles from './Pill.module.css';

interface Props {
  className?: string;
  children: ReactNode;
}

export function Pill({ className, children }: Props) {
  return <div className={cx(styles.pill, className)}>{children}</div>;
}
