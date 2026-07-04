// Supabase Edge Function: send-contact
//
// Sends a message from the public marketing page's contact form to the
// site owner's inbox via Resend. Unlike send-quote/send-invoice, the caller
// is an anonymous visitor (not signed in) — there is no user/ownership check,
// only input validation. The visitor's own e-mail is set as reply-to, so
// replying from the inbox goes straight back to them.
//
// Deploy:   supabase functions deploy send-contact
// Secrets:  supabase secrets set RESEND_API_KEY=re_xxx
//           supabase secrets set RESEND_FROM="Freezo <onboarding@resend.dev>"   (optional)
//           supabase secrets set CONTACT_TO=info@freezo.nl                       (optional)
//
// Note: without a verified domain in Resend you can only send from
// onboarding@resend.dev and only to your own Resend account e-mail.

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const { name, email, message } = await req.json()

    if (!name || !String(name).trim()) return json({ error: 'Naam is verplicht' }, 400)
    if (!email || !isValidEmail(String(email))) return json({ error: 'Geldig e-mailadres is verplicht' }, 400)
    if (!message || !String(message).trim()) return json({ error: 'Bericht is verplicht' }, 400)

    // Cap lengths — a public, unauthenticated endpoint is an easy spam target.
    const safeName = String(name).trim().slice(0, 100)
    const safeEmail = String(email).trim().slice(0, 200)
    const safeMessage = String(message).trim().slice(0, 4000)

    const apiKey = Deno.env.get('RESEND_API_KEY')
    if (!apiKey) return json({ error: 'RESEND_API_KEY ontbreekt op de server' }, 500)
    const from = Deno.env.get('RESEND_FROM') ?? 'Freezo <onboarding@resend.dev>'
    const to = Deno.env.get('CONTACT_TO') ?? 'info@freezo.nl'

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1f36;line-height:1.6">
        <p><strong>Naam:</strong> ${esc(safeName)}</p>
        <p><strong>E-mail:</strong> ${esc(safeEmail)}</p>
        <p><strong>Bericht:</strong><br/>${esc(safeMessage).replace(/\n/g, '<br/>')}</p>
      </div>`

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: safeEmail,
        subject: `Nieuw contactbericht van ${safeName}`,
        html,
      }),
    })

    if (!resendRes.ok) {
      const detail = await resendRes.text()
      return json({ error: `Resend gaf een fout: ${detail}` }, 502)
    }

    return json({ ok: true })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Onbekende fout' }, 500)
  }
})
