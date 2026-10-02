import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { dispatchNotification } from '@/lib/notifications/dispatch';

const payloadSchema = z.object({
  channel: z.enum(['EMAIL', 'SMS', 'RCS', 'WHATSAPP', 'PUSH', 'IN_APP']),
  recipient: z.string().min(1),
  title: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1),
  href: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid notification payload' }, { status: 400 });
  }

  try {
    const outcome = await dispatchNotification(parsed.data);
    return NextResponse.json({ status: 'SENT', ...outcome });
  } catch (error) {
    return NextResponse.json(
      { status: 'FAILED', error: error instanceof Error ? error.message : 'Notification delivery failed' },
      { status: 502 }
    );
  }
}
