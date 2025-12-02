import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="">
      <div className="container flex items-center justify-between mx-auto p-5">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex gap-5">
          <Link href="/login" className="button button-default">
            Login
          </Link>
          <Link href="/register" className="button button-default">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
