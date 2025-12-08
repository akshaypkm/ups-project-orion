import { NavLink } from "react-router-dom";

export default function UserSideBar() {
  const linkClasses =
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition";

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col px-4 py-6">
      {/* Logo */}
      <h1 className="text-2xl font-semibold mb-10 text-emerald-500">EcoRoute</h1>

      {/* Menu */}
      <nav className="flex flex-col gap-2">
        <NavLink
          to="/user/home"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? "bg-emerald-100 text-emerald-600" : "text-gray-600"}`
          }
        >
          <span className="material-icons">home</span>
          Home
        </NavLink>

        <NavLink
          to="/user/calculator"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? "bg-emerald-100 text-emerald-600" : "text-gray-600"}`
          }
        >
          <span className="material-icons">calculate</span>
          Carbon Quote Calculator
        </NavLink>

        <NavLink
          to="/user/shipments"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? "bg-emerald-100 text-emerald-600" : "text-gray-600"}`
          }
        >
          <span className="material-icons">local_shipping</span>
          Shipment History
        </NavLink>
      </nav>

      <div className="mt-auto">
        <button className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition">
          <span className="material-icons">logout</span>
          Log Out
        </button>
      </div>
    </aside>
  );
}
