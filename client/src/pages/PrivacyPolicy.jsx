import LegalLayout from "../components/LegalLayout.jsx";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="August 26, 2026">
      <Section title="Who we are">
        <p>
          Afterword we are operated by https://github.com/ChAbdulRaheem786,
          contact: chabraheem787@gmail.com. This policy explains what
          information we collect through the Afterword application, how it's
          used, and how it's stored.
        </p>
      </Section>

      <Section title="What we collect">
        <p>When you sign in with Google, we receive and store:</p>
        <List
          items={[
            "Your name, email address, and profile picture, as shared by Google.",
            "An OAuth refresh token, which lets us send email on your behalf at the time you schedule — this is encrypted at rest and never shown to us or anyone else in plain text.",
          ]}
        />
        <p>When you use the app, we store:</p>
        <List
          items={[
            "The content of emails you draft or schedule (recipient, subject, body) — kept so the app can send them at the scheduled time and show you your draft history.",
            "Instructions you type into the AI drafting tool, which are sent to Google's Gemini API to generate a subject and body.",
          ]}
        />
      </Section>

      <Section title="How we use it">
        <List
          items={[
            "To authenticate you and keep you signed in.",
            "To send the specific emails you compose and schedule, from your own Gmail account, at the time you choose.",
            "To generate AI drafts when you ask for one.",
            "To show you your own draft, scheduled, and sent history inside the app.",
          ]}
        />
        <p>
          We do not sell your data, use it for advertising, or use the content
          of your emails to train AI models.
        </p>
      </Section>

      <Section title="Google user data & Limited Use">
        <p>
          Afterword's use and transfer of information received from Google APIs
          adheres to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-brass-dark"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. We request the Gmail{" "}
          <code className="font-mono text-sm bg-ink/5 px-1 rounded">gmail.send</code>{" "}
          scope only — this lets us send messages through your account; it does
          not let us read your inbox, contacts, or any other Gmail data.
        </p>
      </Section>

      <Section title="Where it's stored">
        <p>
          Data is stored in MongoDB Atlas. Refresh tokens are encrypted with
          AES-256-GCM before being written to the database.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          We retain your account and draft data for as long as you have an
          account. You can delete individual drafts at any time from the
          dashboard. To delete your account and all associated data, contact
          chabraheem787@gmail.com.
        </p>
      </Section>

      <Section title="Third parties we use">
        <List
          items={[
            "Google (OAuth sign-in and the Gmail API, to send your emails)",
            "Google Gemini API (to generate AI drafts from the instructions you provide)",
            "MongoDB Atlas (database hosting)",
            "Vercel",
          ]}
        />
      </Section>

      <Section title="Your choices">
        <p>
          You can revoke Afterword's access at any time from your{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-brass-dark"
          >
            Google Account permissions page
          </a>
          . Revoking access will stop any pending scheduled sends from going
          out, since we can no longer act on your behalf.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we make material changes to this policy, we'll update the date at
          the top of this page.
        </p>
      </Section>

      <Section title="Contact">
        <p>Questions about this policy: chabraheem787@gmail.com</p>
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-xl mb-3 text-ink">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function List({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Callout({ children }) {
  return (
    <div className="bg-brass/10 border border-brass/30 text-ink/70 text-sm rounded-sm px-4 py-3">
      {children}
    </div>
  );
}
