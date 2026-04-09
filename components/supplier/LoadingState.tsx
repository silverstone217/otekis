function LoadingState() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-muted" />
      ))}
    </div>
  );
}
