import { NextResponse } from 'next/server';
import { db } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const adminSecret = searchParams.get('secret');

  const validSecret = process.env.BASIC_AUTH_PASSWORD;

  // Simple security check using BASIC_AUTH_PASSWORD to protect the db setup
  if (!validSecret || adminSecret !== validSecret) {
    return NextResponse.json(
      { error: 'Unauthorized. Please provide the correct secret query param matching your BASIC_AUTH_PASSWORD: ?secret=...' },
      { status: 401 }
    );
  }

  const client = await db.connect();
  try {
    // 1. Create attendees table
    await client.sql`
      CREATE TABLE IF NOT EXISTS workshop_attendees (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        unique_code INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        CONSTRAINT unique_email_code UNIQUE (email, unique_code)
      );
    `;

    // 2. Create attendance logs table
    await client.sql`
      CREATE TABLE IF NOT EXISTS workshop_attendance_logs (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        unique_code INTEGER NOT NULL,
        session_name VARCHAR(255) NOT NULL,
        takeaway TEXT,
        rating INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Optional Seeding
    const seedEmail = searchParams.get('email');
    const seedCodeStr = searchParams.get('code');
    const seedName = searchParams.get('name') || 'Workshop Attendee';

    if (seedEmail && seedCodeStr) {
      const seedCode = parseInt(seedCodeStr, 10);
      if (isNaN(seedCode)) {
        return NextResponse.json({ error: 'Code must be an integer' }, { status: 400 });
      }

      await client.sql`
        INSERT INTO workshop_attendees (email, unique_code, name)
        VALUES (${seedEmail}, ${seedCode}, ${seedName})
        ON CONFLICT (email, unique_code) DO UPDATE 
        SET name = ${seedName}
      `;

      return NextResponse.json({
        message: 'Database tables verified/created and user seeded successfully!',
        seeded: { email: seedEmail, code: seedCode, name: seedName }
      });
    }

    return NextResponse.json({
      message: 'Database tables verified/created successfully! To seed a user mapping, add &email=...&code=...&name=... to this request URL.'
    });

  } catch (error: any) {
    console.error('Database setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
