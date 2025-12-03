"use client";

import { useActionState, useEffect } from "react";
import { uploadAndEmbedFile } from "@/app/lib/actions/embedding";
import { useState } from "react";
import toast from "react-hot-toast";

export default function FormUploadFile({
  setShowModal,
}: {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // Init
  const initialState: any = {
    message: "",
    error: "",
    success: false,
  };

  // Action
  const [state, handleSubmit, isPending] = useActionState(
    uploadAndEmbedFile,
    initialState
  );

  // States
  const [clientError, setClientError] = useState<string | null>(null);

  // Effect dependency state
  useEffect(() => {
    if (state?.success) {
      setShowModal(false);
      toast.success(state.message);
    }
  }, [state]);

  //
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setClientError(null); // Reset errors

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB Limit
        setClientError("File is too large. Max size is 5MB.");
        e.target.value = ""; // Clear the input
      }
    }
  };

  return (
    <form
      data-loading={isPending}
      action={handleSubmit}
      className="flex flex-col gap-4 bg-neutral-900 p-4 border border-green-600/30"
      noValidate
    >
      <div>
        <input
          type="file"
          name="file"
          accept=".pdf,.txt,.md"
          required
          onChange={handleFileChange}
          className="block w-full text-sm text-green-500 font-mono
            file:mr-4 file:py-2 file:px-4
            file:border file:border-green-600
            file:text-sm file:font-semibold
            file:bg-neutral-800 file:text-green-500
            hover:file:bg-green-900/50 file:cursor-pointer
            file:transition-colors"
        />
        <p className="mt-2 text-xs text-green-600/60 font-mono">
          Max 5MB. This will be added to your AI knowledge base.
        </p>
      </div>

      {/** Error / Success Feedback Section */}

      {clientError && (
        <p className="text-sm text-red-500 font-mono border border-red-500/30 bg-red-500/10 p-2">
          {clientError}
        </p>
      )}

      {state?.error && (
        <p className="text-sm text-red-500 font-mono border border-red-500/30 bg-red-500/10 p-2">
          Error: {state.error}
        </p>
      )}

      {state?.success && (
        <p className="text-sm text-green-500 font-mono border border-green-500/30 bg-green-500/10 p-2">
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className={`h-10 px-4 flex items-center justify-center gap-2 bg-neutral-900 text-green-600 border-2 border-green-600 transition-all font-mono text-sm ${
            isPending
              ? "opacity-50 cursor-wait"
              : "hover:bg-green-800 hover:text-green-300 hover:border-green-600 cursor-pointer"
          }`}
        >
          {isPending ? "Uploading..." : "Upload"}
        </button>
      </div>
    </form>
  );
}
