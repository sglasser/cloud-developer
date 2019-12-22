import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// const jwksUrl = 'https://dev-1fsq9f2m.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJDXH2K4c20/sLMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi0xZnNxOWYybS5hdXRoMC5jb20wHhcNMTkxMjIyMTMyMjU5WhcNMzMw
ODMwMTMyMjU5WjAhMR8wHQYDVQQDExZkZXYtMWZzcTlmMm0uYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq9Lqpbq9FxDil/z/cumAA/QS
qiub97zBA5alBpFncXq4Zqu5ExQgVQw0OlA9IoaAtFu6l4k/x9Ak1FDOGw7Vs7vu
7799b5QkFOu+98jT+MUFmA76bGtAxmk1uoefBYGzfL4dykbrqcS9DvxejR55xM1B
5JmFWyS0kvNVByiK95h2NlFrIqxe1uEkyh/BaeXkjGsZFXshp5gAanVBoNg5lfsz
Fl0BhpvGJil1cg2Etz0PYLItcsaJb8NS0zt17U+2KV5Hc7+QqR0cRA1009P6+ZQc
4V66Xc3UWLXwxg+lemzZ2fYgBQMmP1OGF8oHVhoJLHj/J+Krr1V9zYrPKxG77wID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRLqcj1YlVG2FexYf3d
ZyBl7ikmazAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAJQORlRu
7bBiVTFTIp2jSsLcWOXwCnbGKwQlzN/VEyO8nV9MLXvChJamo78gBbdnPZh6q29C
lXtBhYNdDFBwv1946l3ViZjNnFeENe0Wa+3j2s04jIOr8+78l6OF7M8KZwA8hQWA
qe5uAaZzQwhbKT2G6cPafCB68ccS74RCpM0lt/Lf3HPCo62DqStMUhtzLa8R1MRK
dvSKAPG9J1f8x7CeC2INFnaPunwe2+xJo62EU9VmE7CjtRk3MP1qgGSG6mOzzmVe
xRi9bHWhLsOQ0grNvaNXUU6tXqzBuhJhmVmz9Lzgq33dkzoaiv/gIS6DMCsFguee
CRz08fvnSuWfEd8=
-----END CERTIFICATE-----
`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  if (verify(token, cert, {algorithms: ['RS256']})) {
    return jwt.payload;
  }
  throw new Error('Token was invalid');
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
