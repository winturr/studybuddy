import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FormChat from "../components/forms/FormChat";

export default function Default({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="container mx-auto p-5 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
