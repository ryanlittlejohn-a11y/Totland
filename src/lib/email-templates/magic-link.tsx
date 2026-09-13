import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
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
  main,
  tagline,
  text,
} from './brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Your {siteName} login link</Preview>
    <Body style={main}>
      <Container className="dm-card" style={container}>
        <Text style={brandMark}>{siteName}</Text>
        <Text style={tagline}>Kids learn by playing.</Text>
        <Heading className="dm-head" style={h1}>
          Your login link
        </Heading>
        <Text className="dm-text" style={text}>
          Tap the button below to sign in to {siteName}. This link works once and expires shortly.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Sign me in
        </Button>
        <Text style={footer}>
          If you didn&apos;t request this link, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
