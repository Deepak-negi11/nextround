import { BRANCHES } from "@/lib/constants";
import { MIN_PASSWORD_LENGTH, allowedStudentDomains } from "@/lib/validation";
import RegisterForm from "./RegisterForm";

// Server wrapper: reads the allowed sign-up domains from the environment for the form's hints.
export default function RegisterPage() {
  return <RegisterForm domains={allowedStudentDomains()} branches={BRANCHES} minPassword={MIN_PASSWORD_LENGTH} />;
}
