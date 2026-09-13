import * as React from 'react'

import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

import {
  brandMark,
  code,
  container,
  darkModeCss,
  footer,
  h1,
  main,
  tagline,
  text,
} from './brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Your Totland verification code</Preview>
    <Body style={main}>
      <Container className="dm-card" style={container}>
        <Text style={brandMark}>Totland</Text>
        <Text style={tagline}>Kids learn by playing.</Text>
        <Heading className="dm-head" style={h1}>
          Your verification code
        </Heading>
        <Text className="dm-text" style={text}>
          Enter this code to confirm it&apos;s really you:
        </Text>
        <Text className="dm-code" style={code}>
          {token}
        </Text>
        <Text style={footer}>
          If you didn&apos;t request this code, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
