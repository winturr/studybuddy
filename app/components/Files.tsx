import type { File } from "@prisma/client";
import FileCard from "@/app/components/FileCard";

export default function Files({ files }: { files: File[] }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {files.map((file: File, i: number) => (
          <FileCard key={i} file={file} />
        ))}
      </div>
    </div>
  );
}
