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
                  <div className="h-10 w-10 aspect-square text-green-600 border border-green-600 flex items-center justify-center bg-neutral-900">
                    <UserRound />
                  </div>
                ) : (
                  <div className="h-10 w-10 aspect-square border text-neutral-700 border-neutral-700 flex items-center justify-center bg-neutral-900">
                    <Bot />
                  </div>
                )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className={`flex flex-col p-5 border ${
                            isUser
                              ? "bg-neutral-900 text-white border-green-700 border-2 items-end text-right"
                              : "bg-neutral-900 items-start text-left border-neutral-700"
                          }`}
                        >
                          <div className="prose prose-invert max-w-none [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:font-bold [&>h3]:mb-2 [&>pre]:bg-neutral-800 [&>pre]:p-3 [&>pre]:rounded [&>pre]:overflow-x-auto [&>code]:bg-neutral-800 [&>code]:px-1 [&>code]:rounded">
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
      <form
        data-loading={isLoading}
        onSubmit={handleChat}
        className="form-container shrink-0 mt-4 w-full mx-auto flex flex-col gap-2 p-5 border border-neutral-700"
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
            className={`h-12 w-30 flex items-center justify-center bg-neutral-900 text-green-600 border border-green-600 transition-all ${
              input.trim()
                ? "opacity-100 cursor-pointer hover:bg-green-800 hover:text-black hover:border-green-600 hover:text-green-300"
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
