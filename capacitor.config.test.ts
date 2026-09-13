import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from './capacitor.config';

describe('capacitor config', () => {
  it('packages the Vite build under the reserved native app id', () => {
    expect(config.appId).toBe('com.yarba.app');
    expect(config.appName).toBe('Yarba');
    expect(config.webDir).toBe('build');
    expect(config.server?.androidScheme).toBe('https');
  });

  it('uses the audited Android and iOS SDK floors', () => {
    const gradle = readFileSync('android/variables.gradle', 'utf8');
    const xcode = readFileSync('ios/App/App.xcodeproj/project.pbxproj', 'utf8');

    expect(gradle).toContain('minSdkVersion = 24');
    expect(gradle).toContain('targetSdkVersion = 36');
    expect(xcode).toContain('IPHONEOS_DEPLOYMENT_TARGET = 16.0');
    expect(xcode).not.toContain('IPHONEOS_DEPLOYMENT_TARGET = 15.0');
  });
});
