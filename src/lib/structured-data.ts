/**
 * JSON-LD structured data builders.
 *
 * These power both classic SEO (rich results) and GEO / "Generative Engine
 * Optimization" — they give LLM-based search engines (ChatGPT, Perplexity,
 * Google AI Overviews, Gemini) clean, quotable facts about the academy,
 * the lecturer and each free course.
 */

import { SITE, SITE_URL, ROUTES } from '../data/site';
import { COURSES, FAQ, LECTURER, courseAnchorId } from '../data/content';

const abs = (path: string) => new URL(path, SITE_URL).href;

const orgId = `${SITE_URL}#organization`;
const personId = `${SITE_URL}#lecturer`;

/** EducationalOrganization — the academy itself. */
export function organizationSchema() {
  return {
    '@type': 'EducationalOrganization',
    '@id': orgId,
    name: SITE.name,
    alternateName: 'AI Academy',
    url: SITE_URL,
    email: SITE.email,
    description: SITE.description,
    slogan: SITE.tagline,
    logo: abs(SITE.ogImage),
    image: abs(SITE.ogImage),
    areaServed: { '@type': 'City', name: SITE.city },
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      addressCountry: SITE.country,
    },
    founder: { '@id': personId },
    sameAs: [] as string[],
  };
}

/** Person — Radoslav Dodnikov, the lecturer. */
export function personSchema() {
  return {
    '@type': 'Person',
    '@id': personId,
    name: LECTURER.name,
    jobTitle: 'Software Engineer',
    description: LECTURER.bio.join(' '),
    image: abs('/assets/lecturer-photo.png'),
    worksFor: { '@type': 'Organization', name: 'SAP' },
    affiliation: [
      { '@type': 'Organization', name: 'SAP' },
      { '@type': 'CollegeOrUniversity', name: 'УНСС (Университет за национално и световно стопанство)' },
    ],
    knowsAbout: [
      'Generative AI',
      'Natural Language Processing',
      'Vibe coding',
      'Уеб разработка',
      'Java',
      'Spring',
    ],
    hasCredential: LECTURER.tags,
  };
}

/** One Course per program, marked as free (price 0) and held in Sofia. */
export function courseSchemas() {
  return COURSES.map((c) => ({
    '@type': 'Course',
    '@id': `${SITE_URL}/#${courseAnchorId(c.id)}`,
    name: c.title,
    description: c.desc,
    url: `${SITE_URL}/#${courseAnchorId(c.id)}`,
    inLanguage: 'bg',
    isAccessibleForFree: true,
    teaches: c.topics,
    provider: { '@id': orgId },
    educationalLevel: 'Beginner',
    courseMode: 'Onsite',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BGN',
      availability: 'https://schema.org/InStock',
      category: 'Free',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Onsite',
      courseWorkload: 'PT3H',
      inLanguage: 'bg',
      location: {
        '@type': 'Place',
        name: 'София',
        address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressCountry: SITE.country },
      },
      instructor: { '@id': personId },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BGN' },
    },
  }));
}

/** FAQPage — gives AI engines direct question→answer pairs to quote. */
export function faqSchema() {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE.name,
    description: SITE.description,
    inLanguage: 'bg',
    publisher: { '@id': orgId },
  };
}

/** BreadcrumbList for the legal sub-pages. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

/** Combine any number of schema objects into one @graph document. */
export function graph(...nodes: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}

export { ROUTES };
