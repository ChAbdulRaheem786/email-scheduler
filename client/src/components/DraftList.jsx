import { useEffect, useState } from "react";

const STATUS_ORDER = ["scheduled", "draft", "failed", "sent"];
const STATUS_LABEL = { scheduled: "Scheduled", draft: "Drafts", failed: "Failed", sent: "Sent" };

export default function DraftList({ drafts, onDelete, onSchedule, busy }) {
  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: drafts.filter((d) => d.status === status),
  })).filter((g) => g.items.length > 0);

  if (drafts.length === 0) {
    return (
      <div className="border border-dashed border-ink/20 rounded-sm p-10 text-center text-ink/50">
        <p className="font-display text-lg mb-1">Nothing here yet</p>
        <p className="text-sm">Compose an email on the left to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {grouped.map((g) => (
        <div key={g.status}>
          <h3 className="font-mono text-xs uppercase tracking-widest text-ink/40 mb-3">
            {STATUS_LABEL[g.status]} · {g.items.length}
          </h3>
          <div className="space-y-3">
            {g.items.map((draft) => (
              <DraftCard
                key={draft._id}
                draft={draft}
                onDelete={onDelete}
                onSchedule={onSchedule}
                busy={busy}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DraftCard({ draft, onDelete, onSchedule, busy }) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (draft.status !== "scheduled" || !draft.scheduledAt) return;
    function tick() {
      setCountdown(formatCountdown(new Date(draft.scheduledAt)));
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [draft.status, draft.scheduledAt]);

  return (
    <div className="bg-white border border-ink/10 rounded-sm p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-base truncate">{draft.subject}</span>
            {draft.status === "scheduled" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-brass-dark bg-brass/10 px-2 py-0.5 rounded-full">
                <ClockIcon /> {countdown}
              </span>
            )}
          </div>
          <p className="text-xs text-ink/50 font-mono mt-0.5">To: {draft.to}</p>
          <p className="text-sm text-ink/70 mt-2 line-clamp-2">{draft.body}</p>
          {draft.status === "failed" && draft.error && (
            <p className="text-xs text-rust mt-2">Error: {draft.error}</p>
          )}
          {draft.status === "sent" && draft.sentAt && (
            <p className="text-xs text-sage mt-2 font-mono">
              Sent {new Date(draft.sentAt).toLocaleString()}
            </p>
          )}
        </div>

        {draft.status !== "sent" && (
          <div className="flex flex-col gap-2 shrink-0">
            {(draft.status === "draft" || draft.status === "failed") && (
              <button
                onClick={() => setRescheduling((v) => !v)}
                className="focus-ring text-xs font-medium text-brass-dark hover:text-rust whitespace-nowrap"
              >
                Schedule
              </button>
            )}
            {draft.status === "scheduled" && (
              <button
                onClick={() => setRescheduling((v) => !v)}
                className="focus-ring text-xs font-medium text-ink/60 hover:text-brass-dark whitespace-nowrap"
              >
                Reschedule
              </button>
            )}
            <button
              onClick={() => onDelete(draft._id)}
              disabled={busy}
              className="focus-ring text-xs text-ink/40 hover:text-rust whitespace-nowrap"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {rescheduling && (
        <div className="mt-3 pt-3 border-t border-ink/10 flex items-center gap-2">
          <input
            type="datetime-local"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="border border-ink/15 rounded-sm px-2 py-1.5 text-sm font-mono"
          />
          <button
            onClick={async () => {
              if (!newTime) return;
              await onSchedule(draft._id, new Date(newTime).toISOString());
              setRescheduling(false);
              setNewTime("");
            }}
            disabled={busy || !newTime}
            className="focus-ring bg-brass text-white text-xs font-medium px-3 py-1.5 rounded-sm hover:bg-brass-dark disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}

function formatCountdown(target) {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return "sending…";
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `in ${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `in ${days}d ${hours % 24}h`;
}

function ClockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <circle cx="5" cy="5" r="4.25" stroke="currentColor" strokeWidth="1" />
      <path d="M5 2.5V5l1.8 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
