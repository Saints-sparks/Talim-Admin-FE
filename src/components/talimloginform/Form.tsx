'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/app/context/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import loginIllustration from '../../../public/Super-Admin.png';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

type LoginError =
  | { kind: 'invalid_credentials' }
  | { kind: 'access_denied'; email: string }
  | { kind: 'unknown'; message: string };

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthContext();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState<LoginError | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await login({ email: values.email, password: values.password });
      router.replace('/talimadmindashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setLoginError({ kind: 'access_denied', email: values.email });
        } else if (err.status === 401) {
          setLoginError({ kind: 'invalid_credentials' });
        } else {
          setLoginError({ kind: 'unknown', message: err.message });
        }
      } else {
        setLoginError({ kind: 'unknown', message: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* ── Left panel ── */}
      <div className="flex flex-col justify-center px-8 py-12 sm:px-16 bg-white">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003366] text-white font-bold text-lg shrink-0">T</div>
            <span className="text-xl font-bold text-[#030E18]">Talim</span>
            <span className="ml-1 rounded-full bg-[#EAF2FB] px-2.5 py-0.5 text-xs font-semibold text-[#003366]">Admin</span>
          </div>

          <h1 className="text-2xl font-bold text-[#030E18]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#6F6F6F]">Sign in to the Talim administrator portal</p>

          {/* RBAC blocked banner */}
          {loginError?.kind === 'access_denied' && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Access denied</p>
                  <p className="mt-1 text-xs text-red-600 leading-relaxed">
                    The account <span className="font-medium">{loginError.email}</span> is not
                    authorised to access the Talim Admin portal. Only Talim administrators
                    can log in here. This access attempt has been logged.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Invalid credentials banner */}
          {loginError?.kind === 'invalid_credentials' && (
            <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-700">
                  Incorrect email or password. Please try again.
                </p>
              </div>
            </div>
          )}

          {/* Unknown error banner */}
          {loginError?.kind === 'unknown' && (
            <div className="mt-6 rounded-xl border border-[#F1F1F1] bg-[#F8F8F8] p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#6F6F6F]" />
                <p className="text-sm text-[#6F6F6F]">{loginError.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-[#030E18]">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@talim.com"
                autoComplete="email"
                disabled={isSubmitting}
                {...register('email')}
                className="h-10 border-[#F1F1F1] bg-[#F8F8F8] focus:border-[#003366] focus:ring-[#003366]"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-[#030E18]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...register('password')}
                  className="h-10 border-[#F1F1F1] bg-[#F8F8F8] pr-10 focus:border-[#003366] focus:ring-[#003366]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#878787] hover:text-[#030E18]"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#003366] hover:bg-[#002244] text-sm font-semibold text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs text-[#878787]">
            © Talim {new Date().getFullYear()} ·{' '}
            <a href="mailto:help@talim.com" className="hover:underline text-[#003366]">help@talim.com</a>
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#003366] p-12">
        <div className="relative w-full max-w-md aspect-square opacity-90">
          <Image
            src={loginIllustration}
            alt="Talim Admin portal illustration"
            fill
            priority
            className="object-contain"
          />
        </div>
        <div className="mt-8 text-center">
          <p className="text-xl font-bold text-white">Talim Administrator Portal</p>
          <p className="mt-2 text-sm text-white/70 max-w-xs leading-relaxed">
            Manage schools, users, and platform settings from one central place.
          </p>
        </div>
        {/* Decorative dots */}
        <div className="mt-10 flex gap-2">
          <div className="h-2 w-8 rounded-full bg-white/60" />
          <div className="h-2 w-2 rounded-full bg-white/30" />
          <div className="h-2 w-2 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}
