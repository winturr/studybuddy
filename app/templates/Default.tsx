import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Toaster } from "react-hot-toast";

export default function Default({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <div className="shrink-0">
        <Header />
      </div>
      <main className="container mx-auto px-3 sm:px-5 flex-1 overflow-hidden flex flex-col min-h-0">
        {children}
      </main>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}
