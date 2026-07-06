import { headers } from 'next/headers'
import { Webhook } from 'svix'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 })

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.text()
  let evt: WebhookEvent
  try {
    evt = new Webhook(secret).verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Clerk webhook signature verification failed', err)
    return new Response('Invalid signature', { status: 400 })
  }

  const supabase = createServiceRoleClient()

  switch (evt.type) {
    case 'user.created': {
      const { id, username, first_name, last_name, image_url } = evt.data
      await supabase.from('profiles').insert({
        id,
        username: username ?? id,
        display_name: [first_name, last_name].filter(Boolean).join(' ') || null,
        avatar_url: image_url ?? null,
      })
      break
    }
    case 'user.updated': {
      const { id, username, first_name, last_name, image_url } = evt.data
      await supabase
        .from('profiles')
        .update({
          username: username ?? id,
          display_name: [first_name, last_name].filter(Boolean).join(' ') || null,
          avatar_url: image_url ?? null,
        })
        .eq('id', id)
      break
    }
    case 'user.deleted': {
      if (evt.data.id) await supabase.from('profiles').delete().eq('id', evt.data.id)
      break
    }
  }

  return new Response('OK', { status: 200 })
}
