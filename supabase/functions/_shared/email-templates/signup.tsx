/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const LOGO_URL = 'https://khotrjtyyrtyuvlzlzrd.supabase.co/storage/v1/object/public/email-assets/logo.jpg'

export const SignupEmail = ({
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to Family Food OS — confirm your email</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} alt="Family Food OS" width="56" height="56" style={logo} />
        </Section>
        <Heading style={h1}>Welcome to Family Food OS</Heading>
        <Text style={text}>
          Dinner should not feel like a daily negotiation.
        </Text>
        <Text style={text}>
          <Link href={siteUrl} style={link}><strong>Family Food OS</strong></Link>{' '}
          helps your family stop restarting the "what's for dinner?" conversation every night.
          It builds a weekly dinner rhythm around how your household actually works: busy
          nights, leftovers, takeout, picky eaters, repeat favorites, and the meals that
          make life easier.
        </Text>
        <Text style={text}>
          Confirm your email to activate your account and start your first weekly plan.
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Confirm my email
          </Button>
        </Section>
        <Text style={text}>
          After you log in, you can add Family Food OS to your phone's Home Screen so it
          opens like an app. That also makes it easier to keep up with quick dinner
          check-ins, which help your plan get smarter each week.
        </Text>
        <Text style={smallText}>
          If the button doesn't work, paste this link into your browser:
          <br />
          <Link href={confirmationUrl} style={linkSmall}>{confirmationUrl}</Link>
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { marginBottom: '24px' }
const logo = { borderRadius: '12px' }
const h1 = {
  fontFamily: '"Fraunces", Georgia, serif',
  fontSize: '28px',
  fontWeight: '600' as const,
  color: '#1f1f1c',
  margin: '0 0 16px',
  lineHeight: '1.2',
}
const text = { fontSize: '15px', color: '#5b5b54', lineHeight: '1.6', margin: '0 0 16px' }
const smallText = {
  fontSize: '12px',
  color: '#8a8a82',
  lineHeight: '1.6',
  margin: '20px 0 0',
  wordBreak: 'break-all' as const,
}
const link = { color: '#477359', textDecoration: 'none', fontWeight: '600' as const }
const linkSmall = { color: '#477359', textDecoration: 'underline' }
const buttonSection = { margin: '28px 0' }
const button = {
  backgroundColor: '#477359',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e8e4dc', margin: '32px 0 20px' }
const footer = { fontSize: '12px', color: '#999991', margin: '0' }
