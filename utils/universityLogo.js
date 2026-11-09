import {
  MOBILE_API_URL,
  SERVER_URL,
} from '../config/api';

/**
 * Universities own their uploaded logos. The university record is supplied by
 * Laravel, and the API streams the file referenced by universities.logo.
 *
 * Build the URL against the configured API server rather than trusting a host
 * generated behind Railway's reverse proxy (which may be HTTP or internal).
 * No school-specific or bundled image is used here.
 */
export function getUniversityLogoUri(university) {
  if (!university || typeof university !== 'object') {
    return null;
  }

  const logo = String(university.logo ?? '').trim();
  const logoUrl = String(university.logo_url ?? '').trim();
  const universityId = String(university.id ?? '').trim();

  if (/^https?:\/\//i.test(logo)) {
    // Administrators may configure an external image URL in the database.
    return logo;
  }

  if (universityId && (logo || logoUrl)) {
    // Laravel looks up this university and its logo path in the database.
    const version = university.logo_updated_at ?? university.updated_at;
    const suffix = version
      ? `?v=${encodeURIComponent(String(version))}`
      : '';

    return `${MOBILE_API_URL}/universities/${encodeURIComponent(universityId)}/logo${suffix}`;
  }

  if (/^https?:\/\//i.test(logoUrl)) {
    return logoUrl;
  }

  if (logoUrl.startsWith('/')) {
    return `${SERVER_URL}${logoUrl}`;
  }

  return null;
}
