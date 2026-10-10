import { SEARCH_PARAMS_KEYS } from '@/config/app.config';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getAssetPath(name) {
  return `/assets/${name}`;
}

export const getEncodedRedirectUrl = (next) => {
  return `${SEARCH_PARAMS_KEYS.NEXT_REDIRECT}=${encodeURIComponent(
    next || '/'
  )}`;
};

export function getDefaultProfile(initials) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${initials}`;
}

// UI convenience only - the backend enforces the HOTEL_MANAGER role on every /admin/** route.
export const isAdmin = (user) =>
  Array.isArray(user?.roles) && user.roles.includes('HOTEL_MANAGER');

// Only allow redirecting to a same-site path (blocks "https://evil.com" / "//evil.com" in ?next=).
export const getSafeRedirect = (next) =>
  typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
    ? next
    : null;

export const formatCurrency = (value) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? '—'
    : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
