import { UserRolePanel } from "./_components/user-role-panel";
import { EnrollmentPanel } from "./_components/enrollment-panel";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <UserRolePanel />
      <EnrollmentPanel />
    </div>
  );
}