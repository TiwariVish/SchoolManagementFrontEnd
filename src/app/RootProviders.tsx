import { Outlet } from 'react-router-dom';
import { AcademicYearProvider } from './AcademicYearProvider';
import { AuthProvider } from './AuthProvider';

/** Keeps auth inside the router tree so route HMR never loses the context provider. */
export function RootProviders() {
  return (
    <AuthProvider>
      <AcademicYearProvider>
        <Outlet />
      </AcademicYearProvider>
    </AuthProvider>
  );
}
