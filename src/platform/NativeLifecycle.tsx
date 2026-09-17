import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { queryClient } from '../providers/QueryProvider';
import { subscribeToAppResume } from './appLifecycle';
import { hideNativeSplash } from './nativeShell';
import { isCurrentlyOnline } from './networkStatus';

export const NativeLifecycle: React.FC = () => {
  const { loading } = useAuth();
  const readyRef = useRef(false);

  useEffect(() => {
    if (!loading) {
      readyRef.current = true;
      void hideNativeSplash();
    }
  }, [loading]);

  useEffect(() => {
    return subscribeToAppResume(() => {
      if (!readyRef.current || !isCurrentlyOnline()) {
        return;
      }
      void queryClient.invalidateQueries();
    });
  }, []);

  return null;
};
