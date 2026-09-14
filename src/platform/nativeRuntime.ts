import { Capacitor } from '@capacitor/core';

export const isNativeRuntime = (): boolean => Capacitor.isNativePlatform();

export const getNativePlatform = (): string => Capacitor.getPlatform();
