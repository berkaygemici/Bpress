import { NextResponse } from "next/server";
import { z } from "zod";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { Comment } from "@/types/content";

const CreateCommentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  content: z.string().min(1, "Comment content is required").max(1000, "Comment is too long"),
  parentId: z.string().optional(),
});

const GetCommentsSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
});

async function verifyAuthToken(authHeader: string | null): Promise<{ uid: string; email: string } | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    const { app } = getFirebaseAdmin();
    const auth = getAuth(app);
    const decodedToken = await auth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const { db } = getFirebaseAdmin();
    
    // Get all approved comments for the post
    // Note: Using simpler query to avoid composite index requirement
    const commentsSnapshot = await db
      .collection("comments")
      .where("postId", "==", postId)
      .where("isApproved", "==", true)
      .get();

    const comments: Comment[] = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Comment, "id">
    })).sort((a, b) => a.createdAt - b.createdAt); // Sort by creation time

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await verifyAuthToken(request.headers.get("authorization"));
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { postId, content, parentId } = CreateCommentSchema.parse(body);

    const { db } = getFirebaseAdmin();

    // Verify the post exists
    const postDoc = await db.collection("posts").doc(postId).get();
    if (!postDoc.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get user info
    const userDoc = await db.collection("users").doc(authUser.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    if (!userData?.isActive) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
    }

    // If this is a reply, verify the parent comment exists
    if (parentId) {
      const parentDoc = await db.collection("comments").doc(parentId).get();
      if (!parentDoc.exists) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    }

    const newComment: Omit<Comment, "id"> = {
      postId,
      userId: authUser.uid,
      userName: userData.displayName || userData.email || "Anonymous",
      userEmail: userData.email || "",
      content,
      createdAt: Date.now(),
      isApproved: true, // Auto-approve for now, you can add moderation later
      ...(parentId && { parentId }),
    };

    const commentRef = await db.collection("comments").add(newComment);
    
    const comment: Comment = {
      id: commentRef.id,
      ...newComment,
    };

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
