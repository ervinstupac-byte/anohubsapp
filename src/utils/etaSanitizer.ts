// etaSanitizer: strict sanitization for η inputs. Rejects out-of-range values.
export interface EtaSanitizeResult {
  P?: number;
  Q?: number;
  H?: number;
  eta: number;
}

const RHO = 1000; // kg/m3
const G = 9.80665; // m/s^2

export function sanitizeEtaInputs(input: { P?: any; Q?: any; H?: any; rawEta?: any }): EtaSanitizeResult | null {
  try {
    // If rawEta is provided, prefer it but validate
    if (input.rawEta !== undefined && input.rawEta !== null) {
      const eta = Number(input.rawEta);
      if (!Number.isFinite(eta)) {
        console.error('CRITICAL: sanitizeEtaInputs - rawEta is not a finite number', input.rawEta);
        return null;
      }
      if (eta < 0 || eta > 1) {
        console.error('CRITICAL: sanitizeEtaInputs - rawEta out of bounds [0,1]', eta);
        return null;
      }
      return { eta };
    }

    const P = input.P !== undefined ? Number(input.P) : undefined;
    const Q = input.Q !== undefined ? Number(input.Q) : undefined;
    const H = input.H !== undefined ? Number(input.H) : undefined;

    if (P === undefined || Q === undefined || H === undefined) {
      // Not enough information to compute eta here
      return null;
    }

    if (![P, Q, H].every(v => Number.isFinite(v))) {
      console.error('CRITICAL: sanitizeEtaInputs - one of P/Q/H is not finite', { P, Q, H });
      return null;
    }

    // Prevent division by zero
    if (Q === 0 || H === 0) {
      console.error('CRITICAL: sanitizeEtaInputs - Q or H is zero leading to invalid eta', { P, Q, H });
      return null;
    }

    const eta = P / (RHO * G * Q * H);

    if (!Number.isFinite(eta) || eta < 0 || eta > 1) {
      console.error('CRITICAL: sanitizeEtaInputs - computed eta out of bounds [0,1]', { eta, P, Q, H });
      return null;
    }

    return { P, Q, H, eta };
  } catch (e) {
    console.error('CRITICAL: sanitizeEtaInputs unexpected error', e);
    return null;
  }
}

export default sanitizeEtaInputs;
