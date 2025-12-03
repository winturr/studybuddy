import Default from "./templates/Default";
import FormChat from "./components/forms/FormChat";

export default function Home() {
  return (
    <Default>
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 text-center py-2 sm:py-4 px-4">
          <span className="bg-clip-text text-transparent text-3xl sm:text-5xl font-thin bg-green-500">
            TERMINAL_ACCESS: GUEST
          </span>
          <p className=" mt-1 sm:mt-2 text-sm sm:text-base text-green-600">
            Create an account and log in to access your personalized study
            assistant.
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <FormChat />
        </div>
      </div>
    </Default>
  );
}
