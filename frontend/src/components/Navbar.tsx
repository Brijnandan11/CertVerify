import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogoMark } from "./LogoMark";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <LogoMark size={36} showText textClassName="text-lg" />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-ink">Dashboard</Link>
              <Link to="/certificates" className="text-slate-600 hover:text-ink">Certificates</Link>
              <Link to="/settings" className="text-slate-600 hover:text-ink">Settings</Link>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="text-slate-500 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-ink">Login</Link>
              <Link to="/register" className="bg-ink text-white px-4 py-2 rounded-lg hover:bg-ink/90">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
