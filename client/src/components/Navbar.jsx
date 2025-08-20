// client/src/components/Navbar.jsx
import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div className="flex items-center py-4">
              <span className="font-semibold text-gray-800 text-lg">
                Interview Portal
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
