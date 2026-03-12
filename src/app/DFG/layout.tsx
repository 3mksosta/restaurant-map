import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'لوحة التحكم — مطاعم ماب' };

export default function DFGLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
