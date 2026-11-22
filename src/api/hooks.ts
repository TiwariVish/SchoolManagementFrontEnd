import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useAcademicYear } from '@/app/academic-year';
import { api } from './client';
import type {
  AcademicYear,
  CourseOffering,
  CreatedEmployee,
  Employee,
  Enrollment,
  Id,
  Institute,
  Level,
  MyTeaching,
  Page,
  Program,
  AttendanceStatus,
  FeeInvoice,
  FeeStructure,
  FeesOverview,
  PayrollOverview,
  Role,
  SalaryPayment,
  SalaryProfileRow,
  Section,
  SettingsMap,
  SettingsSection,
  StaffAttendanceDay,
  StaffAttendanceSummaryItem,
  Student,
  Subject,
  TeachingAssignment,
  VersionedSettings,
} from './types';

type Params = Record<string, string | number | boolean | undefined | null>;

const clean = (params: Params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

const get = async <T>(url: string, params?: Params) => (await api.get<T>(url, { params: clean(params) })).data;

/** Year-scoped data is cached per academic year so switching years never shows stale rows. */
function useYearScope(): QueryKey {
  const { yearId } = useAcademicYear();
  return ['year', yearId];
}

function useInvalidate() {
  const client = useQueryClient();
  return (...keys: QueryKey[]) => Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
}

/* ---------------------------------- Institute & settings ---------------------------------- */

export const useInstitute = () => useQuery({ queryKey: ['institute'], queryFn: () => get<Institute>('/institute') });

export function useUpdateInstitute() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: Partial<Institute>) => (await api.patch<Institute>('/institute', body)).data,
    onSuccess: () => invalidate(['institute'], ['me']),
  });
}

export const useSettings = <S extends SettingsSection>(section: S) =>
  useQuery({
    queryKey: ['settings', section],
    queryFn: () => get<VersionedSettings<SettingsMap[S]>>(`/settings/${section}`),
  });

export function useUpdateSettings<S extends SettingsSection>(section: S) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ data, version }: { data: Partial<SettingsMap[S]>; version: number }) =>
      (
        await api.patch<VersionedSettings<SettingsMap[S]>>(`/settings/${section}`, data, {
          headers: { 'If-Match': `"${version}"` },
        })
      ).data,
    onSuccess: () => invalidate(['settings', section], ['me']),
  });
}

export const useRoles = () => useQuery({ queryKey: ['roles'], queryFn: () => get<Role[]>('/roles') });

export const usePermissionCatalog = () =>
  useQuery({ queryKey: ['permissions'], queryFn: () => get<{ key: string; description: string }[]>('/permissions') });

export function useCreateRole() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: { name: string; key?: string; permissions: string[] }) =>
      (await api.post<Role>('/roles', body)).data,
    onSuccess: () => invalidate(['roles'], ['me']),
  });
}

export function useUpdateRole() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: Id; name?: string; permissions?: string[] }) =>
      (await api.patch<Role>(`/roles/${id}`, body)).data,
    onSuccess: () => invalidate(['roles'], ['me']),
  });
}

export function useDeleteRole() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: Id) => {
      await api.delete(`/roles/${id}`);
    },
    onSuccess: () => invalidate(['roles'], ['me']),
  });
}

/* ---------------------------------------- Finance ---------------------------------------- */

export const useFeesOverview = () =>
  useQuery({ queryKey: ['fees', 'overview'], queryFn: () => get<FeesOverview>('/fees/overview') });

export const useFeeStructures = () =>
  useQuery({ queryKey: ['fee-structures'], queryFn: () => get<FeeStructure[]>('/fee-structures') });

export function useSaveFeeStructure() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: Partial<FeeStructure> & { name?: string; amount?: number; id?: Id }) => {
      if (input.id) return (await api.patch<FeeStructure>(`/fee-structures/${input.id}`, input)).data;
      return (await api.post<FeeStructure>('/fee-structures', input)).data;
    },
    onSuccess: () => invalidate(['fee-structures']),
  });
}

export const useFeeInvoices = (params: Params) =>
  useQuery({
    queryKey: ['fee-invoices', clean(params)],
    queryFn: () => get<Page<FeeInvoice>>('/fee-invoices', params),
    placeholderData: keepPreviousData,
  });

export function useGenerateFeeInvoices() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: { feeStructureId: Id; sectionId?: Id; studentIds?: Id[]; dueDate?: string; title?: string }) =>
      (await api.post<{ created: number }>('/fee-invoices/generate', body)).data,
    onSuccess: () => invalidate(['fee-invoices'], ['fees', 'overview']),
  });
}

export function useCollectFee() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: Id; amount: number; method: string; paidAt?: string; note?: string }) =>
      (await api.post<FeeInvoice>(`/fee-invoices/${id}/collect`, body)).data,
    onSuccess: () => invalidate(['fee-invoices'], ['fees', 'overview']),
  });
}

export const usePayrollOverview = () =>
  useQuery({ queryKey: ['payroll', 'overview'], queryFn: () => get<PayrollOverview>('/payroll/overview') });

export const useSalaryProfiles = () =>
  useQuery({ queryKey: ['salary-profiles'], queryFn: () => get<SalaryProfileRow[]>('/salary-profiles') });

export function useUpsertSalaryProfile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: { employeeId: Id; monthlyAmount: number; isActive?: boolean; note?: string }) =>
      (await api.post('/salary-profiles', body)).data,
    onSuccess: () => invalidate(['salary-profiles'], ['payroll', 'overview']),
  });
}

export const useSalaryPayments = (params: Params) =>
  useQuery({
    queryKey: ['salary-payments', clean(params)],
    queryFn: () => get<Page<SalaryPayment>>('/salary-payments', params),
    placeholderData: keepPreviousData,
  });

export function usePaySalary() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: { employeeId: Id; period: string; amount?: number; method: string; paidAt?: string; note?: string }) =>
      (await api.post<SalaryPayment>('/salary-payments', body)).data,
    onSuccess: () => invalidate(['salary-payments'], ['payroll', 'overview'], ['salary-profiles']),
  });
}

/* -------------------------------------- Attendance -------------------------------------- */

export const useStaffAttendanceDay = (date: string, category?: string) =>
  useQuery({
    queryKey: ['staff-attendance', 'day', date, category ?? ''],
    queryFn: () => get<StaffAttendanceDay>('/staff-attendance/day', { date, category: category || undefined }),
    enabled: Boolean(date),
  });

export function useSaveStaffAttendanceDay() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: {
      date: string;
      entries: { employeeId: Id; status: AttendanceStatus; note?: string }[];
    }) => (await api.put<StaffAttendanceDay>('/staff-attendance/day', body)).data,
    onSuccess: (_data, vars) => invalidate(['staff-attendance', 'day', vars.date], ['staff-attendance', 'summary']),
  });
}

export const useStaffAttendanceSummary = (params: { from: string; to: string; category?: string; employeeId?: Id }) =>
  useQuery({
    queryKey: ['staff-attendance', 'summary', params],
    queryFn: () =>
      get<{ from: string; to: string; items: StaffAttendanceSummaryItem[] }>('/staff-attendance/summary', params),
    enabled: Boolean(params.from && params.to),
  });

/* ---------------------------------------- Academic ---------------------------------------- */

export const useAcademicYears = (enabled = true) =>
  useQuery({ queryKey: ['academic-years'], queryFn: () => get<AcademicYear[]>('/academic-years'), enabled });

export function useCreateAcademicYear() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: { name: string; startDate: string; endDate: string; makeCurrent?: boolean }) =>
      (await api.post<AcademicYear>('/academic-years', body)).data,
    onSuccess: () => invalidate(['academic-years'], ['me']),
  });
}

export function useAcademicYearAction() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, action }: { id: Id; action: 'set-current' | 'close' | 'reopen' }) =>
      (await api.post<AcademicYear>(`/academic-years/${id}/${action}`)).data,
    onSuccess: () => invalidate(['academic-years'], ['me'], ['year']),
  });
}

export const usePrograms = () => useQuery({ queryKey: ['programs'], queryFn: () => get<Program[]>('/programs') });

export function useCreateProgram() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: { name: string; code: string; department?: string; levelCount?: number; levelPrefix?: string }) =>
      (await api.post<Program>('/programs', body)).data,
    onSuccess: () => invalidate(['programs'], ['levels']),
  });
}

export const useLevels = (programId?: Id) =>
  useQuery({ queryKey: ['levels', programId ?? 'all'], queryFn: () => get<Level[]>('/levels', { programId }) });

export function useCreateLevel() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: { programId: Id; name: string; code: string; order: number }) =>
      (await api.post<Level>('/levels', body)).data,
    onSuccess: () => invalidate(['levels']),
  });
}

export function useSetCurriculum() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ levelId, items }: { levelId: Id; items: { subjectId: Id; isElective: boolean; weeklyPeriods: number }[] }) =>
      (await api.put<Level>(`/levels/${levelId}/curriculum`, { items })).data,
    onSuccess: () => invalidate(['levels']),
  });
}

export const useSubjects = (params: { page?: number; limit?: number; q?: string } = {}) =>
  useQuery({
    queryKey: ['subjects', params],
    queryFn: () => get<Page<Subject>>('/subjects', { limit: 100, ...params }),
    placeholderData: keepPreviousData,
  });

export function useSaveSubject() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<Subject> & { id?: Id }) =>
      id ? (await api.patch<Subject>(`/subjects/${id}`, body)).data : (await api.post<Subject>('/subjects', body)).data,
    onSuccess: () => invalidate(['subjects']),
  });
}

export function useSections(params: { levelId?: Id; programId?: Id } = {}) {
  const scope = useYearScope();
  return useQuery({ queryKey: [...scope, 'sections', params], queryFn: () => get<Section[]>('/sections', params) });
}

export function useSection(id: Id | undefined) {
  const scope = useYearScope();
  return useQuery({
    queryKey: [...scope, 'section', id],
    queryFn: () => get<Section>(`/sections/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateSection() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: { levelId: Id; name: string; capacity?: number; room?: string }) =>
      (await api.post<Section>('/sections', body)).data,
    onSuccess: () => invalidate(['year']),
  });
}

export function useOfferings(params: { sectionId?: Id; subjectId?: Id } = {}, enabled = true) {
  const scope = useYearScope();
  return useQuery({
    queryKey: [...scope, 'offerings', params],
    queryFn: () => get<CourseOffering[]>('/course-offerings', params),
    enabled,
  });
}

export function useGenerateOfferings() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (sectionId: Id) =>
      (await api.post<{ created: number }>(`/sections/${sectionId}/offerings/generate`)).data,
    onSuccess: () => invalidate(['year']),
  });
}

export function useCreateOffering() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: { subjectId: Id; sectionIds: Id[]; batch?: string; isElective?: boolean; weeklyPeriods?: number }) =>
      (await api.post<CourseOffering>('/course-offerings', body)).data,
    onSuccess: () => invalidate(['year']),
  });
}

/* ----------------------------------------- People ----------------------------------------- */

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  status?: string;
}

export const useEmployees = (params: EmployeeFilters = {}) =>
  useQuery({
    queryKey: ['employees', params],
    queryFn: () => get<Page<Employee>>('/employees', params as Params),
    placeholderData: keepPreviousData,
  });

export const useEmployee = (id: Id | undefined, enabled = true) =>
  useQuery({
    queryKey: ['employees', 'one', id],
    queryFn: () => get<Employee>(`/employees/${id}`),
    enabled: Boolean(id) && enabled,
  });

export function useCreateEmployee() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await api.post<CreatedEmployee>('/employees', body)).data,
    onSuccess: () => invalidate(['employees']),
  });
}

export function useUpdateEmployee() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<Employee> & { id: Id }) =>
      (await api.patch<Employee>(`/employees/${id}`, body)).data,
    onSuccess: () => invalidate(['employees']),
  });
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  q?: string;
  sectionId?: Id;
  levelId?: Id;
}

export function useStudents(params: StudentFilters = {}) {
  const scope = useYearScope();
  return useQuery({
    queryKey: [...scope, 'students', params],
    queryFn: () => get<Page<Enrollment<Student>>>('/students', params as Params),
    placeholderData: keepPreviousData,
  });
}

export const useStudent = (id: Id | undefined) =>
  useQuery({
    queryKey: ['student', id],
    queryFn: () => get<{ student: Student; enrollments: Enrollment[] }>(`/students/${id}`),
    enabled: Boolean(id),
  });

export function useAdmitStudent() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      (await api.post<{ student: Student; enrollment: Enrollment }>('/students', body)).data,
    onSuccess: () => invalidate(['year']),
  });
}

export function useUpdateStudent() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, ...body }: Record<string, unknown> & { id: Id }) =>
      (await api.patch<Student>(`/students/${id}`, body)).data,
    onSuccess: (_data, { id }) => invalidate(['student', id], ['year']),
  });
}

export function useTransferStudent() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, toSectionId }: { id: Id; toSectionId: Id }) =>
      (await api.post<Enrollment>(`/students/${id}/transfer-section`, { toSectionId })).data,
    onSuccess: (_data, { id }) => invalidate(['student', id], ['year']),
  });
}

/* ---------------------------------------- Teaching ---------------------------------------- */

export function useAssignments(params: { sectionId?: Id; employeeId?: Id; offeringId?: Id } = {}) {
  const scope = useYearScope();
  return useQuery({
    queryKey: [...scope, 'assignments', params],
    queryFn: () => get<TeachingAssignment[]>('/teaching-assignments', params),
  });
}

export function useAssignTeacher() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (body: { offeringId: Id; employeeId: Id; role?: string; replaceExisting?: boolean }) =>
      (await api.post<TeachingAssignment>('/teaching-assignments', body)).data,
    onSuccess: () => invalidate(['year']),
  });
}

export function useEndAssignment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: Id) => (await api.post<TeachingAssignment>(`/teaching-assignments/${id}/end`, {})).data,
    onSuccess: () => invalidate(['year']),
  });
}

export function useSetClassTeacher() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ sectionId, employeeId }: { sectionId: Id; employeeId: Id | null }) =>
      (await api.put<Section>(`/sections/${sectionId}/class-teacher`, { employeeId })).data,
    onSuccess: () => invalidate(['year']),
  });
}

export function useMyTeaching(enabled = true) {
  const scope = useYearScope();
  return useQuery({ queryKey: [...scope, 'me-teaching'], queryFn: () => get<MyTeaching>('/me/teaching'), enabled, retry: false });
}
