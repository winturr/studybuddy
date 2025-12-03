import Link from "next/link";
import Default from "../templates/Default";
import Logo from "@/app/components/Logo";

export default function Login() {
  return (
    <section>
      <Default>
        <div className="container mx-auto p-5">
          <h1 className="bg-clip-text text-transparent text-2xl sm:text-3xl font-thin bg-green-500">
            Login Page
          </h1>
        </div>
      </Default>
    </section>
  );
}
