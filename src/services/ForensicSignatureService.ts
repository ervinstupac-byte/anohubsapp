/**
 * ForensicSignatureService
 * Responsible for signature generation and related utilities.
 */
export async function generateSignature(
    measurement: { parameterId: string; value: number; measuredAt: string },
    engineerName: string,
    engineerLicense: string
): Promise<string> {
    const payload = `${measurement.parameterId}|${measurement.value}|${measurement.measuredAt}|${engineerName}|${engineerLicense}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default { generateSignature };
