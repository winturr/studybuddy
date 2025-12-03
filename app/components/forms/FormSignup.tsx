"use client";

export default function FormSignup() {
  return (
    <form
      className="flex flex-col gap-4 w-full max-w-md mx-auto p-6"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-green-500 text-sm font-mono">
          {">"} name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter your name"
          className="w-full bg-transparent border outline outline-green-500 border-green-600/50 rounded px-4 py-3 text-green-400 placeholder-green-700 focus:border-green-500 focus:ring-0 focus:ring-green-500 font-mono transition-all"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-green-500 text-sm font-mono">
          {">"} email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          className="w-full bg-transparent border outline outline-green-500 border-green-600/50 rounded px-4 py-3 text-green-400 placeholder-green-700 focus:border-green-500 focus:ring-0 focus:ring-green-500 font-mono transition-all"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-green-500 text-sm font-mono">
          {">"} password:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          className="w-full bg-transparent border outline outline-green-500 border-green-600/50 rounded px-4 py-3 text-green-400 placeholder-green-700 focus:border-green-500 focus:ring-0 focus:ring-green-500 font-mono transition-all"
        />
      </div>
      <div className="flex justify-center mt-4">
        <button
          type="submit"
          className="px-8 py-3 text-green-500 font-mono font-medium border border-green-600 bg-green-500/10 hover:bg-green-500/20 hover:text-green-400 rounded transition-all duration-200"
        >
          [SIGN-UP]
        </button>
      </div>
    </form>
  );
}
