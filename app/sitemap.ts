import type { MetadataRoute } from "next";

// import { source } from "@/lib/source";
// import { getGithubLastEdit } from "fumadocs-core/server";

export const dynamic = "force-dynamic";

export const revalidate = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string): string =>
    new URL(path, "https://notes-dashboard.vercel.app").toString();

  return [
    {
      url: url("/"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
