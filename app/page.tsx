import Default from "./templates/Default";
import FormChat from "./components/forms/FormChat";

export default function Home() {
  return (
    <Default>
      <div className="container flex flex-col gap-5 items-center text-center justify-center mx-auto p-5">
        <span className="bg-clip-text text-transparent text-5xl font-bold bg-linear-to-r from-purple-500 to-purple-400">
          Hello, Guest!
        </span>
        <p>
          Create an account and log in to access your personalized study
          assistant.
        </p>
        <FormChat />
      </div>
    </Default>
  );
}
