type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  message?: string;
};

export default function LoadingSpinner({ 
  size = "md", 
  message = "Loading..." 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizeClasses[size]} mb-4`}>
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}></div>
          <div className={`${sizeClasses[size]} rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0`}></div>
        </div>
      </div>
      <p className="text-gray-600 text-center animate-pulse">{message}</p>
    </div>
  );
}


