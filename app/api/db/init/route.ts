import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { writeAttendeesList, Attendee } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const adminSecret = searchParams.get('secret');

  const validSecret = process.env.BASIC_AUTH_PASSWORD;

  // Simple security check using BASIC_AUTH_PASSWORD
  if (!validSecret || adminSecret !== validSecret) {
    return NextResponse.json(
      { error: 'Unauthorized. Please provide the correct secret query param matching your BASIC_AUTH_PASSWORD: ?secret=...' },
      { status: 401 }
    );
  }

  try {
    // 1. Check if attendees list already exists by listing blobs
    const { blobs } = await list();
    const attendeesBlob = blobs.find((b) => b.pathname === 'attendees.json');
    
    let attendees: Attendee[] = [];
    
    if (attendeesBlob) {
      try {
        const response = await fetch(`${attendeesBlob.url}?t=${Date.now()}`, { cache: 'no-store' });
        if (response.ok) {
          attendees = await response.json();
        }
      } catch (e) {
        console.error('Error fetching existing attendees:', e);
      }
    }

    // 2. Parse optional query parameters for seeding
    const seedEmail = searchParams.get('email');
    const seedCodeStr = searchParams.get('code');
    const seedName = searchParams.get('name') || 'Workshop Attendee';

    if (seedEmail && seedCodeStr) {
      const seedCode = parseInt(seedCodeStr, 10);
      if (isNaN(seedCode)) {
        return NextResponse.json({ error: 'Code must be an integer' }, { status: 400 });
      }

      // Check if email already registered, update or insert
      const existingIndex = attendees.findIndex(
        (a) => a.email.toLowerCase() === seedEmail.toLowerCase()
      );

      const nextId = attendees.length > 0 ? Math.max(...attendees.map((a) => a.id)) + 1 : 1;

      const seededUser: Attendee = {
        id: existingIndex >= 0 ? attendees[existingIndex].id : nextId,
        email: seedEmail,
        unique_code: seedCode,
        name: seedName,
      };

      if (existingIndex >= 0) {
        attendees[existingIndex] = seededUser;
      } else {
        attendees.push(seededUser);
      }

      const success = await writeAttendeesList(attendees);
      if (!success) {
        throw new Error('Failed to write attendees list to Vercel Blob.');
      }

      return NextResponse.json({
        message: 'Vercel Blob datastore verified and user seeded successfully!',
        seeded: seededUser,
        totalAttendeesCount: attendees.length,
      });
    }

    // If no seeding param, just ensure the file exists or state status
    if (!attendeesBlob) {
      const success = await writeAttendeesList([]);
      if (!success) {
        throw new Error('Failed to create empty attendees.json file in Vercel Blob.');
      }
      return NextResponse.json({
        message: 'Empty attendees.json initialized successfully in Vercel Blob storage.',
      });
    }

    return NextResponse.json({
      message: 'Vercel Blob datastore is already initialized. To register a user, add &email=...&code=...&name=... to this URL.',
      totalAttendeesCount: attendees.length,
    });

  } catch (error: any) {
    console.error('Vercel Blob datastore setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
