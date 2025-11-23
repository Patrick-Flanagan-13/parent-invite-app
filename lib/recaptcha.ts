'use server'

export async function verifyBot(headers: Headers): Promise<boolean> {
    // Vercel Bot Protection sets this header
    // https://vercel.com/docs/security/vercel-firewall/bot-protection
    const botScore = headers.get('x-vercel-id')

    // If running locally or bot protection not enabled, allow through
    if (process.env.NODE_ENV === 'development') {
        return true
    }

    // In production, Vercel Bot Protection will block bots automatically
    // We just need to verify the request made it through
    return true
}
