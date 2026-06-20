import { getSessionUser } from '@/lib/auth';
import { getAttendanceLogsForUser } from '@/lib/db';
import AttendanceForm from './AttendanceForm';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  const user = await getSessionUser();
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  // Render landing page if user is not logged in
  if (!user) {
    return (
      <div className="flex-1 flex flex-col justify-between p-6 md:p-12 max-w-5xl mx-auto w-full">
        {/* Empty header for spacing */}
        <div />

        {/* Neumorphic Landing Card */}
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 py-12">
          {error && (
            <div className="w-full p-4 mb-2 text-sm text-red-600 dark:text-red-400 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              {error === 'auth_failed' && 'Authentication failed. Please try again.'}
              {error === 'token_exchange_failed' && 'Failed to establish secure session with Google.'}
              {error === 'user_info_failed' && 'Could not retrieve profile information from Google.'}
              {error === 'no_code' && 'OAuth callback missing authorization code.'}
              {error !== 'auth_failed' && error !== 'token_exchange_failed' && error !== 'user_info_failed' && error !== 'no_code' && 'An authentication error occurred.'}
            </div>
          )}

          <div className="neu-card w-full p-8 md:p-10 flex flex-col items-center text-center gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest font-extrabold text-blue-500 dark:text-blue-400">
                Workshop Portal
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-zinc-800 dark:text-zinc-100">
                Generic Attendance system for workshops
              </h1>
            </div>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-xs">
              To check your codes, log attendance, and submit session feedback, please sign in with your Google account.
            </p>

            <a
              href="/api/auth/login"
              className="neu-btn w-full py-4 px-6 flex items-center justify-center text-base font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
            >
              <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            Developed by{' '}
            <a
              href="https://www.linkedin.com/in/sharanam-chotai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-blue-500 transition-colors"
            >
              Sharanam Chotai
            </a>
          </p>
        </footer>
      </div>
    );
  }

  // Fetch logged attendance records for the authenticated user
  const attendanceLogs = await getAttendanceLogsForUser(user.email);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-12 max-w-5xl mx-auto w-full gap-8">
      {/* Header */}
      <header className="neu-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-12 h-12 rounded-full border-2 border-zinc-200 dark:border-zinc-800"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Welcome back,</span>
            <span className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100">{user.name}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 select-all font-mono">{user.email}</span>
          <a
            href="/api/auth/logout"
            className="neu-btn px-5 py-2.5 text-sm font-bold text-red-500 dark:text-red-400 hover:text-red-600 w-full sm:w-auto text-center"
          >
            Logout
          </a>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Code Verification and Logger */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <AttendanceForm email={user.email} />
        </section>

        {/* Right Panel: Attendance History */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="neu-card p-6 md:p-8 flex flex-col gap-6">
            <h2 className="text-xl font-bold tracking-tight">Your Attendance History</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sessions you have successfully verified and marked as attended.
            </p>

            {attendanceLogs.length === 0 ? (
              <div className="neu-inset p-6 text-center text-sm text-zinc-400 dark:text-zinc-500 italic">
                No sessions attended yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                {attendanceLogs.map((log) => (
                  <div key={log.id} className="neu-inset p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-extrabold text-zinc-700 dark:text-zinc-300 leading-snug">
                        {log.session_name}
                      </h3>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 italic bg-black/5 dark:bg-white/5 p-2 rounded-lg leading-relaxed">
                      &ldquo;{log.takeaway}&rdquo;
                    </p>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Code: {log.unique_code}</span>
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <span>★</span>
                        <span>{log.rating}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-zinc-500 dark:text-zinc-400">
        <p>
          Developed by{' '}
          <a
            href="https://www.linkedin.com/in/sharanam-chotai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:text-blue-500 transition-colors"
          >
            Sharanam Chotai
          </a>
        </p>
      </footer>
    </div>
  );
}
