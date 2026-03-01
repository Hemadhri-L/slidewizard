export default function sitemap() {
  return [
    {
      url: "https://slidewizard-nine.vercel.app",
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // Add more URLs here as your site grows
    // {
    //   url: "https://slidewizard-nine.vercel.app/builder",
    //   lastModified: new Date(),
    //   changeFrequency: 'weekly',
    //   priority: 0.9,
    // },
    // {
    //   url: "https://slidewizard-nine.vercel.app/dashboard",
    //   lastModified: new Date(),
    //   changeFrequency: 'weekly',
    //   priority: 0.8,
    // },
  ];
}