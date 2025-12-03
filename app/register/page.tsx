import Bare from "../templates/Bare";
import Logo from "../components/Logo";
import FormSignup from "../components/forms/FormSignup";
import Link from "next/link";

export default function Signup() {
  return (
    <Bare>
      <div className="justify-center items-center flex flex-col gap-10 w-full max-w-md mx-auto">
        <Link href="/">
          <Logo />
        </Link>
        <div className="w-full">
          <h1 className="text-2xl font-black text-center mb-6 text-green-600">
            -- CREATE-AN-ACCOUNT --
          </h1>
          {/** Form */}
          <FormSignup />
        </div>
      </div>
    </Bare>
  );
}
