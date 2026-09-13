import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

import {
  brandMark,
  button,
  container,
  darkModeCss,
  footer,
  h1,
  link,
  main,
  tagline,
  text,
} from './brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>You&apos;ve been invited to {siteName}</Preview>
    <Body style={main}>
      <Container className="dm-card" style={container}>
        <Text style={brandMark}>{siteName}</Text>
        <Text style={tagline}>Kids learn by playing.</Text>
        <Heading className="dm-head" style={h1}>
          You&apos;ve been invited
        </Heading>
        <Text className="dm-text" style={text}>
          Someone invited you to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          , a playful learning world for ages 2 to 6.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept invitation
        </Button>
        <Text style={footer}>
          If you weren&apos;t expecting this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
