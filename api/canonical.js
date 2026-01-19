const resolver = require('../src/lib/canonicalResolver');

module.exports = (req, res) => {
  try {
    const { count, entries } = resolver.buildIndex();

    const q = req.query && (req.query.path || req.query.p);

    if (q) {
      const found = resolver.resolvePath(q);
      if (!found) return res.status(404).json({ error: 'not_found', query: q });
      return res.json({ count, result: found });
    }

    // default: return small index summary
    const samples = resolver.getSamplePaths(10);
    return res.json({ count, samples });
  } catch (err) {
    console.error('canonical endpoint error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
