'use server';

import { getSessionUser } from '@/lib/auth';
import { getAttendeeByEmailAndCode, checkAttendanceLogged, insertAttendanceLog } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function verifyAttendeeAction(codeStr: string) {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Not authenticated' };
  }

  const code = parseInt(codeStr, 10);
  if (isNaN(code)) {
    return { success: false, message: 'Invalid code format. Please enter an integer.' };
  }

  const attendee = await getAttendeeByEmailAndCode(user.email, code);
  if (!attendee) {
    return { success: false, message: 'Verification failed. This code does not belong to your email.' };
  }

  return { success: true, name: attendee.name, message: `Code verified! Welcome, ${attendee.name}.` };
}

export async function markAttendanceAction(
  codeStr: string,
  sessionName: string,
  takeaway: string,
  ratingVal: number
) {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Not authenticated' };
  }

  const code = parseInt(codeStr, 10);
  if (isNaN(code)) {
    return { success: false, message: 'Invalid code format.' };
  }

  if (!sessionName.trim()) {
    return { success: false, message: 'Please select a session.' };
  }

  const rating = Math.max(1, Math.min(5, ratingVal));

  // 1. Verify code again for security
  const attendee = await getAttendeeByEmailAndCode(user.email, code);
  if (!attendee) {
    return { success: false, message: 'Verification failed. Code does not match your account.' };
  }

  // 2. Check if already marked
  const alreadyMarked = await checkAttendanceLogged(user.email, code, sessionName);
  if (alreadyMarked) {
    return { success: false, message: `You have already marked attendance for "${sessionName}".` };
  }

  // 3. Insert log
  const success = await insertAttendanceLog(user.email, code, sessionName, takeaway, rating);
  if (!success) {
    return { success: false, message: 'Failed to record attendance. Please try again.' };
  }

  // 4. Revalidate page to refresh attendance log history
  revalidatePath('/');

  return { success: true, message: `Attendance for "${sessionName}" marked successfully!` };
}
