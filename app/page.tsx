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
        <div className="flex-1 min-h-0 overflow-hidden">
          <FormChat
            userName={session?.user?.name || null}
            isLoggedIn={!!session}
          />
        </div>
      </div>
    </Default>
  );
}
