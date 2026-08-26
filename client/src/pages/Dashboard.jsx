import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import Navbar from "../components/Navbar.jsx";
import ComposeForm from "../components/ComposeForm.jsx";
import DraftList from "../components/DraftList.jsx";
import Footer from "../components/Footer.jsx";

export default function Dashboard({ user, onSignOut }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const loadDrafts = useCallback(async () => {
    const res = await api.get("/drafts");
    setDrafts(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  async function handleSaveDraft(form) {
    setBusy(true);
    setError(null);
    try {
      const res = await api.post("/drafts", form);
      setDrafts((prev) => [res.data, ...prev]);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to save draft");
    } finally {
      setBusy(false);
    }
  }

  async function handleScheduleNew(form, scheduledAtIso) {
    setBusy(true);
    setError(null);
    try {
      const created = await api.post("/drafts", form);
      const scheduled = await api.post("/schedule", {
        draftId: created.data._id,
        scheduledAt: scheduledAtIso,
      });
      setDrafts((prev) => [scheduled.data, ...prev]);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to schedule send");
    } finally {
      setBusy(false);
    }
  }

  async function handleSchedule(draftId, scheduledAtIso) {
    setBusy(true);
    setError(null);
    try {
      const res = await api.post("/schedule", { draftId, scheduledAt: scheduledAtIso });
      setDrafts((prev) => prev.map((d) => (d._id === draftId ? res.data : d)));
    } catch (e) {
      setError(e.response?.data?.error || "Failed to schedule send");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(draftId) {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/drafts/${draftId}`);
      setDrafts((prev) => prev.filter((d) => d._id !== draftId));
    } catch (e) {
      setError(e.response?.data?.error || "Failed to delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} onSignOut={onSignOut} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-rust/10 border border-rust/30 text-rust text-sm px-4 py-3 rounded-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ComposeForm onSaveDraft={handleSaveDraft} onScheduleNew={handleScheduleNew} busy={busy} />
          <div>
            {loading ? (
              <p className="text-ink/40 text-sm">Loading…</p>
            ) : (
              <DraftList
                drafts={drafts}
                onDelete={handleDelete}
                onSchedule={handleSchedule}
                busy={busy}
              />
            )}
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-ink/10">
          <Footer dark={false} />
        </div>
      </main>
    </div>
  );
}
