'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { ArrowLeft, Mail, MapPin, Phone, User } from 'lucide-react';
import { schoolService } from '@/app/services/school.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigationLoading } from '@/app/context/NavigationLoadingContext';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { ErrorState, LoadingState } from '@/components/StateComponents';

/** The image shown when a school has no logo, or its logo fails to load. */
const DEFAULT_SCHOOL_LOGO = '/default-school-logo.svg';

/**
 * A read-only view of one school's full record.
 *
 * @param props - The school id.
 * @param props.id - The school being viewed.
 * @returns The view page.
 */
function ViewSchoolContent({ id }: { id: string }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
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

  const handleEditClick = () => {
    setIsNavigating(true);
    router.push(`/SchoolProfile/${id}`);
  };

  const handleBackClick = () => {
    setIsNavigating(true);
    router.back();
  };

  if (isLoading) {
    return <LoadingState message="Loading school details…" />;
  }

  if (error || !school) {
    return (
      <ErrorState error={error} title="School could not be loaded" onRetry={() => void refetch()} />
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div>
          <h1 className="text-2xl font-bold">School Details</h1>
          <p className="text-muted-foreground">View school information</p>
        </div>

        <Button onClick={handleEditClick} className="bg-[#002244] hover:bg-[#002244]">
          Edit School
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>School Logo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative h-48 w-48">
              <Image
                src={imageError || !school.logo ? DEFAULT_SCHOOL_LOGO : school.logo}
                alt={school.name}
                fill
                className="object-contain"
                onError={() => setImageError(true)}
              />
            </div>
            <Badge
              variant={school.active ? 'default' : 'destructive'}
              className={school.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            >
              {school.active ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">School Name</p>
                <p className="font-medium">{school.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">School Prefix</p>
                <p className="font-medium">{school.schoolPrefix}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{school.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Location</p>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {school.location.state}, {school.location.country}
                  </p>
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm text-muted-foreground">Physical Address</p>
                <p className="font-medium">{school.physicalAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Primary Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {school.primaryContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No primary contacts on file.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {school.primaryContacts.map((contact, index) => (
                  <div key={index} className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{contact.phone}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{contact.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Registration Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {new Date(school.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(school.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * View-school route. Next hands params as a promise for dynamic segments.
 *
 * @param props - The route params.
 * @param props.params - Resolves to the school id.
 * @returns The page.
 */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <ViewSchoolContent id={id} />;
}
