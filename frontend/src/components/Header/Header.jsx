import React from "react";
import { Link, NavLink } from "react-router-dom";

function Header() {
  return (
    <header className="shadow sticky z-50 top-0">
      <nav className="flex flex-wrap justify-between justify-items-center mx-auto max-w-screen-xl">
        <div className="flex">
          <div>
            
          </div>
        </div>

        <div className="flex">
          <h1>Search</h1>
        </div>

        <div className="flex">
          <h1>Profile</h1>
        </div>
      </nav>
    </header>
  );
}

export default Header;
