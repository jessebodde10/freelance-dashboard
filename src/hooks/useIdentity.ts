import { useMemo } from 'react'
import { useAuth } from '../auth'
import { initials as initialsOf } from '../format'

export interface Identity {
  fullName: string
  bedrijf: string
  displayName: string // sidebar top line
  displaySub: string // sidebar second line
  initials: string
  // document sender block
  senderName: string
  adres: string
  postcode: string
  plaats: string
  email: string
  telefoon: string
  website: string
  iban: string
  kvk: string
  btw: string
}

/** Derives display/document identity from the signed-in user's profile,
 *  with sensible fallbacks while fields are still empty. */
export function useIdentity(): Identity {
  const { profile, user } = useAuth()
  return useMemo(() => {
    const fullName = `${profile?.voornaam ?? ''} ${profile?.achternaam ?? ''}`.trim()
    const bedrijf = profile?.bedrijf ?? ''
    const email = profile?.email ?? user?.email ?? ''
    const displayName = fullName || email || 'Mijn account'
    const initialsSource = fullName || bedrijf || email || '?'
    return {
      fullName,
      bedrijf,
      displayName,
      displaySub: bedrijf || 'Freelancer',
      initials: initialsOf(initialsSource) || '?',
      senderName: bedrijf || fullName || 'Jouw bedrijf',
      adres: profile?.adres ?? '',
      postcode: profile?.postcode ?? '',
      plaats: profile?.plaats ?? '',
      email,
      telefoon: profile?.telefoon ?? '',
      website: profile?.website ?? '',
      iban: profile?.iban ?? '',
      kvk: profile?.kvk ?? '',
      btw: profile?.btw ?? '',
    }
  }, [profile, user])
}
