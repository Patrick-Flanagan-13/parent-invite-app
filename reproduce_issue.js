
const { verifyAuthenticationResponse } = require('@simplewebauthn/server');

async function test() {
    try {
        const response = {
            "id": "j9L37rOG8beSrYQlbftk106hCXg",
            "rawId": "j9L37rOG8beSrYQlbftk106hCXg",
            "response": {
                "authenticatorData": "T8gCJjy2Cm4m_16jtL0Hi5z8qCF63sglwy2zVs_bdvkdAAAAAA",
                "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoibU1IcHVkNk9EbmtHWERTSnYxaU9jZ3Zyc1BPRVlKNVBqVG9oaXFTelA1TSIsIm9yaWdpbiI6Imh0dHBzOi8vcXVhaWxydW4uYXBwIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
                "signature": "MEUCIQDkeHaQZxGEyJjvXwYFRSKrD-z7TcGmSGjV8JnpytftUAIgUiALaXNUIzJMQ3LYFoqOqmtN0hzF5mqWQH-LysfZx38",
                "userHandle": "YWRtaW4"
            },
            "type": "public-key",
            "clientExtensionResults": {},
            "authenticatorAttachment": "platform"
        };

        const expectedChallenge = "mMHpud6ODnkGXDSJv1iOcgvrsPOEYJ5PjTohiqSzP5M";
        const origin = "https://quailrun.app";
        const rpID = "quailrun.app";

        const authenticator = {
            credentialID: new Uint8Array(Buffer.from("j9L37rOG8beSrYQlbftk106hCXg", "base64url")),
            credentialPublicKey: new Uint8Array(Buffer.from("pQECAyYgASFYILHUG4YDGYcuBCtfdz2Ur+NtOSuUpbgE0OgdU7vkmv7wIlggWI9lVybeVhD0yFDNC0Sk4gqPQZhc5PtPR2lLFg7ko48=", "base64")),
            counter: 0,
            transports: ["hybrid", "internal"]
        };

        console.log('Testing verifyAuthenticationResponse...');
        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator,
        });

        console.log('Verification result:', verification);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
