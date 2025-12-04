"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import type { File } from "@prisma/client";
import Modal from "@/app/components/Modal";
import { format } from "date-fns";

export default function FileCard({ file }: { file: File }) {
  // State
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        title={file.name}
        className="group relative bg-neutral-900 p-2 sm:p-3 border border-green-600/50 overflow-hidden hover:border-green-500 hover:bg-neutral-800 transition-all cursor-pointer flex flex-row sm:flex-col items-center sm:items-stretch gap-2 sm:gap-2 shrink-0 min-w-[140px] sm:min-w-0"
      >
        <div className="flex justify-center">
          <FileText className="h-5 w-5 sm:h-10 sm:w-10 text-green-600/70 group-hover:text-green-500 transition-colors" />
        </div>
        <div className="flex flex-col sm:text-center flex-1 min-w-0">
          <div className="text-[10px] sm:text-xs font-mono text-green-500 truncate">
            {file.name}
          </div>
          <div className="text-[8px] sm:text-[10px] font-mono text-green-600/50">
            {file.status === "COMPLETED"
              ? "[READY]"
              : file.status === "PROCESSING"
              ? "[PROC...]"
              : "[ERROR]"}
          </div>
        </div>
      </div>
      {showModal && file && (
        <Modal
          title={file.name}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center font-mono text-sm text-green-600">
              <div>DATE: {format(file.createdAt, "yyyy-MM-dd")}</div>
              <div
                className={
                  file.status === "COMPLETED"
                    ? "text-green-500"
                    : "text-yellow-500"
                }
              >
                STATUS: {file.status}
              </div>
            </div>
            <div className="w-full h-[50dvh] border border-green-600/30">
              <iframe
                src={file?.url || ""}
                width="100%"
                height="100%"
                style={{ border: "none" }}
              ></iframe>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
