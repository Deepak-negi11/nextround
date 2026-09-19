"use client";

import { useActionState } from "react";
import { recordResult } from "@/actions/interviewer";
import type { ActionState } from "@/actions/interviewer";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";

export default function OutcomeForm({
  applicationId,
  roundId,
  initial,
}: {
  applicationId: number;
  roundId: number;
  initial: { outcome: string; score: string; rank: string; remarks: string };
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(recordResult, {});
  return (
    <form action={formAction} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_100px_80px_1fr_auto] sm:items-end">
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="roundId" value={roundId} />
      <div>
        <label className={labelCls}>Outcome</label>
        <select name="outcome" defaultValue={initial.outcome} className={inputCls}>
          <option value="SELECTED">Selected</option>
          <option value="NEXT_ROUND">Next round</option>
          <option value="REJECTED">Rejected</option>
          <option value="ABSENT">Absent</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Score</label>
        <input name="score" type="number" step="0.1" min="0" defaultValue={initial.score} placeholder="—" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Rank</label>
        <input name="rank" type="number" min="1" defaultValue={initial.rank} placeholder="—" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Remarks</label>
        <input name="remarks" defaultValue={initial.remarks} placeholder="Good problem solving…" className={inputCls} />
      </div>
      <SubmitButton>{state.ok ? "Saved ✓" : "Record"}</SubmitButton>
      {state.error && <p className="sm:col-span-5 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900">{state.error}</p>}
    </form>
  );
}
