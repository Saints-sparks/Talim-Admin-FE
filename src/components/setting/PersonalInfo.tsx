'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Pencil,
  X,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/app/context/AuthContext';
import { profileService } from '@/app/services/profile.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getErrorMessage } from '@/lib/apiError';

/** Client validation mirroring `UpdateProfileDto` (name required, max 80 chars, phone optional). */
const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(80),
  lastName: z.string().min(1, 'Last name is required').max(80),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

/** A read-only fact shown outside edit mode. */
const StaticField = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) => (
  <div className="flex flex-col gap-1.5">
    <Label className="flex items-center gap-1.5 text-xs font-medium text-[#6F6F6F] uppercase tracking-wide">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Label>
    <p className="text-sm font-semibold text-[#030E18]">{value || '—'}</p>
  </div>
);

/** An editable field, rendered as text outside edit mode. */
const EditableField = ({
  icon: Icon,
  label,
  value,
  editing,
  name,
  register,
  error,
  type = 'text',
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  editing: boolean;
  name: keyof FormValues;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  error?: string;
  type?: string;
}) =>
  editing ? (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={name}
        className="flex items-center gap-1.5 text-xs font-medium text-[#6F6F6F] uppercase tracking-wide"
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Label>
      <Input
        id={name}
        {...register(name)}
        type={type}
        aria-invalid={Boolean(error)}
        className="h-9 border-[#F1F1F1] bg-[#F8F8F8] text-sm focus:border-[#003366] focus:ring-[#003366]"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ) : (
    <StaticField icon={Icon} label={label} value={value} />
  );

/**
 * The signed-in administrator's own editable profile: name and phone, plus
 * read-only account facts.
 *
 * @returns The personal information card.
 */
export default function PersonalInfo() {
  const { user, updateUser } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phoneNumber: user?.phoneNumber ?? '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phoneNumber: user.phoneNumber ?? '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      const updated = await profileService.updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
      });
      updateUser(updated);
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('The profile could not be updated', { description: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="rounded-xl border border-[#F1F1F1] bg-white">
      <div className="flex items-center justify-between border-b border-[#F1F1F1] px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-[#030E18]">Personal Information</h3>
          <p className="mt-0.5 text-xs text-[#6F6F6F]">Manage your account details</p>
        </div>
        {!isEditing ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-[#D7E6F6] text-xs text-[#003366] hover:bg-[#EAF2FB]"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-xs text-[#6F6F6F] hover:text-[#030E18]"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-[#003366] text-xs text-white hover:bg-[#002244]"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
        <EditableField
          icon={User}
          label="First Name"
          value={user?.firstName}
          editing={isEditing}
          name="firstName"
          register={register}
          error={errors.firstName?.message}
        />
        <EditableField
          icon={User}
          label="Last Name"
          value={user?.lastName}
          editing={isEditing}
          name="lastName"
          register={register}
          error={errors.lastName?.message}
        />
        <StaticField icon={Mail} label="Email Address" value={user?.email} />
        <EditableField
          icon={Phone}
          label="Phone Number"
          value={user?.phoneNumber}
          editing={isEditing}
          name="phoneNumber"
          register={register}
          error={errors.phoneNumber?.message}
          type="tel"
        />
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-[#6F6F6F] uppercase tracking-wide">
            <Briefcase className="h-3.5 w-3.5" />
            Role
          </Label>
          <div className="flex items-center gap-2">
            <Badge className="border-0 bg-[#EAF2FB] text-xs font-medium capitalize text-[#003366]">
              {user?.role?.replace(/_/g, ' ') ?? 'Administrator'}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-[#6F6F6F] uppercase tracking-wide">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Account Status
          </Label>
          <div className="flex items-center gap-2">
            {user?.isEmailVerified ? (
              <Badge className="gap-1 border-0 bg-emerald-50 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge className="gap-1 border-0 bg-amber-50 text-xs font-medium text-amber-700">
                <XCircle className="h-3 w-3" />
                Unverified
              </Badge>
            )}
            {user?.isActive && (
              <Badge className="border-0 bg-emerald-50 text-xs font-medium text-emerald-700">
                Active
              </Badge>
            )}
          </div>
        </div>
        {joinedDate && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-[#6F6F6F] uppercase tracking-wide">
              <Calendar className="h-3.5 w-3.5" />
              Member Since
            </Label>
            <p className="text-sm font-semibold text-[#030E18]">{joinedDate}</p>
          </div>
        )}
      </div>
    </div>
  );
}
