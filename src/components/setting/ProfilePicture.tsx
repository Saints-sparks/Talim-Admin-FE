'use client';

import { useRef, useState, useTransition } from 'react';
import { Camera, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/app/context/AuthContext';
import { profileService } from '@/app/services/profile.service';
import { validateImageFile } from '@/app/services/upload.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/apiError';

/**
 * Up to two initials for the avatar fallback.
 *
 * @param firstName - The user's first name, if known.
 * @param lastName - The user's last name, if known.
 * @param email - The user's email, as a last resort.
 * @returns The initials to show.
 */
const getInitials = (firstName?: string, lastName?: string, email?: string): string => {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return 'TA';
};

/**
 * The signed-in administrator's avatar, with upload and removal.
 *
 * @returns The profile picture card.
 */
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

    const problem = validateImageFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    startTransition(async () => {
      try {
        const res = await profileService.uploadAvatar(file);
        updateUser({ userAvatar: res.userAvatar });
        setPreview(null);
        toast.success('Profile picture updated');
      } catch (error) {
        setPreview(null);
        toast.error('The picture could not be uploaded', { description: getErrorMessage(error) });
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
    } catch (error) {
      toast.error('The picture could not be removed', { description: getErrorMessage(error) });
    } finally {
      setIsRemoving(false);
    }
  };

  const isLoading = isPending || isRemoving;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
      <div className="relative shrink-0">
        <Avatar className="h-28 w-28 shadow-md ring-4 ring-white">
          <AvatarImage src={currentAvatar ?? undefined} alt="Profile picture" />
          <AvatarFallback className="bg-[#EAF2FB] text-2xl font-bold text-[#003366]">
            {initials}
          </AvatarFallback>
        </Avatar>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isLoading}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#003366] text-white shadow-md transition-colors hover:bg-[#002244] disabled:opacity-60"
          aria-label="Change photo"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h2 className="text-xl font-bold text-[#030E18]">
          {user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : (user?.email ?? 'Talim Admin')}
        </h2>
        <p className="text-sm capitalize text-[#6F6F6F]">
          {user?.role?.replace(/_/g, ' ') ?? 'Administrator'}
        </p>
        <p className="text-xs text-[#878787]">{user?.email}</p>

        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-[#D7E6F6] text-xs text-[#003366] hover:border-[#D7E6F6] hover:bg-[#EAF2FB]"
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

        <p className="mt-1 text-xs text-[#878787]">JPG, PNG, GIF or WebP · max 5 MB</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        aria-label="Upload profile picture"
        className="hidden"
        onChange={handleFileChange}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = '';
        }}
      />
    </div>
  );
}
