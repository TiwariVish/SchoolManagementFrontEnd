import { useMemo, useState, type ReactNode } from 'react';
import { useAcademicYears } from '@/api/hooks';
import { session } from '@/api/session';
import type { Id } from '@/api/types';
import { AcademicYearContext } from './academic-year';
import { useAuth } from './auth';

export function AcademicYearProvider({ children }: { children: ReactNode }) {
  const { me, can } = useAuth();
  const { data: years = [] } = useAcademicYears(can('academic.read'));
  const [selected, setSelected] = useState<Id | null>(session.academicYearId);

  const value = useMemo(() => {
    const currentId = me?.currentAcademicYearId ?? null;
    const valid = selected && (years.length === 0 || years.some((y) => y.id === selected));
    const yearId = valid ? selected : currentId;
    const year = years.find((y) => y.id === yearId);
    return {
      yearId,
      year,
      years,
      isCurrent: yearId === currentId,
      isClosed: year?.status === 'CLOSED',
      setYearId: (id: Id) => {
        session.academicYearId = id === currentId ? null : id;
        setSelected(id === currentId ? null : id);
      },
    };
  }, [me?.currentAcademicYearId, selected, years]);

  return <AcademicYearContext.Provider value={value}>{children}</AcademicYearContext.Provider>;
}
