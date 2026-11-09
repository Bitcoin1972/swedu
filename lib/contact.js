const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('node:crypto');

const enquiryTypes = new Set(['', 'partnership', 'keynote', 'hub', 'bootcamp', 'governance', 'university', 'media', 'other']);
const escapeHtml = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isEmail = value => typeof value === 'string' && value.length <= 254 && /^[A-Za-z0-9.!#$%&'*+/=?^_{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,63}$/.test(value);

function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const limits = { name:120, email:254, organization:200, type:40, message:10000 };
  const result = {};
  for (const [key, limit] of Object.entries(limits)) {
    const value = body[key] === undefined ? '' : body[key];
    if (typeof value !== 'string' || value.length > limit || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) return null;
    if (key !== 'message' && /[\r\n]/.test(value)) return null;
    result[key] = value.trim();
  }
  if (!result.name || !result.message || !isEmail(result.email) || !enquiryTypes.has(result.type)) return null;
  return result;
}

function installContact(app, {env = process.env, createTransport = nodemailer.createTransport, log = code => console.warn(code)} = {}) {
  const attempts = new Map();
  const salt = crypto.randomBytes(32);
  const router = express.Router();
  router.use((_req,res,next) => { res.set('Cache-Control','no-store'); next(); });
  router.use((req,res,next) => {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const key = crypto.createHmac('sha256',salt).update(req.ip || '').digest('hex');
    const entry = attempts.get(key) || {count:0,until:now+600000};
    if (entry.count >= 10 || attempts.size >= 10000) return res.status(429).set('Retry-After','600').json({error:'Too many attempts. Please try again later.'});
    entry.count++;
    attempts.set(key,entry);
    next();
  });
  router.use(express.json({limit:'32kb'}),express.urlencoded({extended:false,limit:'32kb',parameterLimit:10}));
  router.post('/', async (req,res) => {
    const data = validate(req.body);
    if (!data) return res.status(400).json({error:'Please check the required fields and message length.'});
    const user = env.SMTP_USER || env.EMAIL_USER;
    const pass = env.SMTP_PASS || env.EMAIL_PASS;
    const recipient = env.EMAIL_TO || user;
    const port = Number(env.SMTP_PORT || 465);
    if (!isEmail(user) || !pass || !isEmail(recipient) || !Number.isInteger(port) || port < 1 || port > 65535) {
      log('contact_mail_unconfigured');
      return res.status(503).json({error:'The contact form is temporarily unavailable. Please email info@swedu.info.'});
    }
    const fields = {Name:data.name,Email:data.email,Organisation:data.organization || 'Not provided',Enquiry:data.type || 'General',Message:data.message};
    try {
      const transport = createTransport({
        ...(env.SMTP_HOST ? {host:env.SMTP_HOST,port,secure:env.SMTP_SECURE === undefined ? port === 465 : env.SMTP_SECURE !== 'false'} : {service:'gmail'}),
        auth:{user,pass}, requireTLS:true, tls:{minVersion:'TLSv1.2',rejectUnauthorized:true},
        connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000,
        logger:false,debug:false,disableFileAccess:true,disableUrlAccess:true
      });
      const result = await transport.sendMail({
        from:{name:'Smart World Education',address:user},to:recipient,replyTo:data.email,
        subject:`[swedu.me] ${data.type || 'Contact'} enquiry`,
        text:Object.entries(fields).map(([label,value])=>`${label}: ${value}`).join('\n\n'),
        html:Object.entries(fields).map(([label,value])=>`<p><strong>${label}:</strong><br>${escapeHtml(value).replace(/\r?\n/g,'<br>')}</p>`).join('')
      });
      if (!Array.isArray(result.accepted) || !result.accepted.some(address => String(address).toLowerCase() === recipient.toLowerCase())) throw Error('not accepted');
      return res.json({success:true,message:'Your message was accepted by our mail service. Thank you.'});
    } catch {
      // Never log SMTP errors: provider responses can contain recipient data or message content.
      log('contact_mail_failed');
      return res.status(502).json({error:'We could not send your message. Please try later or email info@swedu.info.'});
    }
  });
  router.use((error,_req,res,_next) => res.status(error.type === 'entity.too.large' ? 413 : 400).json({error:'Invalid or oversized request.'}));
  app.use('/contact',router);
}

module.exports = { installContact, validate };
