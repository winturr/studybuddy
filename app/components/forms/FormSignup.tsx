"use client";

import { createUser } from "@/app/lib/actions/user";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function FormSignup() {
  const initialState = {
    success: false,
    payload: null,
    message: null,
    errors: [],
    input: null,
  };

  const { push: redirect } = useRouter();
  const hasShownToast = useRef(false);

  const [state, handleSubmit, isPending] = useActionState(
    createUser,
    initialState
  );

  useEffect(() => {
    // Prevent duplicate toasts
    if (hasShownToast.current) return;

    if (state.success) {
      hasShownToast.current = true;
      toast.success("User created successfully! Redirecting to login...");
      setTimeout(() => {
        redirect("/login");
      }, 1000);
    } else if (state.message) {
      hasShownToast.current = true;
      toast.error(state.message);
      // Reset after showing error so user can try again
      setTimeout(() => {
        hasShownToast.current = false;
      }, 100);
    }
  }, [state, redirect]);

  return (
    <form
      data-loading={isPending}
      action={handleSubmit}
      className="flex flex-col gap-3 sm:gap-4 w-full max-w-md mx-auto p-4 sm:p-6"
      noValidate
    >
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label
          htmlFor="name"
          className="text-green-500 text-xs sm:text-sm font-mono"
        >
          {">"} name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter your name"
          defaultValue={state?.input?.name}
          className={`w-full bg-transparent border outline-none border-green-600/50 rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-green-400 placeholder-green-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono transition-all ${
            state?.errors.find(
              (error: { field: string }) => error.field === "name"
            )
              ? "border-red-500 bg-red-500/10"
              : ""
          }`}
        />
        {state?.errors.find(
          (error: { field: string }) => error.field === "name"
        ) && (
          <p className="text-red-500 text-xs font-mono">
            {
              state?.errors.find(
                (error: { field: string; message: string }) =>
                  error.field === "name"
              )?.message
            }
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label
          htmlFor="email"
          className="text-green-500 text-xs sm:text-sm font-mono"
        >
          {">"} email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          defaultValue={state?.input?.email}
          className={`w-full bg-transparent border border-green-600/50 rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-green-400 placeholder-green-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono transition-all ${
            state?.errors.find(
              (error: { field: string }) => error.field === "email"
            )
              ? "border-red-500 bg-red-500/10"
              : ""
          }`}
        />
        {state?.errors.find(
          (error: { field: string }) => error.field === "email"
        ) && (
          <p className="text-red-500 text-xs font-mono">
            {
              state?.errors.find(
                (error: { field: string; message: string }) =>
                  error.field === "email"
              )?.message
            }
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label
          htmlFor="password"
          className="text-green-500 text-xs sm:text-sm font-mono"
        >
          {">"} password:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          className={`w-full bg-transparent border border-green-600/50 rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-green-400 placeholder-green-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono transition-all ${
            state?.errors.find(
              (error: { field: string }) => error.field === "password"
            )
              ? "border-red-500 bg-red-500/10"
              : ""
          }`}
        />
        {state?.errors.find(
          (error: { field: string }) => error.field === "password"
        ) && (
          <p className="text-red-500 text-xs font-mono">
            {
              state?.errors.find(
                (error: { field: string; message: string }) =>
                  error.field === "password"
              )?.message
            }
          </p>
        )}
      </div>
      <div className="flex justify-center mt-3 sm:mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="button button-default px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "[PLEASE_WAIT...]" : "[SIGN_UP]"}
        </button>
      </div>
    </form>
  );
}
