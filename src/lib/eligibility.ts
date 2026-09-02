// Eligibility engine — mirrors the rule "CSE/IT branch, CGPA >= 7.0, no active backlog"
export type StudentAcademics = { branch: string; cgpa: number; activeBacklogs: number };
export type DriveRules = { minimumCgpa: number; maximumBacklogs: number; branches: string[] };

export type EligibilityCheck = {
  eligible: boolean;
  reasons: string[]; // empty when eligible; human-readable failures otherwise
};

export function checkEligibility(student: StudentAcademics, rules: DriveRules): EligibilityCheck {
  const reasons: string[] = [];
  if (!rules.branches.includes(student.branch)) {
    reasons.push(`Branch not allowed (open to: ${rules.branches.join(", ")})`);
  }
  if (student.cgpa < rules.minimumCgpa) {
    reasons.push(`CGPA ${student.cgpa.toFixed(2)} is below the required ${rules.minimumCgpa.toFixed(2)}`);
  }
  if (student.activeBacklogs > rules.maximumBacklogs) {
    reasons.push(
      `${student.activeBacklogs} active backlog(s) exceed the allowed ${rules.maximumBacklogs}`
    );
  }
  return { eligible: reasons.length === 0, reasons };
}
