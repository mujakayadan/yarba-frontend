import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { isNativeRuntime } from './nativeRuntime';
import { classifyUrl, openClassifiedUrl, toInAppPath } from '../utils/openUrl';
import { pathFromAppUrl } from './nativeDeepLinks';

const anchorFromEvent = (event: MouseEvent): HTMLAnchorElement | null => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return null;
  }
  return target.closest('a');
};

export const NativeUrlHandlers: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeRuntime()) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = anchorFromEvent(event);
      if (!anchor?.href || anchor.hasAttribute('download')) {
        return;
      }

      const classified = classifyUrl(anchor.href);
      const inAppPath = toInAppPath(classified);
      if (inAppPath) {
        event.preventDefault();
        navigate(inAppPath);
        return;
      }
      if (
        classified.kind === 'external' ||
        classified.kind === 'mailto' ||
        classified.kind === 'tel'
      ) {
        event.preventDefault();
        void openClassifiedUrl(classified);
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);

  useEffect(() => {
    if (!isNativeRuntime()) {
      return;
    }

    let listener: PluginListenerHandle | undefined;
    let cancelled = false;

    const listen = async () => {
      listener = await App.addListener('appUrlOpen', (event) => {
        const path = pathFromAppUrl(event.url);
        if (path) {
          navigate(path);
        }
      });
      if (cancelled) {
        await listener.remove();
      }
    };

    void listen();
    return () => {
      cancelled = true;
      void listener?.remove();
    };
  }, [navigate]);

  return null;
};
