import React, { useState } from "react";
import { NavLink } from "react-router-dom";


interface SidebarItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  
  
  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };
  
  return (
    <aside
      className={`
        bg-white h-screen border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-48' : 'w-16'}
        flex flex-col flex-shrink-0
        sticky top-16
      `}
    >
      {/* Toggle Button */}
      <div className="p-3 border-gray-200">
        <button
          type="button"
          onClick={toggleSidebar}
          className="w-full p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      {/* Navigation Links */}
      <nav className="flex-1 py-4">
        {items.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 mx-2 mb-1 rounded-lg transition-all
              ${isActive ? "text-blue-700 bg-blue-100" : "text-gray-600"}
              hover:bg-blue-50 hover:text-blue-700`
            }
            end
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span
              className={`
                whitespace-nowrap
                transition-all duration-300
                ${isExpanded ? 'ml-3 opacity-100 w-auto' : 'opacity-0 w-0'}
                overflow-hidden
              `}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}