import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";

// GET - Fetch all memories for the current user
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, payload: null, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const memories = await prisma.memory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, payload: memories });
  } catch (error) {
    console.error("Failed to fetch memories:", error);
    return NextResponse.json(
      { success: false, payload: null, message: "Failed to fetch memories" },
      { status: 500 }
    );
  }
}

// POST - Create a new memory
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, payload: null, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { content, category } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, payload: null, message: "Content is required" },
        { status: 400 }
      );
    }

    const memory = await prisma.memory.create({
      data: {
        content,
        category: category || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, payload: memory });
  } catch (error) {
    console.error("Failed to create memory:", error);
    return NextResponse.json(
      { success: false, payload: null, message: "Failed to create memory" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a memory
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, payload: null, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const memoryId = searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json(
        { success: false, payload: null, message: "Memory ID is required" },
        { status: 400 }
      );
    }

    // Verify the memory belongs to the user
    const memory = await prisma.memory.findFirst({
      where: { id: memoryId, userId: session.user.id },
    });

    if (!memory) {
      return NextResponse.json(
        { success: false, payload: null, message: "Memory not found" },
        { status: 404 }
      );
    }

    await prisma.memory.delete({
      where: { id: memoryId },
    });

    return NextResponse.json({ success: true, payload: null });
  } catch (error) {
    console.error("Failed to delete memory:", error);
    return NextResponse.json(
      { success: false, payload: null, message: "Failed to delete memory" },
      { status: 500 }
    );
  }
}
