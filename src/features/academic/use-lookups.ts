import { useMemo } from 'react';
import { useLevels, usePrograms, useSections } from '@/api/hooks';
import type { Section } from '@/api/types';
import { useAuth } from '@/app/auth';

/** Lookup helpers for rendering "Class 5 – A" style names from ids. */
export function useAcademicLookups() {
  const { labels } = useAuth();
  const levels = useLevels();
  const programs = usePrograms();
  const sections = useSections();

  return useMemo(() => {
    const levelById = new Map((levels.data ?? []).map((l) => [l.id, l]));
    const programById = new Map((programs.data ?? []).map((p) => [p.id, p]));
    const sectionById = new Map((sections.data ?? []).map((s) => [s.id, s]));
    const levelName = (id?: string) => (id && levelById.get(id)?.name) || labels.level;
    const sectionName = (section?: Pick<Section, 'levelId' | 'name'> | string) => {
      const s = typeof section === 'string' ? sectionById.get(section) : section;
      return s ? `${levelName(s.levelId)} – ${s.name}` : '—';
    };
    const multiProgram = (programs.data ?? []).filter((p) => !p.isDefault).length > 0;
    const levelLabel = (id?: string) => {
      const level = id ? levelById.get(id) : undefined;
      if (!level) return labels.level;
      const program = programById.get(level.programId);
      return multiProgram && program && !program.isDefault ? `${program.code} · ${level.name}` : level.name;
    };
    const sectionOptions = (sections.data ?? [])
      .slice()
      .sort((a, b) => (levelById.get(a.levelId)?.order ?? 0) - (levelById.get(b.levelId)?.order ?? 0) || a.name.localeCompare(b.name))
      .map((s) => ({ value: s.id, label: `${levelLabel(s.levelId)} – ${s.name}` }));
    const levelOptions = (levels.data ?? []).map((l) => ({ value: l.id, label: levelLabel(l.id) }));

    return {
      levels: levels.data ?? [],
      programs: programs.data ?? [],
      sections: sections.data ?? [],
      levelById,
      levelName,
      levelLabel,
      sectionName,
      sectionOptions,
      levelOptions,
      loading: levels.isLoading || sections.isLoading,
    };
  }, [levels.data, programs.data, sections.data, levels.isLoading, sections.isLoading, labels.level]);
}
