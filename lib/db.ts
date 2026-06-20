import { db } from '@vercel/postgres';

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
  created_at: Date;
}

export async function getAttendeeByEmailAndCode(email: string, code: number): Promise<Attendee | null> {
  const client = await db.connect();
  try {
    const result = await client.sql<Attendee>`
      SELECT id, email, unique_code, name 
      FROM workshop_attendees 
      WHERE LOWER(email) = LOWER(${email}) AND unique_code = ${code} 
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching attendee:', error);
    return null;
  } finally {
    client.release();
  }
}

export async function checkAttendanceLogged(email: string, code: number, sessionName: string): Promise<boolean> {
  const client = await db.connect();
  try {
    const result = await client.sql`
      SELECT id 
      FROM workshop_attendance_logs 
      WHERE LOWER(email) = LOWER(${email}) AND unique_code = ${code} AND session_name = ${sessionName}
      LIMIT 1
    `;
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error checking attendance log:', error);
    return false;
  } finally {
    client.release();
  }
}

export async function insertAttendanceLog(
  email: string,
  code: number,
  sessionName: string,
  takeaway: string,
  rating: number
): Promise<boolean> {
  const client = await db.connect();
  try {
    await client.sql`
      INSERT INTO workshop_attendance_logs (email, unique_code, session_name, takeaway, rating)
      VALUES (${email}, ${code}, ${sessionName}, ${takeaway}, ${rating})
    `;
    return true;
  } catch (error) {
    console.error('Error inserting attendance log:', error);
    return false;
  } finally {
    client.release();
  }
}

export async function getAttendanceLogsForUser(email: string): Promise<AttendanceLog[]> {
  const client = await db.connect();
  try {
    const result = await client.sql<AttendanceLog>`
      SELECT id, email, unique_code, session_name, takeaway, rating, created_at 
      FROM workshop_attendance_logs 
      WHERE LOWER(email) = LOWER(${email}) 
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    return [];
  } finally {
    client.release();
  }
}
