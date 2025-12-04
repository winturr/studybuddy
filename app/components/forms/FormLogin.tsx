"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function FormLogin() {
  // Refs
  const formRef = useRef<HTMLFormElement>(null);

  // Hooks
  const router = useRouter();
  const { push: redirect } = router;

  // Local state
  const [state, setState] = useState({
    message: "",
    success: false,
    errors: {
      email: "",
      password: "",
      system: "",
    },
    input: {
      email: "",
      password: "",
    },
  });
  const [pending, setPending] = useState(false);

  // Handle
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setPending(true);

    // Data
    // ?? undefined or null check like if (!formRef.current) return
    const formData = new FormData(formRef.current ?? undefined);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString().trim();

    if (!email || !password) {
      setState({
        message: "",
        success: false,
        errors: {
          email: !email ? "Email is required." : "",
          password: !password ? "Password is required." : "",
          system: "",
        },
        input: {
          email: email ?? "",
          password: password ?? "",
        },
      });
      setPending(false);
      return;
    }

    try {
      // NextAuth
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("RES: ", res);

      if (res?.ok === true) {
        setState({
          message: "Logged in successfully!",
          success: true,
          errors: {
            email: "",
            password: "",
            system: "",
          },
          input: {
            email: "",
            password: "",
          },
        });

        // Fetch the session to get user role
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        console.log("Session: ", session);

        // Do some toast
        toast.success("Logged in successfully! Redirecting...");

        // Wait 1 second before redirecting
        setTimeout(() => {
          //
          redirect(`/`);
        }, 1000);

        //
      } else {
        console.log("Failed to login: ", res);
        setState({
          message: "Login failed.",
          success: false,
          errors: {
            email: "",
            password: "",
            system: "Login failed. Please check your credentials.",
          },
          input: {
            email: email ?? "",
            password: password ?? "",
          },
        });
      }

      //
    } catch (error) {
      //
      console.log(error);

      //
      setState({
        message: "",
        success: false,
        errors: {
          email: "",
          password: "",
          system: "System error, please contact admin.",
        },
        input: {
          email: email ?? "",
          password: password ?? "",
        },
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      data-loading={pending}
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-3 sm:gap-4 w-full max-w-md mx-auto p-4 sm:p-6"
    >
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label htmlFor="email" className="text-green-500 text-xs sm:text-sm font-mono">
          {">"} email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          defaultValue={state?.input?.email}
          className={`w-full bg-transparent border outline-none border-green-600/50 rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-green-400 placeholder-green-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono transition-all ${
            state?.errors.email ? "border-red-500 bg-red-500/10" : ""
          }`}
        />
        {state?.errors.email && (
          <p className="text-red-500 text-xs font-mono">
            {state?.errors.email}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label htmlFor="password" className="text-green-500 text-xs sm:text-sm font-mono">
          {">"} password:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          defaultValue={state?.input?.password}
          className={`w-full bg-transparent border outline-none border-green-600/50 rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-green-400 placeholder-green-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono transition-all ${
            state?.errors.password ? "border-red-500 bg-red-500/10" : ""
          }`}
        />
        {state?.errors.password && (
          <p className="text-red-500 text-xs font-mono">
            {state?.errors.password}
          </p>
        )}
      </div>

      {/** System error */}
      {state?.errors?.system && (
        <p className="text-red-500 text-xs font-mono bg-red-500/10 border border-red-500 rounded px-3 sm:px-4 py-2 sm:py-3">
          {state?.errors?.system}
        </p>
      )}

      <div className="flex justify-center mt-3 sm:mt-4">
        <button
          type="submit"
          disabled={pending}
          className="button button-default px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "[PLEASE_WAIT...]" : "[LOG_IN]"}
        </button>
      </div>
    </form>
  );
}
