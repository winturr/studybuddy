"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Logo from "./Logo";
import ButtonUploadFile from "./ButtonUploadFile";

export default function Header() {
  const { status } = useSession();

  return (
    <header className="">
      <div className="container flex items-center justify-between mx-auto p-3 sm:p-5">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex gap-1 sm:gap-2 md:gap-5">
          {status === "authenticated" ? (
            <>
              <ButtonUploadFile />
              <button
                onClick={() => signOut()}
                className="button button-default text-xs sm:text-sm md:text-base py-1.5 px-2 sm:py-2 sm:px-3 md:py-3 md:px-5"
              >
                LOG_OUT
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="button button-default text-xs sm:text-sm md:text-base py-1.5 px-2 sm:py-2 sm:px-3 md:py-3 md:px-5"
              >
                LOG_IN
              </Link>
              <Link
                href="/register"
                className="button button-default text-xs sm:text-sm md:text-base py-1.5 px-2 sm:py-2 sm:px-3 md:py-3 md:px-5"
              >
                SIGN_UP
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
