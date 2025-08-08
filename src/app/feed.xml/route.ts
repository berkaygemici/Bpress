import { NextResponse } from "next/server";
import { fetchPublishedPostsViaREST } from "@/services/firestoreRest";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const posts = await fetchPublishedPostsViaREST(50);
  const items = posts
    .map((p) => `
      <item>
        <title><![CDATA[${p.title}]]></title>
        <link>${baseUrl}/blog/${p.slug}</link>
        <description><![CDATA[${p.metaDescription || ""}]]></description>
        <guid isPermaLink="true">${baseUrl}/blog/${p.slug}</guid>
        <pubDate>${new Date(Number(p.createdAt || Date.now())).toUTCString()}</pubDate>
      </item>
    `)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>${process.env.NEXT_PUBLIC_SITE_URL ? new URL(baseUrl).hostname : "AI Blog"}</title>
      <link>${baseUrl}</link>
      <description>AI-generated blog feed</description>
      ${items}
    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=UTF-8" },
  });
}


