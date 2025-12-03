import Default from "./templates/Default";
import FormChat from "./components/forms/FormChat";

export default function Home() {
  return (
    <Default>
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 text-center py-4">
          <span className="bg-clip-text text-transparent text-5xl font-bold bg-linear-to-r from-blue-500 to-blue-300">
            Hello, Guest!
          </span>
          <p className="mt-2">
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
