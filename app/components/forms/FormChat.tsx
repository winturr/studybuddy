"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { UserRound, Bot, SendHorizonal, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function FormChat() {
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Message Display Area */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto min-h-0 px-4">
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
                  <div className="h-10 w-10 aspect-square rounded-full border flex items-center justify-center bg-neutral-900">
                    <UserRound />
                  </div>
                ) : (
                  <div className="h-10 w-10 aspect-square rounded-full border flex items-center justify-center bg-neutral-900">
                    <Bot />
                  </div>
                )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className={`flex flex-col p-5 rounded-2xl border ${
                            isUser
                              ? "bg-linear-to-r from-blue-600 to-indigo-500 text-white border-blue-700 items-end text-right"
                              : "bg-neutral-900 items-start text-left border-neutral-700"
                          }`}
                        >
                          <div className="[&>p]:mb-3 [&>p]:last:mb-0 [&>ul]:mb-4 [&>ul>li]:list-disc [&>ul>li]:ml-5 [&>ol>li]:list-decimal [&>ol>li]:ml-5">
                            {part.text}
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
      <form
        data-loading={isLoading}
        onSubmit={handleChat}
        className="form-container shrink-0 mt-4 w-full mx-auto flex flex-col gap-2 p-5 border border-gray-500 rounded-3xl bg-neutral-950"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your message..."
          className="w-full resize-none rounded-xl px- py-2 border-none focus:border-transparent focus:ring-0"
          rows={3}
          aria-label="Type your message"
        ></textarea>

        <div className="flex w-full justify-end">
          <button
            type="submit"
            className={`h-12 w-30 flex items-center justify-center rounded-full bg-neutral-900 text-white border border-gray-500 transition-all ${
              input.trim()
                ? "opacity-100 cursor-pointer hover:bg-white hover:text-black hover:border-white"
                : "opacity-0 pointer-events-none"
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
