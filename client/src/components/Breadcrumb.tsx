import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: "Programs", href: "/programs" },
 *     { label: "Bachelor of Business Administration" }   // last item — no href
 *   ]} />
 *
 * The "Home" root crumb is always prepended automatically.
 */
export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 text-sm text-gray-500 flex-wrap ${className}`}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            )}
            {index === 0 && (
              <Home className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#8B1538] hover:underline transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "text-[#8B1538] font-semibold"
                    : "text-gray-500 font-medium"
                }
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
