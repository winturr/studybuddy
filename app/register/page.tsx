import Link from "next/link";
import Default from "../templates/Default";
import Logo from "@/app/components/Logo";

export default function Register() {
  return (
    <section>
      <Default>
        <div className="container mx-auto p-5">
          <h1 className="text-4xl font-bold mb-5">Register Page</h1>
        </div>
      </Default>
    </section>
  );
}
