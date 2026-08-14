const APPLE_SDK_URL =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
const APPLE_SDK_SCRIPT_ID = 'apple-sign-in-sdk';

interface AppleAuthConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state: string;
  nonce: string;
  usePopup: boolean;
}

interface AppleAuthorization {
  id_token: string;
  state?: string;
}

interface AppleUserPayload {
  name?: {
    firstName?: string;
    lastName?: string;
  };
}

interface AppleSignInResponse {
  authorization: AppleAuthorization;
  user?: AppleUserPayload;
}

interface AppleAuthApi {
  init: (config: AppleAuthConfig) => void;
  signIn: () => Promise<AppleSignInResponse>;
}

interface AppleIdApi {
  auth: AppleAuthApi;
}

declare global {
  interface Window {
    AppleID?: AppleIdApi;
  }
}

export interface AppleOAuthResult {
  idToken: string;
  displayName?: string;
}

export class ProviderPopupCancelledError extends Error {
  constructor(providerName: string) {
    super(`${providerName} sign-in was cancelled.`);
    this.name = 'ProviderPopupCancelledError';
  }
}

export class OAuthStateMismatchError extends Error {
  constructor() {
    super('Provider sign-in could not be verified. Please try again.');
    this.name = 'OAuthStateMismatchError';
  }
}

let appleSdkPromise: Promise<AppleIdApi> | null = null;

const getAppleSdk = (): AppleIdApi | null => window.AppleID ?? null;

export const loadAppleJsSdk = (): Promise<AppleIdApi> => {
  const loadedSdk = getAppleSdk();
  if (loadedSdk) {
    return Promise.resolve(loadedSdk);
  }
  if (appleSdkPromise) {
    return appleSdkPromise;
  }

  appleSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`#${APPLE_SDK_SCRIPT_ID}`);
    const script = existingScript ?? document.createElement('script');

    const handleLoad = () => {
      const sdk = getAppleSdk();
      if (sdk) {
        resolve(sdk);
      } else {
        appleSdkPromise = null;
        reject(new Error('Apple sign-in is unavailable. Please try again.'));
      }
    };
    const handleError = () => {
      appleSdkPromise = null;
      reject(new Error('Unable to load Apple sign-in. Please check your connection.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existingScript) {
      script.id = APPLE_SDK_SCRIPT_ID;
      script.src = APPLE_SDK_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return appleSdkPromise;
};

export const sha256Hex = async (value: string): Promise<string> => {
  const encodedValue = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encodedValue);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const createOAuthState = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const readAppleErrorCode = (error: unknown): string | null => {
  if (typeof error !== 'object' || error === null || !('error' in error)) {
    return null;
  }
  return typeof error.error === 'string' ? error.error : null;
};

const isAppleCancellation = (error: unknown): boolean => {
  const code = readAppleErrorCode(error);
  return (
    code === 'popup_closed_by_user' || code === 'user_cancelled_authorize' || code === 'cancelled'
  );
};

const getDisplayName = (user?: AppleUserPayload): string | undefined => {
  const displayName = [user?.name?.firstName, user?.name?.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim())
    .join(' ');
  return displayName || undefined;
};

export const signInWithApple = async ({
  rawNonce,
  clientId,
  redirectUri,
}: {
  rawNonce: string;
  clientId: string;
  redirectUri: string;
}): Promise<AppleOAuthResult> => {
  const [appleSdk, nonce] = await Promise.all([loadAppleJsSdk(), sha256Hex(rawNonce)]);
  const state = createOAuthState();
  appleSdk.auth.init({
    clientId,
    scope: 'name email',
    redirectURI: redirectUri,
    state,
    nonce,
    usePopup: true,
  });

  try {
    const response = await appleSdk.auth.signIn();
    if (response.authorization.state !== state) {
      throw new OAuthStateMismatchError();
    }
    return {
      idToken: response.authorization.id_token,
      displayName: getDisplayName(response.user),
    };
  } catch (error: unknown) {
    if (isAppleCancellation(error)) {
      throw new ProviderPopupCancelledError('Apple');
    }
    throw error;
  }
};
