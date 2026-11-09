const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const nodemailer = require('nodemailer');
const { installContact } = require('../lib/contact');
const valid = {name:'Test Learner',email:'learner@example.com',organization:'Example',type:'university',message:'Pilot enquiry'};
const env = {SMTP_HOST:'smtp.example.com',SMTP_USER:'info@example.com',SMTP_PASS:'fixture-only',EMAIL_TO:'team@example.com',SMTP_PORT:'587',SMTP_SECURE:'false'};

async function fixture(t, options = {}) {
  const messages = [], logs = [], configs = [];
  const app = express();
  installContact(app,{env,log:code=>logs.push(code),createTransport:config=>{
    configs.push(config);
    return {sendMail:async message=>{messages.push(message);return {accepted:['team@example.com']};}};
  },...options});
  const server = app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  t.after(()=>{server.closeAllConnections();server.close();});
  const url = `http://127.0.0.1:${server.address().port}/contact`;
  return {messages,logs,configs,url,post:body=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})};
}

test('contact escapes HTML, preserves plain text, requires TLS and only reports accepted mail',async t=>{
  const f = await fixture(t);
  const payload = {...valid,name:'<img src=x onerror=alert(1)>',message:'<script>alert("private")</script>\n& hello'};
  const response = await f.post(payload);
  assert.equal(response.status,200);
  assert.equal((await response.json()).success,true);
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.match(f.messages[0].html,/&lt;script&gt;/);
  assert.doesNotMatch(f.messages[0].html,/<script|<img/);
  assert.ok(f.messages[0].text.includes(payload.message));
  assert.equal(f.messages[0].replyTo,valid.email);
  assert.equal(f.messages[0].to,env.EMAIL_TO);
  assert.equal(f.configs[0].requireTLS,true);
  assert.equal(f.configs[0].secure,false);
  assert.equal(f.configs[0].tls.rejectUnauthorized,true);
  assert.equal(f.configs[0].debug,false);
  assert.equal(f.configs[0].disableFileAccess,true);
  assert.deepEqual(f.logs,[]);
  const compiled = await nodemailer.createTransport({streamTransport:true,buffer:true}).sendMail(f.messages[0]);
  assert.ok(compiled.message.length>0);
});

test('missing SMTP configuration returns 503 without claiming success or logging PII',async t=>{
  const f = await fixture(t,{env:{}});
  const response = await f.post(valid);
  assert.equal(response.status,503);
  assert.equal((await response.json()).success,undefined);
  assert.equal(f.messages.length,0);
  assert.deepEqual(f.logs,['contact_mail_unconfigured']);
});

test('SMTP failure and rejected recipient return 502 with no provider details',async t=>{
  for (const sendMail of [async()=>{throw new Error('private learner@example.com secret smtp response');},async()=>({accepted:[],rejected:['team@example.com']})]) {
    const f = await fixture(t,{createTransport:()=>({sendMail})});
    const response = await f.post(valid);
    assert.equal(response.status,502);
    assert.doesNotMatch(await response.text(),/secret|learner@example.com/);
    assert.deepEqual(f.logs,['contact_mail_failed']);
  }
});

test('contact rejects invalid fields, header injection and malformed or oversized requests',async t=>{
  const f = await fixture(t);
  for (const body of [null,[],{...valid,name:{}},{...valid,email:'bad'},{...valid,email:'x@example.com\r\nBcc: a@example.com'},{...valid,name:'x\ny'},{...valid,message:' '},{...valid,type:'<script>'},{...valid,message:'a'.repeat(10001)}]) {
    assert.equal((await f.post(body)).status,400);
  }
  assert.equal(f.messages.length,0);
  const other = await fixture(t);
  const bad = await fetch(other.url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"name":'});
  assert.equal(bad.status,400);
  const huge = await other.post({...valid,message:'a'.repeat(40000)});
  assert.equal(huge.status,413);
  assert.doesNotMatch(await huge.text(),/SyntaxError|stack|aaaa/);
});

test('contact rate limit bounds repeated submissions',async t=>{
  const f = await fixture(t,{env:{}});
  for(let i=0;i<10;i++) assert.equal((await f.post(valid)).status,503);
  const response = await f.post(valid);
  assert.equal(response.status,429);
  assert.equal(response.headers.get('retry-after'),'600');
});
