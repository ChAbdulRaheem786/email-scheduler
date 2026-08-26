import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import logo from "../assets/logo.png";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink text-parchment flex flex-col">
      <div className="flex-1 flex items-center">
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
            <img src={logo} alt="Afterword" className="w-8 h-8 rounded-lg" />
            <span className="font-display text-lg">Afterword</span>
          </Link>

          <BouncedEnvelope />

          <div className="mt-10 inline-flex items-center gap-2 text-brass-light font-mono text-xs tracking-[0.2em] uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-rust inline-block" />
            Delivery failed
          </div>

          <h1 className="font-display text-5xl leading-none mb-4">404</h1>
          <p className="text-lg text-parchment/70 leading-relaxed mb-2">
            This page bounced back, undelivered.
          </p>
          <p className="text-sm text-parchment/45 leading-relaxed mb-10">
            Whatever you were looking for either moved, was deleted, or the
            address was never right to begin with.
          </p>

          <Link
            to="/"
            className="focus-ring inline-flex items-center gap-2 bg-parchment text-ink font-medium px-6 py-3 rounded-sm hover:bg-brass-light transition-colors"
          >
            ← Return to sender
          </Link>
        </div>
      </div>

      <div className="border-t border-parchment/10 py-6">
        <Footer />
      </div>
    </main>
  );
}

function BouncedEnvelope() {
  return (
    <div className="relative inline-block">
      <svg width="150" height="110" viewBox="0 0 150 110" fill="none" aria-hidden="true">
        <rect
          x="10"
          y="15"
          width="130"
          height="85"
          rx="6"
          fill="#1D2440"
          stroke="#D9A85C"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <path
          d="M14 20L75 65L136 20"
          stroke="#D9A85C"
          strokeOpacity="0.55"
          strokeWidth="1.5"
          fill="none"
        />
        {/* postmark stamp, tilted */}
        <g transform="translate(75 58) rotate(-16)">
          <circle cx="0" cy="0" r="30" stroke="#B5502F" strokeWidth="2" fill="none" />
          <circle cx="0" cy="0" r="24" stroke="#B5502F" strokeWidth="1" fill="none" />
          <text
            x="0"
            y="-3"
            textAnchor="middle"
            fill="#B5502F"
            fontSize="7"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="600"
            letterSpacing="0.5"
          >
            RETURN TO
          </text>
          <text
            x="0"
            y="9"
            textAnchor="middle"
            fill="#B5502F"
            fontSize="7"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="600"
            letterSpacing="0.5"
          >
            SENDER
          </text>
        </g>
      </svg>
    </div>
  );
}
