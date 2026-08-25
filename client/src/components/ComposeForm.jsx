import { useState } from "react";
import { api } from "../api";

const emptyForm = { to: "", cc: "", bcc: "", subject: "", text: "" };

export default function ComposeForm({ onSaveDraft, onScheduleNew, busy }) {
  const [form, setForm] = useState(emptyForm);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiTone, setAiTone] = useState("professional and friendly");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [formError, setFormError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleGenerate() {
    if (!aiInstructions.trim()) {
      setAiError("Describe what the email should say first.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.post("/ai/generate-draft", {
        instructions: aiInstructions,
        recipient: form.to,
        tone: aiTone,
      });
      setForm((f) => ({ ...f, subject: res.data.subject, text: res.data.body }));
      setAiOpen(false);
    } catch (e) {
      setAiError(e.response?.data?.error || "Generation failed");
    } finally {
      setAiLoading(false);
    }
  }

  function validate() {
    if (!form.to.trim() || !form.subject.trim() || !form.text.trim()) {
      setFormError("To, subject, and body are all required.");
      return false;
    }
    setFormError(null);
    return true;
  }

  async function handleSaveDraft() {
    if (!validate()) return;
    await onSaveDraft(form);
    setForm(emptyForm);
    setScheduledAt("");
  }

  async function handleSchedule() {
    if (!validate()) return;
    if (!scheduledAt) {
      setFormError("Pick a date and time to schedule the send.");
      return;
    }
    const sendAt = new Date(scheduledAt);
    if (sendAt.getTime() <= Date.now()) {
      setFormError("Scheduled time must be in the future.");
      return;
    }
    await onScheduleNew(form, sendAt.toISOString());
    setForm(emptyForm);
    setScheduledAt("");
  }

  return (
    <div className="bg-white border border-ink/10 rounded-sm p-6">
      <h2 className="font-display text-xl mb-5">New email</h2>

      <div className="space-y-3">
        <Field label="To">
          <input
            type="email"
            value={form.to}
            onChange={(e) => update("to", e.target.value)}
            placeholder="recipient@example.com"
            className="input"
          />
        </Field>

        {!showCcBcc && (
          <button
            type="button"
            onClick={() => setShowCcBcc(true)}
            className="focus-ring text-xs font-mono text-ink/50 hover:text-brass-dark"
          >
            + Add Cc/Bcc
          </button>
        )}
        {showCcBcc && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cc">
              <input
                type="text"
                value={form.cc}
                onChange={(e) => update("cc", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Bcc">
              <input
                type="text"
                value={form.bcc}
                onChange={(e) => update("bcc", e.target.value)}
                className="input"
              />
            </Field>
          </div>
        )}

        <Field label="Subject">
          <input
            type="text"
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            placeholder="Subject"
            className="input"
          />
        </Field>

        <Field label="Body">
          <textarea
            value={form.text}
            onChange={(e) => update("text", e.target.value)}
            placeholder="Write your email, or generate one with AI below."
            rows={8}
            className="input font-body resize-y"
          />
        </Field>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setAiOpen((v) => !v)}
            className="focus-ring text-sm font-medium text-brass-dark hover:text-rust flex items-center gap-1.5"
          >
            <SparkIcon /> {aiOpen ? "Hide AI drafting" : "Draft with AI"}
          </button>

          {aiOpen && (
            <div className="mt-3 bg-parchment-dim rounded-sm p-4 space-y-3">
              <Field label="What should this email say?">
                <textarea
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  placeholder="e.g. Tell Priya the design review is moved to Thursday 3pm, and ask her to send slides beforehand."
                  rows={3}
                  className="input"
                />
              </Field>
              <Field label="Tone">
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="input"
                >
                  <option>professional and friendly</option>
                  <option>formal</option>
                  <option>casual</option>
                  <option>direct and brief</option>
                  <option>warm and apologetic</option>
                </select>
              </Field>
              {aiError && <p className="text-sm text-rust">{aiError}</p>}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={aiLoading}
                className="focus-ring bg-ink text-parchment text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light transition-colors disabled:opacity-50"
              >
                {aiLoading ? "Generating…" : "Generate draft"}
              </button>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-ink/10 mt-4">
          <Field label="Send at (leave blank to save as draft)">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input font-mono"
            />
          </Field>
        </div>

        {formError && <p className="text-sm text-rust">{formError}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={busy}
            className="focus-ring flex-1 border border-ink/20 text-ink text-sm font-medium px-4 py-2.5 rounded-sm hover:bg-ink/5 transition-colors disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={handleSchedule}
            disabled={busy}
            className="focus-ring flex-1 bg-brass text-white text-sm font-medium px-4 py-2.5 rounded-sm hover:bg-brass-dark transition-colors disabled:opacity-50"
          >
            Schedule send
          </button>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgba(18, 23, 43, 0.15);
          border-radius: 2px;
          padding: 0.55rem 0.7rem;
          font-size: 0.9rem;
          background: white;
        }
        .input:focus {
          outline: 2px solid #c08a3e;
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 0L8.3 5.7 14 7l-5.7 1.3L7 14 5.7 8.3 0 7l5.7-1.3L7 0z" fill="currentColor" />
    </svg>
  );
}
