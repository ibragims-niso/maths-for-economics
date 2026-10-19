export const REPO_URL = 'https://github.com/ibragims-niso/maths-for-economics';
export const REPORT_PROBLEM_URL = `${REPO_URL}/issues/new`;
export const CODE_LICENCE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const CONTENT_LICENCE_URL = `${REPO_URL}/blob/main/content/LICENSE`;

/**
 * Opens the "Error in a topic or question" issue form (.github/ISSUE_TEMPLATE/content-error.yml)
 * with the details filled in, so the exact question can be rebuilt (docs/09, R10).
 */
export function contentErrorUrl(details: {
  title: string;
  topic: string;
  version: string;
  templateId?: string;
  seed?: number;
}): string {
  const query = new URLSearchParams({
    template: 'content-error.yml',
    title: details.title,
    topic: details.topic,
    version: details.version,
    ...(details.templateId ? { template_id: details.templateId } : {}),
    ...(details.seed === undefined ? {} : { seed: String(details.seed) }),
  });
  return `${REPO_URL}/issues/new?${query}`;
}
