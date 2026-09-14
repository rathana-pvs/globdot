export const defaultSections = [
  { slug: 'world', name: 'World', color: '#2457ff', sortOrder: 10 },
  { slug: 'politics', name: 'Politics', color: '#6f42c1', sortOrder: 20 },
  { slug: 'business', name: 'Business', color: '#11795b', sortOrder: 30 },
  { slug: 'technology', name: 'Technology', color: '#2457ff', sortOrder: 40 },
  { slug: 'climate', name: 'Climate', color: '#16835f', sortOrder: 50 },
  { slug: 'culture', name: 'Culture', color: '#b64077', sortOrder: 60 },
  { slug: 'security', name: 'Conflict & Security', color: '#c33a31', sortOrder: 70 },
  { slug: 'analysis', name: 'Analysis', color: '#9a6500', sortOrder: 80 },
  { slug: 'video', name: 'Video', color: '#101318', sortOrder: 90 },
] as const;

export const defaultRegions = [
  { slug: 'africa', name: 'Africa', sortOrder: 10 },
  { slug: 'americas', name: 'Americas', sortOrder: 20 },
  { slug: 'asia', name: 'Asia', sortOrder: 30 },
  { slug: 'europe', name: 'Europe', sortOrder: 40 },
  { slug: 'middle-east', name: 'Middle East', sortOrder: 50 },
  { slug: 'oceania', name: 'Oceania', sortOrder: 60 },
] as const;
