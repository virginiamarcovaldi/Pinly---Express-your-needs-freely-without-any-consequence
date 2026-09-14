import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-16 items-center">
        <LoginForm />

        <aside className="hidden md:block rounded-2xl border border-brand-navy/10 bg-white/70 p-6">
          <h2 className="text-sm font-semibold text-brand-navy uppercase tracking-wide">
            Try the demo
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Lincoln High School is preloaded. Password: <code className="font-mono">demo1234</code>{" "}
            (or anything — passwords aren&apos;t checked in this demo).
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between gap-4">
              <span className="text-slate-500">Student</span>
              <code className="font-mono text-brand-navy">student1@lincoln.edu</code>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-slate-500">Teacher</span>
              <code className="font-mono text-brand-navy">teacher@lincoln.edu</code>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-slate-500">Student rep</span>
              <code className="font-mono text-brand-navy">rep@lincoln.edu</code>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-slate-500">Counselor</span>
              <code className="font-mono text-brand-navy">counselor@lincoln.edu</code>
            </li>
          </ul>
          <p className="text-xs text-slate-400 mt-4">
            Or sign up with any other email — a new fictitious school is created automatically
            from your email&apos;s domain.
          </p>
        </aside>
      </div>
    </div>
  );
}
