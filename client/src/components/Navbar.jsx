import { Link } from "react-router-dom";
import { api } from "../api";
import logo from "../assets/logo.png";

export default function Navbar({ user, onSignOut }) {
  async function handleSignOut() {
    await api.post("/auth/logout");
    onSignOut();
  }

  return (
    <header className="border-b border-ink/10 bg-parchment/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img src={logo} alt="Afterword" className="w-8 h-8 rounded-md" />
          <span className="font-display text-lg">Afterword</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium leading-tight">{user?.name}</div>
            <div className="text-xs text-ink/50 leading-tight font-mono">{user?.email}</div>
          </div>
          {user?.image && (
            <img src={user.image} alt="" className="w-8 h-8 rounded-full border border-ink/10" />
          )}
          <button
            onClick={handleSignOut}
            className="focus-ring text-sm text-ink/60 hover:text-rust transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
