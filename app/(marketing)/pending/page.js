export default function PendingPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-full gradient-accent-bar mx-auto mb-6" />
        <h1 className="font-display text-display-md text-primary mb-3">
          Account Pending Approval
        </h1>
        <p className="text-muted">
          Your account is awaiting admin approval. You will be redirected to
          your dashboard once approved.
        </p>
      </div>
    </div>
  );
}
