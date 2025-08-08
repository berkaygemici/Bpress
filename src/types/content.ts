export type GeneratedPost = {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  tags: string[];
  contentHtml: string; // sanitized HTML
  images: string[]; // Firebase Storage URLs
  createdAt: number; // epoch ms
  status: "draft" | "published" | "failed";
};

export type BlogSettings = {
  blogTitle: string;
  topic: string;
  schedule: {
    frequency: "daily" | "weekly";
    time: string; // HH:mm
  };
};


