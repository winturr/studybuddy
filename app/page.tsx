import Default from "./templates/Default";
import FormChat from "./components/forms/FormChat";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/authOptions";
import { getFilesByUser } from "./lib/actions/file";
import Files from "./components/Files";
import Link from "next/link";

export default async function Home() {
  const session = (await getServerSession(authOptions)) ?? null;

  let files: any = [];
  if (session) {
    const resFiles = await getFilesByUser(session.user.id);
    files = resFiles?.success ? resFiles.payload : [];
  }

  return (
    <Default>
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 text-center py-2 sm:py-4 px-4">
          <span className="bg-clip-text text-transparent text-3xl sm:text-5xl font-thin bg-green-500">
            TERMINAL_ACCESS_{session?.user?.name?.toUpperCase() || "GUEST"}
          </span>
          <p className=" mt-1 sm:mt-2 text-sm sm:text-base text-green-600">
            {session
              ? "Welcome back! Your personalized study assistant is ready."
              : "Create an account and log in to access your personalized study assistant."}
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <FormChat />
        </div>
      </div>
    </Default>
  );
}
