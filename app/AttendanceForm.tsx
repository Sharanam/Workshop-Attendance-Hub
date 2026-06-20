'use client';

import { useState } from 'react';
import { verifyAttendeeAction, markAttendanceAction } from './actions';

interface AttendanceFormProps {
  email: string;
}

const SESSIONS = [
  'Session 1: Introduction to Web Architectures',
  'Session 2: Mastering Next.js Server Components',
  'Session 3: Database Integrations and Serverless Scaling',
  'Session 4: Building Agentic Coding Interfaces',
];

export default function AttendanceForm({ email }: AttendanceFormProps) {
  // Verification states
  const [codeStr, setCodeStr] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [verifError, setVerifError] = useState('');

  // Attendance logging states
  const [selectedSession, setSelectedSession] = useState('');
  const [takeaway, setTakeaway] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeStr.trim()) return;

    setIsVerifying(true);
    setVerifError('');
    setSubmitSuccess('');

    try {
      const res = await verifyAttendeeAction(codeStr);
      if (res.success) {
        setIsVerified(true);
        setVerifiedName(res.name || 'Attendee');
      } else {
        setVerifError(res.message || 'Verification failed.');
      }
    } catch (err) {
      setVerifError('An unexpected error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) {
      setSubmitError('Please select a session.');
      return;
    }
    if (!takeaway.trim()) {
      setSubmitError('Please answer the question about your takeaway.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const res = await markAttendanceAction(codeStr, selectedSession, takeaway, rating);
      if (res.success) {
        setSubmitSuccess(res.message || 'Attendance logged successfully!');
        // Reset feedback form
        setSelectedSession('');
        setTakeaway('');
        setRating(5);
      } else {
        setSubmitError(res.message || 'Failed to submit attendance.');
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetVerification = () => {
    setIsVerified(false);
    setVerifiedName('');
    setCodeStr('');
    setVerifError('');
    setSubmitError('');
    setSubmitSuccess('');
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* STEP 1: Verify Code */}
      <div className="neu-card p-6 md:p-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold tracking-tight">Step 1: Verify Registration Code</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter the unique integer code mapped to your email <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{email}</strong> to verify ownership.
        </p>

        {!isVerified ? (
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <input
              type="text"
              placeholder="e.g. 12345"
              value={codeStr}
              onChange={(e) => setCodeStr(e.target.value.replace(/\D/g, ''))}
              disabled={isVerifying}
              className="neu-inset px-4 py-3 flex-1 text-base placeholder-zinc-400 dark:placeholder-zinc-600 bg-transparent"
              required
            />
            <button
              type="submit"
              disabled={isVerifying || !codeStr}
              className="neu-btn px-6 py-3 font-semibold text-sm h-full whitespace-nowrap min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
            <div className="flex flex-col">
              <span className="text-green-600 dark:text-green-400 text-sm font-semibold flex items-center gap-2">
                ✓ Code Verified Successfully
              </span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-1">
                Name: <span className="font-bold">{verifiedName}</span> (Code: {codeStr})
              </span>
            </div>
            <button
              onClick={handleResetVerification}
              className="neu-btn px-4 py-2 text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-600"
            >
              Change Code
            </button>
          </div>
        )}

        {verifError && (
          <div className="p-3 text-sm text-red-600 dark:text-red-400 rounded-lg bg-red-500/10 border border-red-500/20">
            {verifError}
          </div>
        )}
      </div>

      {/* STEP 2: Attendance Feedback Form */}
      {isVerified && (
        <div className="neu-card p-6 md:p-8 flex flex-col gap-6 transition-all duration-300">
          <h2 className="text-xl font-bold tracking-tight">Step 2: Mark As Attended</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Provide feedback for the workshop session you participated in. You can log attendance for each session once.
          </p>

          <form onSubmit={handleSubmitAttendance} className="flex flex-col gap-6">
            {/* Session Select */}
            <div className="flex flex-col gap-2">
              <label htmlFor="session" className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                Which session did you attend?
              </label>
              <select
                id="session"
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="neu-inset px-4 py-3 text-base bg-transparent appearance-none cursor-pointer focus:outline-none"
                required
              >
                <option value="" disabled className="text-zinc-400 dark:text-zinc-600">-- Select Session --</option>
                {SESSIONS.map((s) => (
                  <option key={s} value={s} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Takeaway Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="takeaway" className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                What was your key takeaway from this session?
              </label>
              <textarea
                id="takeaway"
                rows={4}
                placeholder="Write a brief summary of what you learned or feedback on the session..."
                value={takeaway}
                onChange={(e) => setTakeaway(e.target.value)}
                className="neu-inset px-4 py-3 text-base bg-transparent resize-none placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none"
                required
              />
            </div>

            {/* Rating Stars */}
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                Rate this session
              </span>
              <div className="flex items-center gap-3 mt-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`rating-dot ${rating === num ? 'active' : ''}`}
                    title={`${num} Stars`}
                  >
                    {num}
                  </button>
                ))}
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 ml-2">
                  {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent!'}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-3 mt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedSession || !takeaway.trim()}
                className="neu-btn-accent w-full py-4 text-base font-bold tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Logging Attendance...' : 'Mark as Attended'}
              </button>
            </div>
          </form>

          {submitError && (
            <div className="p-3 text-sm text-red-600 dark:text-red-400 rounded-lg bg-red-500/10 border border-red-500/20">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 text-sm text-green-600 dark:text-green-400 rounded-lg bg-green-500/10 border border-green-500/20">
              {submitSuccess}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
