import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { Authenticator } from '@prisma/client';

const rpName = 'Parent Invite App';
const rpID = process.env.RP_ID || 'quailrun.app'; // Default to production domain, override in dev
const origin = process.env.NEXT_PUBLIC_URL || `https://${rpID}`;

export async function getRegistrationOptions(username: string, userAuthenticators: Authenticator[]) {
    return await generateRegistrationOptions({
        rpName,
        rpID,
        userID: new Uint8Array(Buffer.from(username)), // Using username as userID for simplicity, or use actual user ID
        userName: username,
        // Don't prompt users for additional information about the authenticator
        // (Recommended for smoother UX)
        attestationType: 'none',
        // Prevent users from registering the same device multiple times
        excludeCredentials: userAuthenticators.map((auth) => ({
            id: auth.credentialID,
            type: 'public-key',
            transports: auth.transports ? (JSON.parse(auth.transports) as AuthenticatorTransport[]) : undefined,
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform', // Prioritize platform authenticators (TouchID, FaceID)
        },
    });
}

export async function verifyRegistration(body: any, expectedChallenge: string) {
    return await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
    });
}

export async function getAuthenticationOptions(userAuthenticators: Authenticator[]) {
    return await generateAuthenticationOptions({
        rpID,
        allowCredentials: userAuthenticators.map((auth) => ({
            id: auth.credentialID,
            type: 'public-key',
            transports: auth.transports ? (JSON.parse(auth.transports) as AuthenticatorTransport[]) : undefined,
        })),
        userVerification: 'preferred',
    });
}

export async function verifyAuthentication(body: any, expectedChallenge: string, authenticator: Authenticator) {
    return await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
            credentialID: authenticator.credentialID,
            credentialPublicKey: new Uint8Array(Buffer.from(authenticator.credentialPublicKey, 'base64')),
            counter: authenticator.counter,
            transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined,
        },
    } as any);
}
