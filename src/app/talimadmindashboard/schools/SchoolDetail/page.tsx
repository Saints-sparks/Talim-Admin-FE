// Talim-Admin-FE\src\app\talimadmindashboard\schools\SchoolDetail\page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SchoolDetails from "@/components/schools/SchoolDetails";

const SchoolDetailContent = () => {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("id"); // Get school ID from query params

  if (!schoolId) {
    return <p className="text-red-500">Invalid School ID.</p>;
  }

  return <SchoolDetails schoolId={schoolId} />;
};

const SchoolDetailPage = () => {
  return (
    <Suspense fallback={<p>Loading school details...</p>}>
      <SchoolDetailContent />
    </Suspense>
  );
};

export default SchoolDetailPage;
