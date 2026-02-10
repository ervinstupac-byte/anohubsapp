import { ForensicReportService } from '../../services/ForensicReportService';

// Compatibility Layer: Re-export the class as ReportGenerator
// This allows 'new ReportGenerator()' and static calls to work
export class ReportGenerator extends ForensicReportService {}

export * from '../../services/ForensicReportService';
