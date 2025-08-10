import { NextResponse } from "next/server";
import { z } from "zod";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

const UpdateCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment is too long"),
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

export async function PUT(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const authUser = await verifyAuthToken(request.headers.get("authorization"));
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { commentId } = params;
    const body = await request.json();
    const { content } = UpdateCommentSchema.parse(body);

    const { db } = getFirebaseAdmin();

    // Get the comment
    const commentDoc = await db.collection("comments").doc(commentId).get();
    if (!commentDoc.exists) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const commentData = commentDoc.data();
    
    // Check if user owns the comment or is admin
    const userDoc = await db.collection("users").doc(authUser.uid).get();
    const userData = userDoc.data();
    
    const isOwner = commentData?.userId === authUser.uid;
    const isAdmin = userData?.role === "admin";
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to edit this comment" }, { status: 403 });
    }

    // Update the comment
    await db.collection("comments").doc(commentId).update({
      content,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating comment:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const authUser = await verifyAuthToken(request.headers.get("authorization"));
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { commentId } = params;
    const { db } = getFirebaseAdmin();

    // Get the comment
    const commentDoc = await db.collection("comments").doc(commentId).get();
    if (!commentDoc.exists) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const commentData = commentDoc.data();
    
    // Check if user owns the comment or is admin
    const userDoc = await db.collection("users").doc(authUser.uid).get();
    const userData = userDoc.data();
    
    const isOwner = commentData?.userId === authUser.uid;
    const isAdmin = userData?.role === "admin";
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to delete this comment" }, { status: 403 });
    }

    // Delete the comment and any replies
    const batch = db.batch();
    
    // Delete the comment itself
    batch.delete(commentDoc.ref);
    
    // Delete any replies to this comment
    const repliesSnapshot = await db
      .collection("comments")
      .where("parentId", "==", commentId)
      .get();
    
    repliesSnapshot.docs.forEach((replyDoc) => {
      batch.delete(replyDoc.ref);
    });
    
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
