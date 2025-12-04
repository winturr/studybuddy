import Link from "next/link";
import Default from "../templates/Default";
import Logo from "@/app/components/Logo";
import Bare from "../templates/Bare";
import FormLogin from "../components/forms/FormLogin";

export default function Login() {
  return (
    <Bare>
      <div className="justify-center items-center flex flex-col gap-6 sm:gap-10 w-full max-w-md mx-auto">
        <Link href="/">
          <Logo />
        </Link>
        <div className="w-full">
          <h1 className="text-xl sm:text-2xl font-black text-center mb-4 sm:mb-6 text-green-600">
            LOG_IN
          </h1>
          {/** Form */}
          <FormLogin />
        </div>
      </div>
    </Bare>
  );
}
