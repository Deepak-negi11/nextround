"use client";

import { useActionState } from "react";
import { updateEligibility } from "@/actions/admin";
import type { ActionState } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];

export default function EligibilityForm({
  driveId,
  initial,
}: {
  driveId: number;
  initial: { minimumCgpa: number; maximumBacklogs: number; branches: string[] };
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateEligibility, {});
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="driveId" value={driveId} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="minimumCgpa">Minimum CGPA</label>
          <input id="minimumCgpa" name="minimumCgpa" type="number" step="0.1" min="0" max="10" defaultValue={initial.minimumCgpa} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="maximumBacklogs">Max active backlogs</label>
          <input id="maximumBacklogs" name="maximumBacklogs" type="number" min="0" defaultValue={initial.maximumBacklogs} className={inputCls} />
        </div>
      </div>
      <div>
        <span className={labelCls}>Eligible branches</span>
        <div className="flex flex-wrap gap-3">
          {BRANCHES.map((b) => (
            <label key={b} className="flex items-center gap-1.5 text-sm text-slate-700">
              <input type="checkbox" name="branches" value={b} defaultChecked={initial.branches.includes(b)} className="rounded border-slate-300" />
              {b}
            </label>
          ))}
        </div>
      </div>
      {state.error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.ok}</p>}
      <SubmitButton>Update rules</SubmitButton>
    </form>
  );
}
