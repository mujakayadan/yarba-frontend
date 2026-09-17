import { AppLauncher } from '@capacitor/app-launcher';
import { Browser } from '@capacitor/browser';
import { isNativeRuntime } from '../platform/nativeRuntime';

export const APP_URL_SCHEME = 'com.yarba.app';

const APP_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'yarba.app',
  'www.yarba.app',
  'yarba-frontend.vercel.app',
]);

const AUTH_ONLY_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/callback',
]);

export type ClassifiedUrl =
  | { kind: 'internal'; href: string; path: string }
  | { kind: 'oauth'; href: string; path: string }
  | { kind: 'external'; href: string }
  | { kind: 'mailto'; href: string }
  | { kind: 'tel'; href: string }
  | { kind: 'invalid' };

export type LocationLike = {
  pathname: string;
  search?: string;
  hash?: string;
};

const isOauthPath = (path: string): boolean => {
  const pathname = path.split(/[?#]/, 1)[0] ?? path;
  return pathname === '/auth/callback' || pathname.startsWith('/oauth/');
};

const withSearchAndHash = (pathname: string, url: URL): string =>
  `${pathname}${url.search}${url.hash}`;

const customSchemePath = (url: URL): string => {
  const host = url.hostname;
  const pathname = url.pathname || '/';
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return withSearchAndHash(path === '' ? '/' : path, url);
  }
  const combined = `/${host}${pathname === '/' ? '' : pathname}`.replace(/\/{2,}/g, '/');
  return withSearchAndHash(combined, url);
};

export const classifyUrl = (
  href: string,
  currentOrigin: string = typeof window === 'undefined'
    ? 'https://localhost'
    : window.location.origin
): ClassifiedUrl => {
  const trimmed = href.trim();
  if (!trimmed) {
    return { kind: 'invalid' };
  }

  let url: URL;
  try {
    url = new URL(trimmed, currentOrigin);
  } catch {
    return { kind: 'invalid' };
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol === 'mailto:') {
    return { kind: 'mailto', href: url.href };
  }
  if (protocol === 'tel:') {
    return { kind: 'tel', href: url.href };
  }
  if (protocol === `${APP_URL_SCHEME}:`) {
    const path = customSchemePath(url);
    const kind = isOauthPath(path) ? 'oauth' : 'internal';
    return { kind, href: url.href, path };
  }
  if (protocol !== 'http:' && protocol !== 'https:') {
    return { kind: 'invalid' };
  }

  if (!APP_HOSTS.has(url.hostname.toLowerCase())) {
    return { kind: 'external', href: url.href };
  }

  const path = withSearchAndHash(url.pathname || '/', url);
  const kind = isOauthPath(path) ? 'oauth' : 'internal';
  return { kind, href: url.href, path };
};

export const toInAppPath = (classified: ClassifiedUrl): string | null => {
  if (classified.kind !== 'internal' && classified.kind !== 'oauth') {
    return null;
  }
  return classified.path;
};

export const isSafeInAppPath = (path: string | null | undefined): path is string =>
  Boolean(path && path.startsWith('/') && !path.startsWith('//'));

export const locationToPath = (location: LocationLike | null | undefined): string | null => {
  if (!location?.pathname) {
    return null;
  }
  return `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`;
};

export const resolvePostAuthPath = ({
  setupRoute,
  intendedPath,
  fallback = '/dashboard',
}: {
  setupRoute?: string | null;
  intendedPath?: string | null;
  fallback?: string;
}): string => {
  if (isSafeInAppPath(setupRoute) && setupRoute.startsWith('/user/setup')) {
    return setupRoute;
  }
  if (isSafeInAppPath(intendedPath)) {
    const pathname = intendedPath.split(/[?#]/, 1)[0] ?? intendedPath;
    if (!AUTH_ONLY_PATHS.has(pathname)) {
      return intendedPath;
    }
  }
  if (isSafeInAppPath(setupRoute)) {
    return setupRoute;
  }
  return fallback;
};

export const openClassifiedUrl = async (classified: ClassifiedUrl): Promise<void> => {
  switch (classified.kind) {
    case 'invalid':
    case 'internal':
    case 'oauth':
      return;
    case 'external':
      if (isNativeRuntime()) {
        await Browser.open({ url: classified.href });
        return;
      }
      window.open(classified.href, '_blank', 'noopener,noreferrer');
      return;
    case 'mailto':
    case 'tel':
      if (isNativeRuntime()) {
        await AppLauncher.openUrl({ url: classified.href });
        return;
      }
      window.location.assign(classified.href);
  }
};

export const openUrl = async (href: string): Promise<void> => {
  await openClassifiedUrl(classifyUrl(href));
};
