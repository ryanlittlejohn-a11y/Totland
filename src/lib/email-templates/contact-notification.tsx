import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

export interface ContactNotificationProps {
  name?: string
  email?: string
  message?: string
}

export function ContactNotification({
  name = 'A visitor',
  email = 'unknown@example.com',
  message = '(no message)',
}: ContactNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact inquiry from {name}</Preview>
      <Body style={{ backgroundColor: '#faf7f2', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ padding: '24px', maxWidth: '560px' }}>
          <Heading style={{ fontSize: '20px', margin: '0 0 12px' }}>New contact inquiry</Heading>
          <Section>
            <Text style={{ margin: '4px 0' }}>
              <strong>Name:</strong> {name}
            </Text>
            <Text style={{ margin: '4px 0' }}>
              <strong>Email:</strong> {email}
            </Text>
          </Section>
          <Hr />
          <Text style={{ whiteSpace: 'pre-wrap' }}>{message}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ContactNotification,
  subject: (data: Record<string, any>) =>
    `New contact inquiry from ${data['name'] || 'a visitor'}`,
  displayName: 'Contact inquiry notification',
  to: 'Support@totland.app',
  previewData: {
    name: 'Jamie Parker',
    email: 'jamie@example.com',
    message: 'My child loves the letter games! How do I add a second profile?',
  },
} satisfies TemplateEntry
