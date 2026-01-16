import { MetadataRoute } from 'next';
import { getAllDemonstrations } from '@/lib/markdown';

export default function sitemap(): MetadataRoute.Sitemap {
  const demonstrations = getAllDemonstrations();
  
  const demonstrationUrls = demonstrations.map((demo) => ({
    url: `https://www.obrienandson.com/demonstrations/${demo.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://www.obrienandson.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://www.obrienandson.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://www.obrienandson.com/demonstrations',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://www.obrienandson.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...demonstrationUrls,
  ];
}