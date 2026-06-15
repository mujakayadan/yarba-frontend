/** Build a human-readable resume title from company and job fields. */
export function generateResumeTitle(
  companyName: string | undefined | null,
  jobTitle: string | undefined | null
): string {
  const company = (companyName ?? '').trim();
  const job = (jobTitle ?? '').trim();

  if (!company && !job) {
    return 'My Resume';
  }

  const formattedCompany = company
    ? company
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';
  const formattedJob = job
    ? job
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

  if (formattedCompany && formattedJob) {
    return `${formattedCompany} ${formattedJob}`;
  }
  if (formattedCompany) {
    return formattedCompany;
  }
  return formattedJob;
}
