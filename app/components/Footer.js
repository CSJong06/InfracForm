export default function Footer() {
  return (
    <footer className="absolute bottom-0 left-0 right-0 py-6 px-4 bg-white/80 backdrop-blur-sm border-t">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-gray-600 text-sm">
          © 2025 Building21 Allentown. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
} 