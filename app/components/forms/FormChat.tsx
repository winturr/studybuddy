"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  UserRound,
  Bot,
  SendHorizonal,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";
import Files from "@/app/components/Files";
import type { File } from "@prisma/client";

function formatTimestamp(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `[${hours}:${minutes}:${seconds}]`;
}

export default function FormChat() {
  const { data: session } = useSession();
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [messageTimestamps, setMessageTimestamps] = useState<
    Record<string, Date>
  >({});
  const [showFiles, setShowFiles] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch files
  const fetchFiles = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/files`);
      const data = await res.json();
      if (data.success) {
        setFiles(data.payload || []);
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  }, [session?.user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const { messages, sendMessage } = useChat({
    onError: (err) => {
      console.log("error: ", err);
      setError(String(err));
    },
  });

  async function handleChat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      if (typeof sendMessage === "function") {
        await sendMessage({ text: input });
      }
      setInput("");
    } catch (err: any) {
      console.error(err);
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form && input.trim()) {
        form.requestSubmit();
      }
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Track timestamps for new messages
  useEffect(() => {
    messages.forEach((message) => {
      if (!messageTimestamps[message.id]) {
        setMessageTimestamps((prev) => ({
          ...prev,
          [message.id]: new Date(),
        }));
      }
    });
  }, [messages, messageTimestamps]);

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Message Display Area */}
      <div className="chat-messages flex-1 flex flex-col gap-1 overflow-y-auto min-h-0 px-2 sm:px-4 text-sm sm:text-base">
        {messages &&
          messages.length > 0 &&
          messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                data-loading={isLoading}
                key={message.id}
                className={`flex gap-3 p-2 items-start ${
                  isUser ? "flex-row-reverse" : ""
                }`}
              >
                {isUser ? (
                  <div className="h-8 w-8 sm:h-10 sm:w-10 aspect-square text-green-600 border border-green-600 flex items-center justify-center bg-neutral-900">
                    <UserRound className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                ) : (
                  <div className="h-8 w-8 sm:h-10 sm:w-10 aspect-square border font-black text-neutral-700 border-neutral-700 flex items-center justify-center bg-neutral-900">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className={`flex flex-col p-3 sm:p-5 border ${
                            isUser
                              ? "bg-neutral-900 text-green-600 border-green-700 border-2 items-end text-right"
                              : "bg-neutral-900 text-neutral-300 border-neutral-800 border-2 items-start text-left"
                          }`}
                        >
                          <span
                            className={`font-mono text-xs mb-2 ${
                              isUser ? "text-green-500/70" : "text-neutral-400"
                            }`}
                          >
                            {!isUser && "GROL_B3RT_V1 "}
                            {messageTimestamps[message.id]
                              ? formatTimestamp(messageTimestamps[message.id])
                              : formatTimestamp(new Date())}
                          </span>
                          <div className="prose prose-sm sm:prose-base prose-invert max-w-none [&>p]:mb-2 sm:[&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:mb-3 sm:[&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-4 sm:[&>ul]:pl-5 [&>ol]:mb-3 sm:[&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-4 sm:[&>ol]:pl-5 [&>li]:mb-1 [&>h1]:text-lg sm:[&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-2 sm:[&>h1]:mb-3 [&>h2]:text-base sm:[&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:font-bold [&>h3]:mb-2 [&>pre]:bg-neutral-800 [&>pre]:p-2 sm:[&>pre]:p-3 [&>pre]:rounded [&>pre]:overflow-x-auto [&>pre]:text-xs sm:[&>pre]:text-sm [&>code]:bg-neutral-800 [&>code]:px-1 [&>code]:rounded [&>code]:text-xs sm:[&>code]:text-sm">
                            <ReactMarkdown>{part.text}</ReactMarkdown>
                          </div>
                        </div>
                      );
                  }
                })}
              </div>
            );
          })}
        {/** Mark end of chat */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Attached Files Display */}
      {files.length > 0 && (
        <div className="shrink-0 px-3 sm:px-5 py-2 border-t border-green-600/30">
          <button
            type="button"
            onClick={() => setShowFiles(!showFiles)}
            className="flex items-center gap-2 text-xs text-green-600/70 mb-2 font-mono hover:text-green-500 transition-colors w-full"
          >
            <span>ATTACHED_FILES: ({files.length})</span>
            {showFiles ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          {showFiles ? (
            <div className="py-2">
              <Files files={files} />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {files.slice(0, 3).map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 border border-green-600/50 text-green-500 text-xs"
                >
                  <FileText className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <span className="text-green-600/50">
                    {file.status === "COMPLETED"
                      ? "✓"
                      : file.status === "PROCESSING"
                      ? "..."
                      : "!"}
                  </span>
                </div>
              ))}
              {files.length > 3 && (
                <span className="text-green-600/50 text-xs self-center">
                  +{files.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <form
        data-loading={isLoading}
        onSubmit={handleChat}
        className="form-container shrink-0 mt-2 sm:mt-4 w-full mx-auto flex flex-col gap-2 p-3 sm:p-5 border-2 border-green-600"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your message..."
          className="w-full placeholder-green-700 caret-green-500 resize-none rounded-xl px-2 py-2 border-none focus:border-transparent focus:ring-0 text-sm sm:text-base"
          rows={2}
          aria-label="Type your message"
        ></textarea>

        <div className="flex w-full justify-end gap-2">
          <button
            type="submit"
            className={`h-12 w-12 flex items-center justify-center bg-neutral-900 text-green-600 border-2 border-green-600 transition-all ${
              input.trim()
                ? "opacity-100 cursor-pointer hover:bg-green-800 hover:text-green-300 hover:border-green-600"
                : "opacity-50 pointer-events-none"
            }`}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizonal className="h-5 w-5" />
            )}
          </button>
        </div>
        {error && (
          <div className="text-sm text-red-500 mt-2" role="alert">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
