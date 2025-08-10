import Link from "next/link";
import Image from "next/image";
import AuthButton from "./AuthButton";
import { useBrandingSettings } from "@/hooks/useBrandingSettings";

type BlogHeaderProps = {
  title?: string;
  subtitle?: string;
  showAdminLink?: boolean;
  showBadge?: boolean;
  compact?: boolean;
};

export default function BlogHeader({ 
  title = "Latest Articles", 
  subtitle = "Discover fresh insights and quality content",
  showAdminLink = false,
  showBadge = false,
  compact = false
}: BlogHeaderProps) {
  const { settings: brandingSettings, loading: brandingLoading } = useBrandingSettings();
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-100">
      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              {brandingSettings.logoUrl ? (
                <Image 
                  src={brandingSettings.logoUrl} 
                  alt={brandingSettings.websiteName} 
                  width={48}
                  height={32}
                  className="h-8 w-auto max-w-12 object-contain"
                />
              ) : (
                <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-600 to-purple-600"></div>
              )}
              <span className="text-xl font-bold text-gray-900">
                {brandingLoading ? "Blog" : brandingSettings.websiteName}
              </span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/blog" className="text-gray-700 hover:text-blue-600 font-medium">
                All Posts
              </Link>
              <Link href="/tags" className="text-gray-700 hover:text-blue-600 font-medium">
                Tags
              </Link>
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? 'py-8 sm:py-10' : 'py-16 sm:py-20'}`}>
        <div className="text-center">
          {/* Badge */}
          {showBadge && (
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Personal Blog
            </div>
          )}

          {/* Main title */}
          <h1 className={`font-bold text-gray-900 mb-6 ${compact ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-4xl sm:text-5xl lg:text-6xl'}`}>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
            {subtitle}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
              </div>
              <span>Updated regularly</span>
            </div>
            
            {showAdminLink && (
              <Link 
                href="/admin" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
