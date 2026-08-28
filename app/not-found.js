import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in-50">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-sm">
        <span className="material-symbols-outlined text-3xl">find_in_page</span>
      </div>

      <h1 className="text-4xl font-extrabold font-display text-foreground mb-2">404</h1>
      <h2 className="text-xl font-semibold text-foreground mb-2">Page Not Found</h2>
      
      <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
        The requested page or resource could not be found or may have been moved.
      </p>

      <Link
        href="/"
        className="btn-primary py-2.5 px-5 font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-base">home</span>
        Return to Dashboard
      </Link>
    </div>
  );
}
