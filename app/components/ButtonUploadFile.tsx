"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import Modal from "@/app/components/Modal";
import FormUploadFile from "@/app/components/forms/FormUploadFile";

export default function ButtonUploadFile() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="h-12 w-12 flex items-center justify-center bg-neutral-900 text-green-600 border-2 border-green-600 transition-all opacity-100 cursor-pointer hover:bg-green-800 hover:text-green-300 hover:border-green-600"
        title="Upload file"
      >
        <Upload className="h-5 w-5" />
      </button>
      {showModal && (
        <Modal
          title={`Upload file`}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-green-600/70 font-mono">
              Accepts PDF, TXT, MD files only.
            </p>
            <FormUploadFile setShowModal={setShowModal} />
          </div>
        </Modal>
      )}
    </>
  );
}
