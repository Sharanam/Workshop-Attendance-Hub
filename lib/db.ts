import { list, put } from '@vercel/blob';

export interface Attendee {
  id: number;
  email: string;
  unique_code: number;
  name: string;
}

export interface AttendanceLog {
  id: number;
  email: string;
  unique_code: number;
  session_name: string;
  takeaway: string;
  rating: number;
  created_at: string; // ISO String
}

// Helper to list all blobs and search for a specific filename
async function getBlobUrl(pathname: string): Promise<string | null> {
  const normalizedPath = pathname.replace(/^(\.\/|\/)/, '');
  try {
    const { blobs } = await list();
    const target = blobs.find(b => b.pathname === normalizedPath);
    return target ? target.url : null;
  } catch (e) {
    console.error(`getBlobUrl: Error listing blobs for "${normalizedPath}":`, e);
    return null;
  }
}

// Helper to retrieve and parse JSON file from Private Blob
async function fetchJsonFromBlob<T>(pathname: string, defaultValue: T): Promise<T> {
  const url = await getBlobUrl(pathname);
  if (!url) return defaultValue;
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is missing in environment variables.');
    }

    // Authenticate direct HTTP read request using the BLOB_READ_WRITE_TOKEN
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error fetching blob: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (e: any) {
    console.error(`fetchJsonFromBlob: Error fetching/parsing blob data for "${pathname}" from url: ${url}`, e);
    return defaultValue;
  }
}

// Helper to write JSON data to Vercel Blob
async function saveJsonToBlob(pathname: string, data: any): Promise<boolean> {
  const normalizedPath = pathname.replace(/^(\.\/|\/)/, '');
  try {
    await put(normalizedPath, JSON.stringify(data, null, 2), {
      access: 'private' as any,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return true;
  } catch (e) {
    console.error(`saveJsonToBlob: Error uploading JSON blob for "${normalizedPath}":`, e);
    return false;
  }
}

// API: Verify attendee code
export async function getAttendeeByEmailAndCode(email: string, code: number): Promise<Attendee | null> {
  const attendees = await fetchJsonFromBlob<Attendee[]>('attendees.json', []);
  const match = attendees.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.unique_code === code
  );
  return match || null;
}

// API: Check if attendee already marked attendance for this session
export async function checkAttendanceLogged(email: string, code: number, sessionName: string): Promise<boolean> {
  const logs = await fetchJsonFromBlob<AttendanceLog[]>('attendance_logs.json', []);
  const exists = logs.some(
    (l) =>
      l.email.toLowerCase() === email.toLowerCase() &&
      l.unique_code === code &&
      l.session_name === sessionName
  );
  return exists;
}

// API: Insert a new attendance log
export async function insertAttendanceLog(
  email: string,
  code: number,
  sessionName: string,
  takeaway: string,
  rating: number
): Promise<boolean> {
  const logs = await fetchJsonFromBlob<AttendanceLog[]>('attendance_logs.json', []);

  const newLog: AttendanceLog = {
    id: logs.length > 0 ? Math.max(...logs.map((l) => l.id)) + 1 : 1,
    email,
    unique_code: code,
    session_name: sessionName,
    takeaway,
    rating,
    created_at: new Date().toISOString(),
  };

  logs.push(newLog);
  return await saveJsonToBlob('attendance_logs.json', logs);
}

// API: Fetch all logs for a user (to display in sidebar)
export async function getAttendanceLogsForUser(email: string): Promise<AttendanceLog[]> {
  const logs = await fetchJsonFromBlob<AttendanceLog[]>('attendance_logs.json', []);
  return logs
    .filter((l) => l.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Setup Helper (used in initialization route)
export async function writeAttendeesList(attendees: Attendee[]): Promise<boolean> {
  return await saveJsonToBlob('attendees.json', attendees);
}
