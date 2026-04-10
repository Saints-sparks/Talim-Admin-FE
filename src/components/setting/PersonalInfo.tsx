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

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phoneNumber: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const Field = ({
  icon: Icon,
  label,
  value,
  editing,
  name,
  register,
  error,
  type = 'text',
  readOnly,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  editing: boolean;
  name: keyof FormValues;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  error?: string;
  type?: string;
  readOnly?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <Label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Label>
    {editing && !readOnly ? (
      <div>
        <Input
          {...register(name)}
          type={type}
          className="h-9 text-sm border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    ) : (
      <p className="text-sm font-medium text-slate-800">{value || '—'}</p>
    )}
  </div>
);

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
      const updated = await profileService.updateProfile(values);
      updateUser(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile. Please try again.');
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
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Personal Information</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manage your account details</p>
        </div>
        {!isEditing ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
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
              className="gap-1 text-xs text-slate-500"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700"
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

      {/* Fields */}
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
        <Field
          icon={User}
          label="First Name"
          value={user?.firstName}
          editing={isEditing}
          name="firstName"
          register={register}
          error={errors.firstName?.message}
        />
        <Field
          icon={User}
          label="Last Name"
          value={user?.lastName}
          editing={isEditing}
          name="lastName"
          register={register}
          error={errors.lastName?.message}
        />
        <Field
          icon={Mail}
          label="Email Address"
          value={user?.email}
          editing={false}
          readOnly
          name="firstName"
          register={register}
        />
        <Field
          icon={Phone}
          label="Phone Number"
          value={user?.phoneNumber}
          editing={isEditing}
          name="phoneNumber"
          register={register}
          type="tel"
        />
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <Briefcase className="h-3.5 w-3.5" />
            Role
          </Label>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 capitalize font-medium text-xs">
              {user?.role?.replace(/_/g, ' ') ?? 'Administrator'}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Account Status
          </Label>
          <div className="flex items-center gap-2">
            {user?.isEmailVerified ? (
              <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100 font-medium text-xs">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100 font-medium text-xs">
                <XCircle className="h-3 w-3" />
                Unverified
              </Badge>
            )}
            {user?.isActive && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-medium text-xs">
                Active
              </Badge>
            )}
          </div>
        </div>
        {joinedDate && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
              <Calendar className="h-3.5 w-3.5" />
              Member Since
            </Label>
            <p className="text-sm font-medium text-slate-800">{joinedDate}</p>
          </div>
        )}
      </div>
    </div>
  );
}
