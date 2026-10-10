"use client";

import { useActionState, useState } from "react";
import { updateStudentIds, type IdsState } from "@/actions/users";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls } from "@/components/ui";

type Student = {
  id: number;
  rollNo: string;
  enrollmentNo: string | null;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  activeBacklogs: number;
  graduationYear: number;
};

// One row of the admin students table. "Edit IDs" turns the two ID cells into inputs —
// students can't change their university IDs themselves, so this is where they get corrected.
export default function StudentRow({ s }: { s: Student }) {
  const [editing, setEditing] = useState(false);
  // What was on screen when the last save succeeded, plus what was saved. Until the refreshed page
  // data arrives (it can lag a few seconds on a remote DB) the row shows the saved values instead.
  const [saved, setSaved] = useState<{ before: string; ids: { rollNo: string; enrollmentNo: string } } | null>(null);
  const [state, formAction] = useActionState<IdsState, FormData>(async (prev, fd) => {
    const result = await updateStudentIds(prev, fd);
    if (result.ok && result.ids) {
      setSaved({ before: `${s.rollNo}|${s.enrollmentNo}`, ids: result.ids });
      setEditing(false);
    }
    return result;
  }, {});
  const pending = saved && saved.before === `${s.rollNo}|${s.enrollmentNo}`;
  const rollNo = pending ? saved.ids.rollNo : s.rollNo;
  const enrollmentNo = pending ? saved.ids.enrollmentNo : s.enrollmentNo;
  const formId = `ids-${s.id}`;
  const idInput = `${inputCls} h-8 w-36 font-mono text-xs uppercase`;

  return (
    <tr className="align-top">
      <td className="py-2.5 pr-3 font-mono text-slate-500">
        {editing ? (
          <input form={formId} name="rollNo" aria-label={`University roll no for ${s.name}`} defaultValue={rollNo} required maxLength={40} className={idInput} />
        ) : (
          rollNo
        )}
      </td>
      <td className="py-2.5 pr-3 font-mono text-slate-500">
        {editing ? (
          <input form={formId} name="enrollmentNo" aria-label={`Enrollment no for ${s.name}`} defaultValue={enrollmentNo ?? ""} required maxLength={40} className={idInput} />
        ) : (
          enrollmentNo ?? <span className="font-sans text-xs text-amber-700">Missing</span>
        )}
      </td>
      <td className="py-2.5 font-medium">{s.name}</td>
      <td className="py-2.5 text-slate-600">{s.email}</td>
      <td className="py-2.5">{s.branch}</td>
      <td className="py-2.5">{s.cgpa.toFixed(2)}</td>
      <td className="py-2.5">{s.activeBacklogs}</td>
      <td className="py-2.5">{s.graduationYear}</td>
      <td className="py-2.5 text-right">
        {editing ? (
          <form id={formId} action={formAction} className="flex flex-col items-end gap-1.5">
            <input type="hidden" name="studentId" value={s.id} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(false)} className="text-xs text-slate-500 hover:text-slate-900">
                Cancel
              </button>
              <SubmitButton className="h-8 px-3 text-xs" pendingLabel="Saving…">Save</SubmitButton>
            </div>
            {state.error && <p role="alert" className="max-w-56 text-left text-xs text-red-700">{state.error}</p>}
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="whitespace-nowrap text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Edit IDs
          </button>
        )}
      </td>
    </tr>
  );
}
