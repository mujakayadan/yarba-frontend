/**
 * Download a file from a URL without fetching through JS (avoids CORS on CDN URLs).
 * Cross-origin `download` may open in a new tab instead of forcing a save dialog.
 */
export function triggerUrlDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
