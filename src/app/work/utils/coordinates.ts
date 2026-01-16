/**
 * Coordinate calculation utilities for constellation view
 * Maps work experiences to latitude/longitude coordinates
 */

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  duration: string;
  type: string;
  [key: string]: any;
}

export interface NodeCoordinates {
  longitude: number; // X-axis: 0-100% (timeline)
  latitude: number; // Y-axis: 0-100% (experience level)
}

/**
 * Extract year from period string (e.g., "Aug 2023 - Present" → 2023)
 */
export function getYear(period: string): number {
  const match = period.match(/\d{4}/);
  return match ? parseInt(match[0]) : 2020;
}

/**
 * Map year to longitude (0-100%)
 * Normalizes years to X-axis coordinates
 */
export function yearToLongitude(
  year: number,
  minYear: number,
  maxYear: number
): number {
  if (maxYear === minYear) return 50; // Center if all same year
  return ((year - minYear) / (maxYear - minYear)) * 100;
}

/**
 * Map role to latitude based on seniority and type
 * Adjusted for ~3 years industry experience
 */
export function roleToLatitude(
  title: string,
  type: string,
  duration?: string
): number {
  const lowerTitle = title.toLowerCase();
  const lowerType = type.toLowerCase();

  // Internship
  if (lowerType === 'internship' || lowerTitle.includes('intern')) {
    return 10; // 5-15% range
  }

  // Personal projects / sidequests (if type indicates this)
  if (
    lowerType === 'personal' ||
    lowerType === 'sidequest' ||
    lowerType === 'project'
  ) {
    return 18; // 10-25% range
  }

  // Freelance - check if early or has leadership
  if (lowerType === 'freelance') {
    if (
      lowerTitle.includes('lead') ||
      lowerTitle.includes('manager') ||
      lowerTitle.includes('director')
    ) {
      return 45; // 40-50% range - freelance with leadership
    }
    // Early freelance (check duration or year)
    return 28; // 20-35% range
  }

  // Work experience - check seniority and duration
  if (
    lowerTitle.includes('senior') ||
    lowerTitle.includes('lead') ||
    lowerTitle.includes('principal')
  ) {
    return 65; // 60-75% range - future growth
  }
  if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
    return 82; // 75-90% range - future growth
  }

  // Default: mid-level work experience (1-3 years)
  // Check duration if available to fine-tune
  if (duration) {
    const yearsMatch = duration.match(/(\d+)\s*yrs?/);
    const monthsMatch = duration.match(/(\d+)\s*mos?/);
    const totalMonths =
      (yearsMatch ? parseInt(yearsMatch[1]) * 12 : 0) +
      (monthsMatch ? parseInt(monthsMatch[1]) : 0);

    if (totalMonths >= 24) {
      return 50; // 2+ years - solid mid-level (45-55%)
    } else if (totalMonths >= 12) {
      return 45; // 1-2 years - early mid-level (35-50%)
    }
  }

  return 45; // Default mid-level (35-55% range)
}

/**
 * Calculate coordinates for all work experiences
 */
export function calculateCoordinates(
  experiences: WorkExperience[]
): Map<string, NodeCoordinates> {
  // Find min/max years
  const years = experiences.map((exp) => getYear(exp.period));
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const coordinates = new Map<string, NodeCoordinates>();

  experiences.forEach((exp) => {
    const year = getYear(exp.period);
    const longitude = yearToLongitude(year, minYear, maxYear);
    const latitude = roleToLatitude(exp.title, exp.type, exp.duration);

    coordinates.set(exp.id, { longitude, latitude });
  });

  return coordinates;
}
