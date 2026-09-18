'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SchoolRegistrationForm } from '@/components/Registrationform/Form';
import { schoolService } from '@/app/services/school.service';
import { useNavigationLoading } from '@/app/context/NavigationLoadingContext';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { ErrorState, LoadingState } from '@/components/StateComponents';

/**
 * Loads one school and hands it to the registration form in edit mode.
 *
 * @param props - The school id.
 * @param props.id - The school being edited.
 * @returns The edit page.
 */
function EditSchoolContent({ id }: { id: string }) {
  const { setIsNavigating } = useNavigationLoading();

  const {
    data: school,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.schools.detail(id),
    queryFn: () => schoolService.getSchool(id),
    staleTime: staleTimes.reference,
  });

  React.useEffect(() => {
    if (!isLoading) setIsNavigating(false);
  }, [isLoading, setIsNavigating]);

  if (isLoading) {
    return <LoadingState message="Loading school details…" />;
  }

  if (error || !school) {
    return (
      <ErrorState error={error} title="School could not be loaded" onRetry={() => void refetch()} />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="w-full bg-gray-200">
        <SchoolRegistrationForm mode="edit" schoolId={id} initialData={school} />
      </main>
    </div>
  );
}

/**
 * Edit-school route. Next hands params as a promise for dynamic segments.
 *
 * @param props - The route params.
 * @param props.params - Resolves to the school id.
 * @returns The page.
 */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <EditSchoolContent id={id} />;
}
