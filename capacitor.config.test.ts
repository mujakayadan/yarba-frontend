import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from './capacitor.config';

describe('capacitor config', () => {
  it('packages the Vite build under the reserved native app id', () => {
    expect(config.appId).toBe('com.yarba.app');
    expect(config.appName).toBe('Yarba');
    expect(config.webDir).toBe('build');
    expect(config.backgroundColor).toBe('#F7FAFC');
    expect(config.server?.androidScheme).toBe('https');
    expect(config.server?.cleartext).toBe(true);
    expect(config.android?.allowMixedContent).toBe(true);
    expect(config.android?.backgroundColor).toBe('#F7FAFC');
    expect(config.plugins?.CapacitorHttp).toEqual({ enabled: true });
    expect(config.plugins?.SplashScreen).toMatchObject({
      backgroundColor: '#E05B49',
      launchAutoHide: true,
      androidSplashResourceName: 'splash',
    });
    expect(config.plugins?.SystemBars).toMatchObject({
      insetsHandling: 'css',
      style: 'DARK',
      hidden: false,
    });
  });

  it('uses the audited Android and iOS SDK floors', () => {
    const gradle = readFileSync('android/variables.gradle', 'utf8');
    const xcode = readFileSync('ios/App/App.xcodeproj/project.pbxproj', 'utf8');

    expect(gradle).toContain('minSdkVersion = 24');
    expect(gradle).toContain('targetSdkVersion = 36');
    expect(xcode).toContain('IPHONEOS_DEPLOYMENT_TARGET = 16.0');
    expect(xcode).not.toContain('IPHONEOS_DEPLOYMENT_TARGET = 15.0');
  });

  it('ships a branded splash, portrait lock, and light status-bar content', () => {
    const styles = readFileSync('android/app/src/main/res/values/styles.xml', 'utf8');
    const colors = readFileSync('android/app/src/main/res/values/colors.xml', 'utf8');
    const manifest = readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
    const plist = readFileSync('ios/App/App/Info.plist', 'utf8');

    expect(colors).toContain('#E05B49');
    expect(colors).toContain('#8E5C96');
    expect(styles).toContain('@color/header_start');
    expect(styles).toContain('windowLightStatusBar');
    expect(styles).toContain('windowSplashScreenBackground');
    expect(styles).toContain('@drawable/splash_icon');
    expect(manifest).toContain('android:screenOrientation="portrait"');
    expect(manifest).not.toContain('CAMERA');
    expect(manifest).not.toContain('READ_MEDIA');
    expect(manifest).not.toContain('READ_EXTERNAL_STORAGE');
    expect(plist).toContain('UIStatusBarStyleLightContent');
    expect(plist).not.toContain('NSCameraUsageDescription');
    expect(plist).not.toContain('NSPhotoLibraryUsageDescription');
    expect(plist).toMatch(
      /<key>UISupportedInterfaceOrientations<\/key>\s*<array>\s*<string>UIInterfaceOrientationPortrait<\/string>\s*<\/array>/
    );
  });

  it('registers native splash and secure-storage plugins', () => {
    const settings = readFileSync('android/capacitor.settings.gradle', 'utf8');
    const gradle = readFileSync('android/app/capacitor.build.gradle', 'utf8');
    const spm = readFileSync('ios/App/CapApp-SPM/Package.swift', 'utf8');

    expect(settings).toContain("include ':capacitor-splash-screen'");
    expect(settings).toContain('aparajita-capacitor-secure-storage');
    expect(settings).toContain("include ':capacitor-filesystem'");
    expect(settings).toContain("include ':capacitor-share'");
    expect(settings).toContain('capawesome-capacitor-file-picker');
    expect(gradle).toContain("implementation project(':capacitor-splash-screen')");
    expect(gradle).toContain('aparajita-capacitor-secure-storage');
    expect(gradle).toContain("implementation project(':capacitor-filesystem')");
    expect(gradle).toContain("implementation project(':capacitor-share')");
    expect(gradle).toContain('capawesome-capacitor-file-picker');
    expect(spm).toContain('CapacitorSplashScreen');
    expect(spm).toContain('AparajitaCapacitorSecureStorage');
    expect(spm).toContain('CapacitorFilesystem');
    expect(spm).toContain('CapacitorShare');
    expect(spm).toContain('CapawesomeCapacitorFilePicker');
  });
});
