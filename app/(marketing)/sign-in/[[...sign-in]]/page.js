import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg gradient-accent-bar mx-auto mb-4" />
          <h1 className="font-display text-display-md text-primary mb-2">
            Welcome back
          </h1>
          <p className="text-muted text-sm">
            Sign in to Capacity Connect
          </p>
        </div>

        <div className="bg-white border border-border-warm rounded-xl p-6 shadow-sm">
          <SignIn />
        </div>

        <p className="text-center text-xs text-muted mt-8">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="text-accent hover:text-accent-600 font-medium transition-colors">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
