const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { page, escape } = require('./programme-pages');
const scrypt = promisify(crypto.scrypt);

function canReadCountry(user, country) {
  return /^[A-Z]{2}$/.test(country) && (user.role === 'management'
    || (user.role === 'national-coordinator' && user.countries?.includes(country)));
}

function installPartnerCampus(app, options = {}) {
  const attempts = new Map();
  const accountsPath = options.accountsPath || process.env.PARTNER_ACCOUNTS_FILE;
  const dataRoot = options.dataRoot || process.env.PARTNER_DATA_DIR;
  app.use('/partners', async (req, res, next) => {
    res.set({'Cache-Control':'private, no-store', 'X-Robots-Tag':'noindex, nofollow', 'Referrer-Policy':'no-referrer'});
    // Production remains closed until a separately reviewed release implements approval.
    if (process.env.NODE_ENV === 'production') return res.status(503).send(page('Partner Campus', '<p>Partner access is not yet available. Please contact <a href="mailto:info@swedu.info">info@swedu.info</a>.</p>'));
    if (!accountsPath || !dataRoot) return res.status(503).send(page('Partner Campus', '<p>Partner access is not yet available. Please contact <a href="mailto:info@swedu.info">info@swedu.info</a>.</p>'));
    let users;
    try {
      const repo = fs.realpathSync(path.join(__dirname, '..')) + path.sep;
      if ([accountsPath, dataRoot].some(p => (fs.realpathSync(p) + path.sep).startsWith(repo))) throw Error();
      users = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
      if (!Array.isArray(users)) throw Error();
    }
    catch { return res.status(503).send('Partner access unavailable'); }
    const now = Date.now();
    for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
    const key = req.ip;
    const entry = attempts.get(key) || {count:0, until:now + 600000};
    if (entry.count >= 10 || attempts.size > 10000) return res.status(429).set('Retry-After','600').send('Try again later');
    const header = req.get('authorization') || '';
    if (!header.startsWith('Basic ') || header.length > 2048) return res.status(401).set('WWW-Authenticate','Basic realm="SWE Partner Campus", charset="UTF-8"').send('Authentication required');
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    const user = users.find(u => u.username === username && u.active === true);
    entry.count++;
    attempts.set(key, entry);
    try {
      const salt = user?.salt || 'invalid-account-constant-salt';
      const actual = await scrypt(password, salt, 64);
      const expected = Buffer.from(user?.passwordHash || '00'.repeat(64), 'hex');
      if (!user || separator < 1 || expected.length !== 64 || !crypto.timingSafeEqual(actual, expected)) {
        return res.status(401).set('WWW-Authenticate','Basic realm="SWE Partner Campus", charset="UTF-8"').send('Authentication required');
      }
      // Retain the request budget even for valid credentials to bound KDF work.
      req.partnerUser = user;
      next();
    } catch { res.status(503).send('Partner access unavailable'); }
  });
  app.get('/partners', (req, res) => {
    const country = typeof req.query.country === 'string' ? req.query.country.toUpperCase() : 'IN';
    if (!canReadCountry(req.partnerUser, country)) return res.status(403).send('This role or country is not authorized for internal pricing.');
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dataRoot, country, 'pricing.json'), 'utf8'));
      const report = fs.readFileSync(path.join(dataRoot, country, 'report.md'), 'utf8');
      if (data.country !== country || data.status !== 'draft') return res.status(503).send('Draft unavailable');
      res.send(page('India Pricing Research & Recommendation Report', `<p>Internal draft. Not approved for sale. Research date: ${escape(data.researchDate)}.</p><div class="price-table"><table><thead><tr><th>Programme</th><th>Proposed INR range</th><th>Unit</th></tr></thead><tbody>${data.proposals.map(p => `<tr><th>${escape(p.name)}</th><td>${escape(p.range.join(' - '))}</td><td>${escape(p.unit)}</td></tr>`).join('')}</tbody></table></div><pre>${escape(report)}</pre>`));
    } catch { res.status(404).send('No internal research is available for this country.'); }
  });
}
module.exports = { installPartnerCampus, canReadCountry };
