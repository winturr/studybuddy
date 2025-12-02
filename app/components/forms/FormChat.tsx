"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef } from "react";
import { UserRound, Bot } from "lucide-react";
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

  return (
    <div>
      {/* Message Display Area */}
      {messages && messages.length > 0 && (
        <div className="flex-1 flex flex-col gap-1">
          {messages.map((message) => (
            <div
              data-loading={isLoading}
              key={message.id}
              className="flex gap-3 p-2 items-start"
            >
              {message.role === "user" ? (
                <div className="h-10 w-10 aspect-square rounded-full border flex items-center justify-center bg-black">
                  <UserRound />
                </div>
              ) : (
                <div className="h-10 w-10 aspect-square rounded-full border flex items-center justify-center bg-black">
                  <Bot />
                </div>
              )}
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <div
                        key={`${message.id}-${i}`}
                        className="bg-purple-900 flex flex-col items-start text-left p-3 rounded-md"
                      >
                        <div className="[&>p]:mb-3 [&>p]:last:mb-0 [&>ul]:mb-4 [&>ul>li]:list-disc [&>ul>li]:ml-5 [&>ol>li]:list-decimal [&>ol>li]:ml-5">
                          {part.text}
                        </div>
                      </div>
                    );
                }
              })}
            </div>
          ))}
          {/** Mark end of chat */}
          <div ref={messagesEndRef} />
        </div>
      )}
      <form
        data-loading={isLoading}
        onSubmit={handleChat}
        className="form-container w-dwh mx-auto flex-1 sticky bottom-10 flex flex-col gap-2 p-2 border border-gray-500 rounded-3xl"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your message..."
          className="w-full resize-none rounded-3xl px-4 py-2 border-none focus:border-transparent focus:ring-0"
          rows={3}
          aria-label="Type your message"
        ></textarea>

        <div className="flex w-full justify-end">
          <button type="submit" className="button button-submit">
            {isLoading ? "Sending…" : "Send"}
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
