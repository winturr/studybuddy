import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { getFilesByUser } from "@/app/lib/actions/file";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, payload: null, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await getFilesByUser(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { success: false, payload: null, message: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
