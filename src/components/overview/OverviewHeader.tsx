interface OverviewHeaderProps {
  userName: string;
}

export function OverviewHeader({ userName }: OverviewHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-primary mb-2">
        Welcome back, {userName}
      </h1>
      <p className="text-muted-foreground text-lg">
        Your academic publishing dashboard
      </p>
    </div>
  );
}