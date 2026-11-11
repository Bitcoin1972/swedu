// Explicit operational release switch; unrelated to Partner Campus access.
module.exports = () => process.env.SWE_PUBLIC_WORLD === '1';
