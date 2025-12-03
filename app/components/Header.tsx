import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="">
      <div className="container flex items-center justify-between mx-auto p-3 sm:p-5">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex gap-2 sm:gap-5">
          <Link
            href="/login"
            className="button button-default text-sm sm:text-base py-2 px-3 sm:py-3 sm:px-5"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="button button-default text-sm sm:text-base py-2 px-3 sm:py-3 sm:px-5"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
