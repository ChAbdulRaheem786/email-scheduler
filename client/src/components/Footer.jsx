import { Link } from "react-router-dom";

export default function Footer({ dark = true }) {
  const textColor = dark ? "text-parchment/40" : "text-ink/40";
  const hoverColor = dark ? "hover:text-parchment/70" : "hover:text-ink/70";

  return (
    <footer className={`text-xs font-mono ${textColor}`}>
      <div className="flex items-center justify-center gap-5">
        <span>© {new Date().getFullYear()} Afterword</span>
        <Link to="/privacy" className={`${hoverColor} transition-colors`}>
          Privacy Policy
        </Link>
        <Link to="/terms" className={`${hoverColor} transition-colors`}>
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
