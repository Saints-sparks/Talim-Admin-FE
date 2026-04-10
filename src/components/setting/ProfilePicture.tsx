'use client';

import { useRef, useState, useTransition } from 'react';
import { Camera, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/app/context/AuthContext';
import { profileService } from '@/app/services/profile.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const getInitials = (firstName?: string, lastName?: string, email?: string) => {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return 'TA';
};

export default function ProfilePicture() {
  const { user, updateUser } = useAuthContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRemoving, setIsRemoving] = useState(false);

  const currentAvatar = preview ?? user?.userAvatar ?? null;
  const initials = getInitials(user?.firstName, user?.lastName, user?.email);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload in background
    startTransition(async () => {
      try {
        const res = await profileService.uploadAvatar(file);
        updateUser({ userAvatar: res.userAvatar });
        setPreview(null);
        toast.success('Profile picture updated');
      } catch {
        setPreview(null);
        toast.error('Failed to upload picture. Please try again.');
      }
    });
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await profileService.removeAvatar();
      updateUser({ userAvatar: undefined });
      setPreview(null);
      toast.success('Profile picture removed');
    } catch {
      toast.error('Failed to remove picture. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };

  const isLoading = isPending || isRemoving;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-28 w-28 ring-4 ring-white shadow-lg">
          <AvatarImage src={currentAvatar ?? undefined} alt="Profile picture" />
          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Camera badge */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isLoading}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
          aria-label="Change photo"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Info + actions */}
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h2 className="text-xl font-semibold text-slate-900">
          {user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.email ?? 'Talim Admin'}
        </h2>
        <p className="text-sm text-slate-500 capitalize">{user?.role?.replace('_', ' ') ?? 'Administrator'}</p>
        <p className="text-xs text-slate-400">{user?.email}</p>

        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={() => fileRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="h-3.5 w-3.5" />
            {isPending ? 'Uploading…' : 'Upload photo'}
          </Button>

          {currentAvatar && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleRemove}
              disabled={isLoading}
            >
              {isRemoving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Remove
            </Button>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-1">JPG, PNG or GIF · max 5 MB</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = '';
        }}
      />
    </div>
  );
}
