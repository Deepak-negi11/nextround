"use client";

import { useActionState } from "react";
import { announceRound, publishRoundResults, shortlistForRound, type ActionState } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

export type Candidate = {
  applicationId: number;
  name: string;
  rollNo: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  resumeLink: string | null;
  checked: boolean; // pre-ticked: already shortlisted, or an interviewer recorded a pass
};

function Message({ state }: { state: ActionState }) {
  if (state.error)
    return <p role="alert" className="animate-shake rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  if (state.ok)
    return <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.ok}</p>;
  return null;
}

// Tick-box table of students; used for both the round-1 shortlist and each round's results.
function CandidateTable({ candidates, name, label }: { candidates: Candidate[]; name: string; label: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="w-10 pb-2"><span className="sr-only">{label}</span></th>
            <th className="pb-2">Student</th><th className="pb-2">Branch</th><th className="pb-2">CGPA</th><th className="pb-2">Backlogs</th><th className="pb-2">Résumé</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {candidates.map((c) => (
            <tr key={c.applicationId} className="transition-colors hover:bg-slate-50">
              <td className="py-2.5">
                <input
                  type="checkbox"
                  name={name}
                  value={c.applicationId}
                  defaultChecked={c.checked}
                  aria-label={`${label}: ${c.name}`}
                  className="h-4 w-4 cursor-pointer accent-brand-600"
                />
              </td>
              <td className="py-2.5">
                <p className="font-medium">{c.name}</p>
                <p className="font-mono text-xs text-slate-400">{c.rollNo}</p>
              </td>
              <td className="py-2.5">{c.branch}</td>
              <td className="py-2.5">{c.cgpa.toFixed(2)}</td>
              <td className="py-2.5">{c.backlogs}</td>
              <td className="py-2.5">
                {c.resumeLink ? (
                  <a href={c.resumeLink} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Open</a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AnnounceForm({ roundId }: { roundId: number }) {
  const [state, formAction] = useActionState<ActionState, FormData>(announceRound, {});
  return (
    <form action={formAction} className="flex max-w-sm flex-col items-end gap-2">
      <input type="hidden" name="roundId" value={roundId} />
      <SubmitButton pendingLabel="Announcing…">📣 Announce to students</SubmitButton>
      <Message state={state} />
    </form>
  );
}

export function ShortlistForm({ roundId, roundNumber, candidates }: { roundId: number; roundNumber: number; candidates: Candidate[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(shortlistForRound, {});
  if (candidates.length === 0) return <p className="text-sm text-slate-500">No applications to shortlist yet.</p>;
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="roundId" value={roundId} />
      <p className="text-sm text-slate-600">
        Tick the students the company shortlisted for Round {roundNumber}. When you save, ticked students are told they are
        shortlisted, and <strong>unticked students are told they were not shortlisted</strong>.
      </p>
      <CandidateTable candidates={candidates} name="applicationId" label="Shortlisted" />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Saving…">Save shortlist</SubmitButton>
        <button
          type="submit"
          name="all"
          value="1"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-50 active:scale-[0.97]"
        >
          Shortlist everyone ({candidates.length})
        </button>
      </div>
      <Message state={state} />
    </form>
  );
}

export function ResultsForm({ roundId, roundNumber, candidates, laterRoundExists }: {
  roundId: number;
  roundNumber: number;
  candidates: Candidate[];
  laterRoundExists: boolean;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(publishRoundResults, {});
  if (candidates.length === 0) return <p className="text-sm text-slate-500">No students are in this round.</p>;
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="roundId" value={roundId} />
      <p className="text-sm text-slate-600">
        Tick the students who <strong>cleared Round {roundNumber}</strong>, as told by the company. Unticked students are
        marked not selected. Everyone is notified when you publish.
      </p>
      <CandidateTable candidates={candidates} name="cleared" label="Cleared" />
      <fieldset className="space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
        <legend className="sr-only">Is this the final round?</legend>
        <label className="flex cursor-pointer items-start gap-2">
          <input type="radio" name="final" value="no" required className="mt-0.5 accent-brand-600" />
          <span><strong>More rounds will follow.</strong> Ticked students move on; add the next round on the drive page and announce it.</span>
        </label>
        <label className="flex cursor-pointer items-start gap-2">
          <input type="radio" name="final" value="yes" required className="mt-0.5 accent-brand-600" />
          <span>
            <strong>This was the final round.</strong> Ticked students are marked Selected and you can issue their offers.
            {laterRoundExists && <span className="text-amber-700"> (A later round already exists and would be skipped.)</span>}
          </span>
        </label>
      </fieldset>
      <SubmitButton pendingLabel="Publishing…">✅ Publish results</SubmitButton>
      <Message state={state} />
    </form>
  );
}
