interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div className={`min-h-screen pb-24 px-4 pt-4 max-w-2xl mx-auto ${className}`}>
      {children}
    </div>
  );
}
