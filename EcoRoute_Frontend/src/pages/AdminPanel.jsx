import { Outlet } from "react-router-dom";
import AdminSidebar from "../Components/AdminSidebar";

export default function AdminPanel() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
}
