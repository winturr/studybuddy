export default function Bare({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div
        className={`container mx-auto min-h-dvh flex flex-col items-center justify-center gap-5 ${className}`}
      >
        {children}
      </div>
    </section>
  );
}
