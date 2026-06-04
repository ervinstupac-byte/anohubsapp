import { Diagnostic } from './schemas';

export type UISeverity = 'info' | 'warning' | 'critical';

export function mapSeverity(s: Diagnostic['severity']): UISeverity {
  switch (s) {
    case 'CRITICAL':
      return 'critical';
    case 'WARNING':
      return 'warning';
    default:
      return 'info';
  }
}

export function mapDiagnosticToUI(d: Diagnostic): { message: string; uiSeverity: UISeverity; translationKey?: string } {
  const p = d.params || {};

  switch (d.code) {
    case 'JET_ALIGNMENT':
      return {
        message: `Jet offset ${p.offsetMM ?? 'unknown'} mm — align the splitter within 1.0 mm to avoid uneven bucket loading and bearing stress.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.jet_alignment'
      };

    case 'DEFLECTOR_GAP_TOO_SMALL':
      return {
        message: `Deflector gap ${p.gapMM ?? 'unknown'} mm — increase gap to at least 5 mm to avoid accidental jet cutting.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.deflector_gap'
      };

    case 'DEFLECTOR_INACTIVE_ON_TRIP':
      return {
        message: `Deflector inactive while generator tripped — immediate manual intervention required.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.deflector_inactive'
      };

    case 'DEFLECTOR_SLOW_RESPONSE':
      return {
        message: `Deflector response time ${p.responseTime ?? 'unknown'}s — must be < 1.0 s. Check actuator and controls.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.deflector_slow'
      };

    case 'MECHANICAL_PULSE_ISSUE':
      return {
        message: `Mechanical run-out or shaft bounce detected: ${p.detail ?? 'see sensor log'}. Schedule inspection.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.mechanical_pulse'
      };

    case 'HOUSING_AERATION_HIGH':
      return {
        message: `Housing pressure ${p.pressureBar ?? 'unknown'} bar — check air valves and venting to prevent runner drowning.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.housing_aeration'
      };

    case 'MAGNETIC_IMBALANCE':
      return {
        message: `Magnetic center delta ${p.deltaMM ?? 'unknown'} mm — balance rotor to reduce thrust load.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.magnetic_imbalance'
      };

    case 'BRAKE_INTERLOCK_VIOLATION':
      return {
        message: `Brake open while main needle > 5% — close brake and inspect interlock immediately.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.brake_interlock'
      };

    case 'BRAKE_LEAK_DETECTED':
      return {
        message: `Brake line pressure ${p.pressureBar ?? 'unknown'} bar while closed — investigate passing valve or leak.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.brake_leak'
      };

    case 'AXIAL_LIFT_OFF':
      return {
        message: `Uplift ratio ${p.upliftRatio ?? 'unknown'} — gravity bearing failing. Secure axial restraint immediately.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.axial_lift'
      };

    case 'AXIAL_NEGATIVE_FORCE':
      return {
        message: `Negative axial net force ${p.netForceN ?? 'unknown'} N — rotor may be levitating. Emergency stop and inspect thrust.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.axial_negative'
      };

    case 'SHAFT_JUMP':
      return {
        message: `Shaft jump detected (${p.displacementZ_mm ?? 'unknown'} mm) — immediate shutdown recommended.`,
        uiSeverity: mapSeverity(d.severity),
        translationKey: 'pelton.shaft_jump'
      };

    default:
      return { message: String(p.message ?? 'Unknown diagnostic'), uiSeverity: mapSeverity(d.severity), translationKey: 'pelton.unknown' };
  }
}

export default mapDiagnosticToUI;
