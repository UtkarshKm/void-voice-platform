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
  Font,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  verifyCode: string;
}

export default function VerificationEmail({
  username,
  verifyCode,
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body
        style={{
          backgroundColor: '#f6f9fc',
          fontFamily: 'Roboto, Verdana, sans-serif',
          margin: 0,
          padding: 0,
        }}
      >
        <Preview>Email Verification Code</Preview>
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginTop: '20px',
          }}
        >
          <Section style={{ padding: '20px' }}>
            <Section style={{ textAlign: 'center', padding: '20px 0' }}>
              <Heading style={h1}>Email Verification</Heading>
              <Text style={mainText}>
                Hello <span style={{ fontWeight: 'bold'}}>{username}</span>, please enter the following verification code to
                confirm your email address.
              </Text>
              <Section
                style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '6px',
                  margin: '20px 0',
                }}
              >
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '10px',
                  }}
                >
                  Your verification code is:
                </Text>

                <Text
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    letterSpacing: '8px',
                    color: '#007bff',
                    margin: '10px 0',
                  }}
                >
                  {verifyCode}
                </Text>
                <Text
                  style={{
                    fontSize: '12px',
                    color: '#666',
                  }}
                >
                  This code will expire in 60 minutes
                </Text>
              </Section>
            </Section>
            <Hr
              style={{
                borderTop: '1px solid #eaeaea',
                margin: '20px 0',
              }}
            />
            <Section
              style={{
                textAlign: 'center',
                color: '#666',
                fontSize: '12px',
              }}
            >
              <Text>
                If you didn&apos;t request this verification code, please ignore
                this email.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

VerificationEmail.PreviewProps = {
  username: 'JohnDoe',
  verifyCode: '123456',
} satisfies VerificationEmailProps;

const h1 = {
  color: '#333',
  fontFamily: 'Roboto, Verdana, sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '15px',
};

const mainText = {
  color: '#666',
  fontFamily: 'Roboto, Verdana, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
};
