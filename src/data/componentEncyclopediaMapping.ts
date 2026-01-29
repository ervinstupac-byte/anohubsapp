// Mapping from 3D mesh IDs to a prioritized list of search terms to query the
// `public.component_encyclopedia` table. We keep search terms rather than fixed
// encyclopedia IDs to allow fuzzy matching against the 854 auto-extracted entries.

export const componentEncyclopediaMapping: Record<string, string[]> = {
  runner: ['runner', 'runner blade', 'runner vane', 'runner blade fatigue', 'impeller'],
  band: ['band', 'wear band', 'thrust band', 'retaining band'],
  crown: ['crown', 'crown plate', 'crown cover'],
  noseCone: ['nose cone', 'nosecone', 'nose cone assembly'],
  wicket_gates: ['wicket gate', 'wicket gates', 'guide vane', 'gate mechanism'],
  guide_vanes: ['guide vane', 'guide vanes', 'guide vane mechanism'],
  nozzle: ['nozzle', 'pelton nozzle', 'jet nozzle', 'water jet nozzle'],
  bucket: ['bucket', 'pelton bucket', 'pelton spoon', 'pelton runner bucket'],
  blade: ['blade', 'turbine blade', 'blade fatigue', 'blade erosion'],
  hub: ['hub', 'rotor hub', 'runner hub'],
  shaft: ['shaft', 'main shaft', 'rotor shaft', 'shaft misalignment'],
  bearings: ['bearing', 'journal bearing', 'thrust bearing', 'bearing lubrication'],
  seals: ['seal', 'shaft seal', 'mechanical seal', 'gland seal'],
  stator: ['stator', 'stator winding', 'stator core'],
  rotor: ['rotor', 'rotor core', 'rotor winding'],
  casing: ['casing', 'volute', 'housing', 'casing stress'],
  nozzle_ring: ['nozzle ring', 'jet ring', 'nozzle assembly'],
  governor: ['governor', 'speed governor', 'governor mechanism'],
};

export default componentEncyclopediaMapping;
