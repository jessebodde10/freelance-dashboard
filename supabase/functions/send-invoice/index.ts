// Supabase Edge Function: send-invoice
//
// Sends an invoice PDF (generated client-side and passed as base64) to the
// client's e-mail address via Resend. The caller must be authenticated; the
// invoice and recipient are looked up server-side with the caller's token so a
// user can only mail their own invoices to the real client address.
//
// Deploy:   supabase functions deploy send-invoice
// Secrets:  supabase secrets set RESEND_API_KEY=re_xxx
//           supabase secrets set RESEND_FROM="Freezo <onboarding@resend.dev>"   (optional)
//
// Note: without a verified domain in Resend you can only send from
// onboarding@resend.dev and only to your own Resend account e-mail. Verify a
// domain and set RESEND_FROM to send to any client.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader) return json({ error: 'Niet ingelogd' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData.user) return json({ error: 'Niet ingelogd' }, 401)
    const user = userData.user

    const { invoiceId, pdfBase64, subject, message } = await req.json()
    if (!invoiceId || !pdfBase64) return json({ error: 'invoiceId en pdfBase64 zijn verplicht' }, 400)

    // Look up the invoice (RLS guarantees ownership) and its client.
    const { data: invoice, error: iErr } = await supabase
      .from('invoices')
      .select('nr, klant_id')
      .eq('id', invoiceId)
      .single()
    if (iErr || !invoice) return json({ error: 'Factuur niet gevonden' }, 404)
    if (!invoice.klant_id) return json({ error: 'Koppel eerst een klant aan de factuur' }, 400)

    const { data: klant, error: cErr } = await supabase
      .from('clients')
      .select('bedrijf, contact, email')
      .eq('id', invoice.klant_id)
      .single()
    if (cErr || !klant) return json({ error: 'Klant niet gevonden' }, 404)
    if (!klant.email) return json({ error: 'Deze klant heeft geen e-mailadres' }, 400)

    const { data: profile } = await supabase
      .from('profiles')
      .select('bedrijf, voornaam, achternaam')
      .eq('id', user.id)
      .single()
    const senderName =
      profile?.bedrijf ||
      [profile?.voornaam, profile?.achternaam].filter(Boolean).join(' ') ||
      'Freezo'

    const apiKey = Deno.env.get('RESEND_API_KEY')
    if (!apiKey) return json({ error: 'RESEND_API_KEY ontbreekt op de server' }, 500)
    const from = Deno.env.get('RESEND_FROM') ?? 'Freezo <onboarding@resend.dev>'

    // Use the user's own subject/message when provided; otherwise a default.
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const html = message
      ? `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1f36;line-height:1.6">${esc(String(message)).replace(/\n/g, '<br/>')}</div>`
      : `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1f36;line-height:1.6">
        <p>Beste ${klant.contact || klant.bedrijf},</p>
        <p>In de bijlage vind je factuur <strong>${invoice.nr}</strong> van ${senderName}.</p>
        <p>Je vindt de betaalgegevens en vervaldatum op de factuur. Heb je vragen? Beantwoord gerust deze e-mail.</p>
        <p>Met vriendelijke groet,<br/>${senderName}</p>
      </div>`
    const subj = (subject && String(subject).trim()) || `Factuur ${invoice.nr} van ${senderName}`

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [klant.email],
        subject: subj,
        html,
        attachments: [{ filename: `Factuur-${invoice.nr}.pdf`, content: pdfBase64 }],
      }),
    })

    if (!resendRes.ok) {
      const detail = await resendRes.text()
      return json({ error: `Resend gaf een fout: ${detail}` }, 502)
    }

    return json({ ok: true, to: klant.email })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Onbekende fout' }, 500)
  }
})
