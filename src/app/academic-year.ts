import { createContext, useContext } from 'react';
import type { AcademicYear, Id } from '@/api/types';

export interface AcademicYearContextValue {
  yearId: Id | null;
  year: AcademicYear | undefined;
  years: AcademicYear[];
  isCurrent: boolean;
  isClosed: boolean;
  setYearId: (id: Id) => void;
}

export const AcademicYearContext = createContext<AcademicYearContextValue>({
  yearId: null,
  year: undefined,
  years: [],
  isCurrent: true,
  isClosed: false,
  setYearId: () => undefined,
});

export const useAcademicYear = () => useContext(AcademicYearContext);
