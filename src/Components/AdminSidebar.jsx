import { NavLink } from "react-router-dom";

export default function UserSideBar() {
  const menu = [
    { name: "Home", icon: "home", path: "/user/home" },
    { name: "Carbon Quote Calculator", icon: "calculate", path: "/user/calculator" },
    { name: "Shipment History", icon: "local_shipping", path: "/user/shipments" },
  ];

  return (
    <div className="w-64 bg-white border-r fixed left-0 top-0 h-screen p-6 flex flex-col justify-between">

      {/* Logo */}
      <div>
        <h1 className="text-2xl font-bold text-emerald-600 mb-10">EcoRoute</h1>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium transition
                ${isActive ? "bg-emerald-100 text-emerald-700" : "text-gray-700 hover:bg-gray-100"}`
              }
            >
              <span className="material-icons text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <button className="flex items-center gap-3 text-gray-500 hover:text-red-500">
        <span className="material-icons">logout</span>
        Log Out
      </button>
    </div>
  );
}
