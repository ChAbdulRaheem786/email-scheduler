import SignInButton from "../components/SignInButton.jsx";

export default function Landing() {
  return (
    <main className="min-h-screen bg-ink text-parchment flex flex-col">
      <div className="flex-1 flex items-center">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 text-brass-light font-mono text-xs tracking-[0.2em] uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brass-light inline-block" />
            Write now. Arrive later.
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.1] mb-6">
            Emails that wait for the
            <em className="italic text-brass-light"> right moment.</em>
          </h1>
          <p className="text-lg text-parchment/70 max-w-xl mx-auto mb-10 leading-relaxed">
            Draft by hand or let AI write the first pass. Set the exact minute it should
            land in their inbox — sent straight from your own Gmail, on time, every time.
          </p>
          <SignInButton />
          <p className="mt-6 text-xs text-parchment/40 font-mono">
            Signs in with Google · sends from your own Gmail account
          </p>
        </div>
      </div>

      <div className="border-t border-parchment/10 py-10">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <Feature
            eyebrow="Compose"
            title="Write it, or don't"
            body="Draft manually or describe what you need and let Gemini write the subject and body for you."
          />
          <Feature
            eyebrow="Schedule"
            title="To the minute"
            body="Pick an exact date and time. Your draft is queued precisely, not just 'sometime that day.'"
          />
          <Feature
            eyebrow="Deliver"
            title="From your own inbox"
            body="Sent via the Gmail API as you — recipients see it come straight from your address."
          />
        </div>
      </div>
    </main>
  );
}

function Feature({ eyebrow, title, body }) {
  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.15em] text-brass-light uppercase mb-2">
        {eyebrow}
      </div>
      <div className="font-display text-lg mb-1.5">{title}</div>
      <p className="text-parchment/60 leading-relaxed">{body}</p>
    </div>
  );
}
