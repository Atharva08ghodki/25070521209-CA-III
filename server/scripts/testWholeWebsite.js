const assert = require('assert');

const API = 'http://localhost:5000/api';
const CLIENT_URL = 'http://localhost:5173';

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runFullTestSuite() {
  console.log('====================================================');
  console.log('   KALAKART FULL-STACK COMPREHENSIVE TEST SUITE     ');
  console.log('====================================================\n');

 
  console.log('--- TEST 1: Backend Health & Frontend Client ---');
  const health = await request(`${API}/health`);
  assert.strictEqual(health.status, 200, 'Health check must return 200');
  assert.strictEqual(health.data.database, 'connected', 'Database must be connected');
  console.log('✓ Backend API is healthy & MongoDB is connected');

  const client = await request(CLIENT_URL);
  assert.strictEqual(client.status, 200, 'Vite client must return 200');
  assert(client.data.includes('<div id="root"></div>'), 'Client HTML must include root container');
  assert(client.data.includes('KalaKart'), 'Client HTML must include KalaKart title');
  console.log('✓ Frontend Vite client is running and serving HTML bundles');

 
  console.log('\n--- TEST 2: Account 1 (Priya Sharma) Lifecycle ---');
  const user1Email = `priya.sharma.${Date.now()}@example.com`;
  const user1Pass = 'PriyaCrafts@2025';

 
  const signup1 = await request(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Sharma',
      email: user1Email,
      password: user1Pass,
      phone: '+91 9876543210',
      address: '14 Lotus Court, Indiranagar, Bangalore'
    })
  });
  assert.strictEqual(signup1.status, 201, 'Signup 1 must return 201');
  assert(signup1.data.token, 'Must return JWT token');
  assert.strictEqual(signup1.data.user.email, user1Email.toLowerCase());
  console.log(`✓ Account 1 signed up successfully (ID: ${signup1.data.user.id})`);
  let token1 = signup1.data.token;

 
  const dupSignup = await request(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Sharma Duplicate',
      email: user1Email,
      password: 'AnotherPassword123'
    })
  });
  assert.strictEqual(dupSignup.status, 409, 'Duplicate email must be rejected with 409');
  console.log('✓ Duplicate email registration correctly prevented with 409 Conflict');

 
  console.log('✓ Account 1 signed out (session token cleared on client)');
  token1 = null;

 
  const wrongLogin = await request(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Email, password: 'WrongPassword999' })
  });
  assert.strictEqual(wrongLogin.status, 401, 'Wrong password must return 401');
  console.log('✓ Invalid password attempt correctly rejected with 401');

 
  const login1 = await request(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Email, password: user1Pass })
  });
  assert.strictEqual(login1.status, 200, 'Login 1 must return 200');
  assert(login1.data.token, 'Must return valid JWT token on login');
  token1 = login1.data.token;
  console.log('✓ Account 1 signed in successfully with credentials');

 
  const update1 = await request(`${API}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`
    },
    body: JSON.stringify({
      phone: '+91 9123456789',
      address: '42 MG Road, Residency Area, Bangalore 560001'
    })
  });
  assert.strictEqual(update1.status, 200, 'Profile update must return 200');
  assert.strictEqual(update1.data.user.phone, '+91 9123456789');
  assert.strictEqual(update1.data.user.address, '42 MG Road, Residency Area, Bangalore 560001');
  console.log('✓ Account 1 profile updated and saved to MongoDB');

 
  console.log('\n--- TEST 3: Account 2 (Aarav Patel) Lifecycle ---');
  const user2Email = `aarav.patel.${Date.now()}@example.com`;
  const user2Pass = 'AaravCrafts@2025';

 
  const signup2 = await request(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aarav Patel',
      email: user2Email,
      password: user2Pass,
      phone: '+91 9822334455',
      address: '88 Heritage Walk, Navrangpura, Ahmedabad'
    })
  });
  assert.strictEqual(signup2.status, 201, 'Signup 2 must return 201');
  console.log(`✓ Account 2 signed up successfully (ID: ${signup2.data.user.id})`);
  let token2 = signup2.data.token;

 
  console.log('✓ Account 2 signed out (token cleared on client)');
  token2 = null;

 
  const login2 = await request(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user2Email, password: user2Pass })
  });
  assert.strictEqual(login2.status, 200, 'Login 2 must return 200');
  token2 = login2.data.token;
  console.log('✓ Account 2 signed in successfully with credentials');

 
  const update2 = await request(`${API}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token2}`
    },
    body: JSON.stringify({
      phone: '+91 9898989898',
      address: '99 Sabarmati Riverfront, Ahmedabad 380009'
    })
  });
  assert.strictEqual(update2.status, 200, 'Profile update must return 200');
  console.log('✓ Account 2 profile updated and saved to MongoDB');

 
  console.log('\n--- TEST 4: Product Catalog, Search & Categories ---');
  const allProducts = await request(`${API}/products`);
  assert.strictEqual(allProducts.status, 200);
  assert(Array.isArray(allProducts.data) && allProducts.data.length > 0, 'Products list must not be empty');
  console.log(`✓ Fetched ${allProducts.data.length} artisan products from catalog`);

 
  const rajasthanProducts = await request(`${API}/products?category=Rajasthan`);
  assert.strictEqual(rajasthanProducts.status, 200);
  assert(rajasthanProducts.data.every(p => p.category === 'Rajasthan'));
  console.log(`✓ Category filter working: ${rajasthanProducts.data.length} Rajasthan crafts returned`);

 
  const searchResults = await request(`${API}/products?search=Pottery`);
  assert.strictEqual(searchResults.status, 200);
  assert(searchResults.data.length > 0, 'Search should find pottery products');
  console.log(`✓ Search working: "${searchResults.data[0].name}" found for query "Pottery"`);

 
  console.log('\n--- TEST 5: Order Placement & Database Updates for Account 1 ---');
  const productToBuy1 = allProducts.data[0];
  const initialStock1 = productToBuy1.stock;
  console.log(`Initial stock for "${productToBuy1.name}": ${initialStock1}`);

  const order1Res = await request(`${API}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`
    },
    body: JSON.stringify({
      customer: {
        name: 'Priya Sharma',
        email: user1Email,
        address: '42 MG Road, Residency Area, Bangalore 560001'
      },
      items: [{ productId: productToBuy1._id, quantity: 2 }]
    })
  });
  assert.strictEqual(order1Res.status, 201, 'Order 1 must return 201');
  const order1 = order1Res.data.order;
  console.log(`✓ Order 1 placed by Priya (Order ID: ${order1._id})`);
  assert.strictEqual(order1.user, signup1.data.user.id, 'Order must be linked to Account 1 user ID in MongoDB');

 
  const updatedProduct1 = await request(`${API}/products/${productToBuy1._id}`);
  assert.strictEqual(updatedProduct1.data.stock, initialStock1 - 2, 'Stock should decrease by 2');
  console.log(`✓ MongoDB stock updated: ${initialStock1} -> ${updatedProduct1.data.stock}`);

 
  console.log('\n--- TEST 6: Order Placement & Database Updates for Account 2 ---');
  const productToBuy2 = allProducts.data[1];
  const initialStock2 = productToBuy2.stock;

  const order2Res = await request(`${API}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token2}`
    },
    body: JSON.stringify({
      customer: {
        name: 'Aarav Patel',
        email: user2Email,
        address: '99 Sabarmati Riverfront, Ahmedabad 380009'
      },
      items: [{ productId: productToBuy2._id, quantity: 1 }]
    })
  });
  assert.strictEqual(order2Res.status, 201, 'Order 2 must return 201');
  const order2 = order2Res.data.order;
  console.log(`✓ Order 2 placed by Aarav (Order ID: ${order2._id})`);
  assert.strictEqual(order2.user, signup2.data.user.id, 'Order must be linked to Account 2 user ID in MongoDB');

 
  const updatedProduct2 = await request(`${API}/products/${productToBuy2._id}`);
  assert.strictEqual(updatedProduct2.data.stock, initialStock2 - 1, 'Stock should decrease by 1');
  console.log(`✓ MongoDB stock updated: ${initialStock2} -> ${updatedProduct2.data.stock}`);

 
  console.log('\n--- TEST 7: Order History & User Data Isolation ---');
  const user1Orders = await request(`${API}/orders/my-orders`, {
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  assert.strictEqual(user1Orders.status, 200);
  assert(user1Orders.data.some(o => o._id === order1._id), 'User 1 must see their order');
  assert(!user1Orders.data.some(o => o._id === order2._id), 'User 1 must NOT see User 2 order');
  console.log(`✓ User 1 order history verified: contains Order ${order1._id.slice(-8)}`);

  const user2Orders = await request(`${API}/orders/my-orders`, {
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  assert.strictEqual(user2Orders.status, 200);
  assert(user2Orders.data.some(o => o._id === order2._id), 'User 2 must see their order');
  assert(!user2Orders.data.some(o => o._id === order1._id), 'User 2 must NOT see User 1 order');
  console.log(`✓ User 2 order history verified: contains Order ${order2._id.slice(-8)}`);
  console.log('✓ Full user data isolation verified: accounts only access their own data');

 
  console.log('\n--- TEST 8: Custom Craft Requests Linked to User ---');
  const customReq = await request(`${API}/custom-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`
    },
    body: JSON.stringify({
      name: 'Priya Sharma',
      email: user1Email,
      craft: 'Painting or wall art',
      details: 'Large Warli artwork for entrance foyer with copper tones',
      budget: '₹3,000–₹5,000'
    })
  });
  assert.strictEqual(customReq.status, 201);
  assert.strictEqual(customReq.data.request.user, signup1.data.user.id);
  console.log('✓ Custom craft request created and linked to Account 1 in MongoDB');

 
  console.log('\n--- TEST 9: Inventory Boundary Protection ---');
  const outOfStockOrder = await request(`${API}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { name: 'Test', email: 'test@example.com', address: 'Test Addr' },
      items: [{ productId: productToBuy1._id, quantity: 9999 }]
    })
  });
  assert.strictEqual(outOfStockOrder.status, 409, 'Order exceeding stock must be rejected with 409');
  console.log('✓ Over-capacity order correctly blocked by inventory check (409 Conflict)');

  console.log('\n====================================================');
  console.log('   ALL 9 TEST SUITES COMPLETED AND PASSED! ✨      ');
  console.log('====================================================\n');
}

runFullTestSuite().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});

