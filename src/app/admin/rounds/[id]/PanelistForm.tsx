"use client";

import { useActionState } from "react";
import { assignPanelist } from "@/actions/admin";
import type { ActionState } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";

export default function PanelistForm({
  roundId,
  interviewers,
}: {
  roundId: number;
  interviewers: { id: number; name: string }[];
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(assignPanelist, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
      <input type="hidden" name="roundId" value={roundId} />
      <div className="min-w-56">
        <label className={labelCls} htmlFor="interviewerId">Interviewer / recruiter</label>
        <select id="interviewerId" name="interviewerId" className={inputCls}>
          {interviewers.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>
      <SubmitButton>Assign</SubmitButton>
      {state.ok && <p className="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900">{state.ok}</p>}
    </form>
  );
}
