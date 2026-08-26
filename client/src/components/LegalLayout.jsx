import { Link } from "react-router-dom";
import Footer from "./Footer.jsx";
import logo from "../assets/logo.png";

export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-parchment text-ink flex flex-col">
      <header className="border-b border-ink/10">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Afterword" className="w-7 h-7 rounded-md" />
            <span className="font-display text-lg">Afterword</span>
          </Link>
          <Link to="/" className="focus-ring text-sm text-ink/50 hover:text-brass-dark">
            ← Back home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-14 w-full">
        <h1 className="font-display text-4xl mb-2">{title}</h1>
        <p className="text-sm text-ink/40 font-mono mb-10">Last updated: {updated}</p>
        <div className="space-y-8 leading-relaxed text-[15px] text-ink/80">{children}</div>
      </main>

      <div className="border-t border-ink/10 py-6">
        <Footer dark={false} />
      </div>
    </div>
  );
}
