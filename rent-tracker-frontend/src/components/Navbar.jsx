import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="font-bold text-xl">🏠 Rent Tracker</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-500">Login</Link>
        <Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link>
      </div>
    </nav>
  );
}

export default Navbar;

