export type Id = string;

export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export type InstituteType = 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY';
export type InstituteStatus = 'TRIAL' | 'ACTIVE' | 'READ_ONLY' | 'SUSPENDED';

export interface Labels {
  academicYear: string;
  program: string;
  level: string;
  section: string;
  subject: string;
  term: string;
  student: string;
  teacher: string;
  guardian: string;
  classTeacher: string;
}

export interface Me {
  user: { id: Id; name: string; email: string; phone?: string; mustChangePassword: boolean };
  institute: { id: Id; name: string; code: string; type: InstituteType; status: InstituteStatus };
  roles: string[];
  profile: { type: 'EMPLOYEE' | 'STUDENT' | 'GUARDIAN'; id: Id } | null;
  access: { grantsAll: boolean; permissions: string[] };
  modules: string[];
  otherInstitutes: { code: string; name: string }[];
  currentAcademicYearId: Id | null;
  labels: Labels;
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Institute {
  id: Id;
  name: string;
  code: string;
  type: InstituteType;
  status: InstituteStatus;
  trialEndsAt?: string;
  modules: string[];
  timezone: string;
  currency: string;
  email?: string;
  phone?: string;
  address: Address;
  currentAcademicYearId?: Id;
}

export type AcademicYearStatus = 'PLANNED' | 'ACTIVE' | 'CLOSED';

export interface AcademicYear {
  id: Id;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
}

export interface Program {
  id: Id;
  name: string;
  code: string;
  department?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface CurriculumItem {
  subjectId: Id;
  isElective: boolean;
  weeklyPeriods: number;
}

export interface Level {
  id: Id;
  programId: Id;
  name: string;
  code: string;
  order: number;
  curriculum: CurriculumItem[];
  isActive: boolean;
}

export type SubjectType = 'THEORY' | 'PRACTICAL' | 'THEORY_PRACTICAL' | 'ACTIVITY';

export interface Subject {
  id: Id;
  name: string;
  code: string;
  type: SubjectType;
  credits?: number;
  isActive: boolean;
}

export interface Section {
  id: Id;
  academicYearId: Id;
  programId: Id;
  levelId: Id;
  name: string;
  capacity?: number;
  room?: string;
  classTeacherId?: Id;
  isActive: boolean;
}

export interface CourseOffering {
  id: Id;
  academicYearId: Id;
  subjectId: Pick<Subject, 'id' | 'name' | 'code' | 'type'>;
  levelId: Id;
  sectionIds: Pick<Section, 'id' | 'name' | 'levelId'>[];
  batch: string;
  isElective: boolean;
  weeklyPeriods: number;
  isActive: boolean;
}

export type EmployeeCategory = 'TEACHING' | 'NON_TEACHING';
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'EXITED';

export interface Employee {
  id: Id;
  employeeCode: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  category: EmployeeCategory;
  designation?: string;
  department?: string;
  joiningDate?: string;
  status: EmployeeStatus;
  subjectIds: Id[];
  userId?: Id;
}

export interface CreatedEmployee {
  employee: Employee;
  login?: { email: string; temporaryPassword?: string; linkedExistingUser: boolean };
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type GuardianRelation = 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';

export interface Guardian {
  name: string;
  relation: GuardianRelation;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface Student {
  id: Id;
  admissionNo: string;
  firstName: string;
  lastName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  admissionDate: string;
  status: 'ACTIVE' | 'WITHDRAWN' | 'ALUMNI';
  guardians: Guardian[];
}

export interface Enrollment<S = Id> {
  id: Id;
  studentId: S;
  academicYearId: Id;
  programId: Id;
  levelId: Id;
  sectionId: Id;
  rollNo: number;
  status: 'ACTIVE' | 'PROMOTED' | 'COMPLETED' | 'WITHDRAWN';
  sectionHistory: { sectionId: Id; rollNo: number; from: string; to: string }[];
}

export type TeachingRole = 'PRIMARY' | 'CO_TEACHER' | 'LAB';

export interface TeachingAssignment {
  id: Id;
  academicYearId: Id;
  offeringId: CourseOffering;
  employeeId: Pick<Employee, 'id' | 'employeeCode' | 'firstName' | 'lastName'>;
  role: TeachingRole;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface MyTeaching {
  academicYear: Pick<AcademicYear, 'id' | 'name' | 'status'>;
  employee: { id: Id; employeeCode: string; name: string };
  classTeacherOf: Section | null;
  subjects: { assignmentId: Id; role: TeachingRole; since: string; offering: CourseOffering | null }[];
}

export interface Role {
  id: Id;
  key: string;
  name: string;
  isSystem: boolean;
  grantsAll: boolean;
  permissions: string[];
}

export interface VersionedSettings<T> {
  section: string;
  data: T;
  version: number;
}

export interface SettingsMap {
  general: { dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'; weekStartsOn: number; workingDays: number[] };
  labels: Labels;
  structure: {
    usesPrograms: boolean;
    termsPerYear: number;
    maxStudentsPerSection: number;
    rollNumberStrategy: 'ADMISSION_ORDER' | 'MANUAL';
  };
  attendance: { mode: 'DAILY' | 'PERIOD_WISE'; minimumPercentage: number; editableForDays: number };
  assessment: { gradingScheme: 'MARKS' | 'GRADES' | 'CGPA'; passPercentage: number };
  idFormats: { admissionNo: string; employeeCode: string; receiptNo: string };
}

export type SettingsSection = keyof SettingsMap;

/* --------------------------------- Platform (super admin) --------------------------------- */

export interface PlatformAdmin {
  id: Id;
  name: string;
  email: string;
  lastLoginAt?: string;
}

export interface PlatformOverview {
  institutes: number;
  byType: Record<InstituteType, number>;
  byStatus: Record<InstituteStatus, number>;
  newThisMonth: number;
  trialsEndingSoon: number;
  trialsExpired: number;
  students: number;
  staff: number;
}

export interface InstituteContact {
  name: string;
  email: string;
  lastLoginAt: string | null;
}

export interface PlatformInstitute {
  id: Id;
  name: string;
  code: string;
  type: InstituteType;
  status: InstituteStatus;
  trialEndsAt: string | null;
  trialExpired: boolean;
  modules: string[];
  email: string | null;
  phone: string | null;
  city: string | null;
  createdAt: string;
  owner: InstituteContact | null;
  usage: { students: number; staff: number; sections: number; logins: number };
}

export interface PlatformAuditEntry {
  id: Id;
  action: string;
  adminEmail: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  note?: string;
  at: string;
}

export interface PlatformInstituteDetail extends PlatformInstitute {
  timezone: string;
  currency: string;
  address?: { line1?: string; line2?: string; city?: string; state?: string; postalCode?: string; country?: string };
  admins: InstituteContact[];
  academicYears: { id: Id; name: string; status: string; startDate: string; endDate: string; current: boolean }[];
  history: PlatformAuditEntry[];
}

export interface SubscriptionUpdate {
  status?: InstituteStatus;
  trialEndsAt?: string;
  modules?: string[];
  note?: string;
}
