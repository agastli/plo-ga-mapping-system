import React from "react";

interface PageFooterProps {
  /** Optional extra CSS classes on the outer wrapper div */
  className?: string;
}

/**
 * Shared page footer used across all standalone (non-dashboard) pages.
 * Renders a maroon rounded card with the QU logo and copyright text.
 * The outer wrapper has no max-width so it naturally inherits the
 * width of whatever container it is placed inside.
 */
export default function PageFooter({ className = "" }: PageFooterProps) {
  return (
    <div className={`mt-8 ${className}`}>
      <div className="bg-[#821F45] rounded-lg shadow-lg px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/qu-log-white-transparent.png"
              alt="Qatar University"
              className="h-14 w-auto"
            />
            <div className="text-white">
              <div className="font-bold text-lg">جامعة قطر</div>
              <div className="text-sm opacity-80">QATAR UNIVERSITY</div>
            </div>
          </div>
          <div className="text-white text-center md:text-right">
            <div className="font-semibold">PLO-GA Mapping Management System</div>
            <div className="text-sm opacity-80">
              © {new Date().getFullYear()} Qatar University. All rights reserved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
