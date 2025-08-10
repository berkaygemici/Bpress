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

export type UserRole = "admin" | "user";

export type User = {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: number;
  isActive: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
  isApproved: boolean;
  parentId?: string; // for reply functionality
};


