const assert = require('assert');
const { hashPassword, verifyPassword, createToken, verifyToken } = require('../utils/auth');
const User = require('../models/User');

async function runTests() {
  const password = 'HandmadeCrafts@2025';
  const hashed = hashPassword(password);
  assert(hashed && hashed.includes(':'), 'Hash should be salt:key format');
  assert(verifyPassword(password, hashed), 'Password should verify correctly');
  assert(!verifyPassword('WrongPassword', hashed), 'Wrong password should fail');

  const payload = { userId: '654321098765432109876543', email: 'artisan@kalakart.in', role: 'customer' };
  const token = createToken(payload, 3600);
  assert(token && token.split('.').length === 3, 'JWT should have 3 parts separated by dots');
  
  const decoded = verifyToken(token);
  assert.strictEqual(decoded.userId, payload.userId, 'userId must match');
  assert.strictEqual(decoded.email, payload.email, 'email must match');
  assert(decoded.exp > Math.floor(Date.now() / 1000), 'exp must be in future');

  const tampered = token.slice(0, -4) + 'abcd';
  assert.strictEqual(verifyToken(tampered), null, 'Tampered token must be rejected');

  const expiredToken = createToken(payload, -10);
  assert.strictEqual(verifyToken(expiredToken), null, 'Expired token must be rejected');

  const validUser = new User({
    name: 'Diya Sharma',
    email: 'diya@kalakart.in',
    password: hashed,
    phone: '+91 9876543210',
    address: '12 Art Lane, Jaipur'
  });
  const valErr = validUser.validateSync();
  assert(!valErr, 'Valid user should not have validation errors');
  
  const safeObj = validUser.toSafeObject();
  assert.strictEqual(safeObj.name, 'Diya Sharma');
  assert.strictEqual(safeObj.email, 'diya@kalakart.in');
  assert.strictEqual(safeObj.password, undefined, 'Password should never be exposed in toSafeObject');

  const invalidUser = new User({ name: 'A', email: 'invalid-email', password: '123' });
  const errors = invalidUser.validateSync();
  assert(errors && errors.errors.name, 'Should require name minlength >= 2');
  assert(errors && errors.errors.email, 'Should require valid email regex');
  assert(errors && errors.errors.password, 'Should require password minlength >= 6');

  console.log('All 6 auth test suites passed successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
