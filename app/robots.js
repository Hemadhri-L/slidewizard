export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://slidewizard-nine.vercel.app/sitemap.xml",
  };
}