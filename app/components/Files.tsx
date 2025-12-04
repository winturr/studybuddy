import type { File } from "@prisma/client";
import FileCard from "@/app/components/FileCard";

export default function Files({ files }: { files: File[] }) {
  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 md:grid-cols-4 sm:gap-3 sm:overflow-visible">
        {files.map((file: File, i: number) => (
          <FileCard key={i} file={file} />
        ))}
      </div>
    </div>
  );
}
