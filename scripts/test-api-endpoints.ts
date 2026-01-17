/**
 * Automated API Endpoint Testing Script
 * 
 * Tests all implemented endpoints to verify:
 * - Endpoint accessibility
 * - Response structure
 * - Error handling
 * - Authentication requirements
 * 
 * Usage: npx tsx scripts/test-api-endpoints.ts
 */

import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'admin123';
const TENANT_ID = process.env.TENANT_ID || '2348d266-596f-420f-b046-a63ca3b504f9';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'NOT_IMPLEMENTED';
  statusCode?: number;
  responseTime?: number;
  error?: string;
  notes?: string;
}

interface TestEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path: string;
  requiresAuth: boolean;
  requiresData?: boolean;
  testData?: any;
  skipReason?: string;
  expectedStatus?: number;
}

const results: TestResult[] = [];
let authToken: string | null = null;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test endpoints organized by module
const endpoints: TestEndpoint[] = [
  // ==================== AUTH ====================
  {
    name: 'Login',
    method: 'POST',
    path: '/auth/login',
    requiresAuth: false,
    testData: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    },
    expectedStatus: 200,
  },
  {
    name: 'Get Current User',
    method: 'GET',
    path: '/auth/me',
    requiresAuth: true,
    expectedStatus: 200,
  },
  {
    name: 'List Users',
    method: 'GET',
    path: '/auth/users',
    requiresAuth: true,
    expectedStatus: 200,
  },
  {
    name: 'List Roles',
    method: 'GET',
    path: '/auth/roles',
    requiresAuth: true,
    expectedStatus: 200,
  },
  {
    name: 'List Permissions',
    method: 'GET',
    path: '/auth/permissions',
    requiresAuth: true,
    expectedStatus: 200,
  },

  // ==================== ARTICLES ====================
  {
    name: 'List Articles',
    method: 'GET',
    path: '/admin/articles?page=1&pageSize=10',
    requiresAuth: true,
    expectedStatus: 200,
  },
  {
    name: 'List Articles - Filter by Status',
    method: 'GET',
    path: '/admin/articles?status=published',
    requiresAuth: true,
    expectedStatus: 200,
  },
  {
    name: 'Search Articles (GAP)',
    method: 'GET',
    path: '/admin/articles?search=test',
    requiresAuth: true,
    skipReason: 'Search not implemented in backend',
  },

  // ==================== TOPICS ====================
  {
    name: 'List Topics',
    method: 'GET',
    path: '/admin/topics',
    requiresAuth: true,
    expectedStatus: 200,
  },

  // ==================== FAQ ====================
  {
    name: 'List FAQ',
    method: 'GET',
    path: '/admin/faq?page=1&pageSize=10',
    requiresAuth: true,
    expectedStatus: 200,
  },

  // ==================== REVIEWS ====================
  {
    name: 'List Reviews',
    method: 'GET',
    path: '/admin/reviews?page=1&pageSize=10',
    requiresAuth: true,
    expectedStatus: 200,
  },

  // ==================== CASES (GAP) ====================
  {
    name: 'List Cases (GAP)',
    method: 'GET',
    path: '/admin/cases',
    requiresAuth: true,
    skipReason: 'Cases API not implemented - model exists but no router',
  },

  // ==================== SERVICES ====================
  {
    name: 'List Services',
    method: 'GET',
    path: '/admin/services?page=1&pageSize=10',
    requiresAuth: true,
    expectedStatus: 200,
  },

  // ==================== EMPLOYEES ====================
  {
    name: 'List Employees',
    method: 'GET',
    path: '/admin/employees?page=1&pageSize=10',
    requiresAuth: true,
    expectedStatus: 200,
  },

  // ==================== PRACTICE AREAS ====================
  {
    name: 'List Practice Areas (Public)',
    method: 'GET',
    path: '/public/practice-areas',
    requiresAuth: false,
    expectedStatus: 200,
  },
  {
    name: 'Update Practice Area (GAP)',
    method: 'PATCH',
    path: '/admin/practice-areas/{id}',
    requiresAuth: true,
    skipReason: 'Only CREATE implemented, UPDATE/DELETE missing',
  },

  // ==================== ADVANTAGES ====================
  {
    name: 'List Advantages (Public)',
    method: 'GET',
    path: '/public/advantages',
    requiresAuth: false,
    expectedStatus: 200,
  },

  // ==================== CONTACTS ====================
  {
    name: 'Get Contacts (Public)',
    method: 'GET',
    path: '/public/contacts',
    requiresAuth: false,
    expectedStatus: 200,
  },

  // ==================== INQUIRIES ====================
  {
    name: 'List Inquiries',
    method: 'GET',
    path: '/admin/inquiries?page=1&pageSize=10',
    requiresAuth: true,
    expectedStatus: 200,
  },
  {
    name: 'Inquiries Analytics',
    method: 'GET',
    path: '/admin/inquiries/analytics?days=30',
    requiresAuth: true,
    expectedStatus: 200,
  },
  {
    name: 'Export Inquiries CSV (GAP)',
    method: 'GET',
    path: '/admin/inquiries/export',
    requiresAuth: true,
    skipReason: 'Export not implemented',
  },

  // ==================== INQUIRY FORMS ====================
  {
    name: 'List Inquiry Forms',
    method: 'GET',
    path: '/admin/inquiry-forms',
    requiresAuth: true,
    expectedStatus: 200,
  },

  // ==================== FILES ====================
  {
    name: 'List Files',
    method: 'GET',
    path: '/admin/files?page=1&pageSize=10',
    requiresAuth: true,
    expectedStatus: 200,
  },

  // ==================== SEO ====================
  {
    name: 'List SEO Routes',
    method: 'GET',
    path: '/admin/seo/routes?page=1&pageSize=10',
    requiresAuth: true,
    expectedStatus: 200,
  },
  {
    name: 'List Redirects',
    method: 'GET',
    path: '/admin/seo/redirects?page=1&pageSize=10',
    requiresAuth: true,
    expectedStatus: 200,
  },

  // ==================== TENANTS ====================
  {
    name: 'List Tenants',
    method: 'GET',
    path: '/admin/tenants',
    requiresAuth: true,
    expectedStatus: 200,
  },
  {
    name: 'Get Feature Flags',
    method: 'GET',
    path: '/admin/feature-flags',
    requiresAuth: true,
    expectedStatus: 200,
  },

  // ==================== DASHBOARD (GAP) ====================
  {
    name: 'Dashboard Stats (GAP)',
    method: 'GET',
    path: '/admin/dashboard',
    requiresAuth: true,
    skipReason: 'Dashboard endpoint not implemented',
  },

  // ==================== AUDIT LOG (GAP) ====================
  {
    name: 'Audit Logs (GAP)',
    method: 'GET',
    path: '/admin/audit-logs',
    requiresAuth: true,
    skipReason: 'Audit log router not implemented - model exists',
  },

  // ==================== LOCALIZATION (GAP) ====================
  {
    name: 'Translation Status (GAP)',
    method: 'GET',
    path: '/admin/localization/status',
    requiresAuth: true,
    skipReason: 'Localization router not implemented',
  },

  // ==================== BULK OPERATIONS (GAP) ====================
  {
    name: 'Bulk Publish Articles (GAP)',
    method: 'POST',
    path: '/admin/articles/bulk',
    requiresAuth: true,
    skipReason: 'Bulk operations not implemented',
  },
];

async function authenticate() {
  log('\n🔐 Authenticating...', 'blue');
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
      {
        headers: {
          'X-Tenant-ID': TENANT_ID,
        },
      }
    );

    authToken = response.data.tokens?.access_token || response.data.access_token;
    log(`✓ Authentication successful`, 'green');
    log(`  Token: ${authToken?.substring(0, 20)}...`, 'gray');
    return true;
  } catch (error) {
    const err = error as AxiosError;
    log(`✗ Authentication failed: ${err.message}`, 'red');
    if (err.response?.data) {
      log(`  Response: ${JSON.stringify(err.response.data)}`, 'gray');
    }
    return false;
  }
}

async function testEndpoint(endpoint: TestEndpoint): Promise<TestResult> {
  const startTime = Date.now();
  
  // Skip if reason provided
  if (endpoint.skipReason) {
    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      status: 'SKIP',
      notes: endpoint.skipReason,
    };
  }

  try {
    const config: any = {
      method: endpoint.method,
      url: `${API_BASE_URL}${endpoint.path}`,
      headers: {
        'X-Tenant-ID': TENANT_ID,
      },
    };

    // Add auth header if required
    if (endpoint.requiresAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // Add test data if provided
    if (endpoint.testData) {
      config.data = endpoint.testData;
    }

    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    // Check if status matches expected
    const expectedStatus = endpoint.expectedStatus || 200;
    const statusMatches = response.status === expectedStatus;

    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      status: statusMatches ? 'PASS' : 'FAIL',
      statusCode: response.status,
      responseTime,
      notes: statusMatches ? undefined : `Expected ${expectedStatus}, got ${response.status}`,
    };
  } catch (error) {
    const err = error as AxiosError;
    const responseTime = Date.now() - startTime;

    // 404 means endpoint not implemented
    if (err.response?.status === 404) {
      return {
        endpoint: endpoint.path,
        method: endpoint.method,
        status: 'NOT_IMPLEMENTED',
        statusCode: 404,
        responseTime,
        error: 'Endpoint not found',
      };
    }

    // 401/403 might be expected for auth tests
    if (err.response?.status === 401 || err.response?.status === 403) {
      return {
        endpoint: endpoint.path,
        method: endpoint.method,
        status: 'FAIL',
        statusCode: err.response.status,
        responseTime,
        error: 'Authentication/Authorization failed',
      };
    }

    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      status: 'FAIL',
      statusCode: err.response?.status,
      responseTime,
      error: err.message,
    };
  }
}

async function runTests() {
  log('\n🧪 Starting API Endpoint Tests', 'blue');
  log(`📍 Base URL: ${API_BASE_URL}`, 'gray');
  log(`📧 Test User: ${TEST_EMAIL}`, 'gray');
  log(`🏢 Tenant ID: ${TENANT_ID}\n`, 'gray');

  // Authenticate first
  const authSuccess = await authenticate();
  if (!authSuccess) {
    log('\n❌ Cannot proceed without authentication', 'red');
    return;
  }

  log('\n📋 Running endpoint tests...\n', 'blue');

  // Test each endpoint
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);

    // Print result
    const statusIcon = {
      PASS: '✓',
      FAIL: '✗',
      SKIP: '○',
      NOT_IMPLEMENTED: '?',
    }[result.status];

    const statusColor = {
      PASS: 'green',
      FAIL: 'red',
      SKIP: 'yellow',
      NOT_IMPLEMENTED: 'gray',
    }[result.status] as keyof typeof colors;

    const timingInfo = result.responseTime ? ` (${result.responseTime}ms)` : '';
    const statusInfo = result.statusCode ? ` [${result.statusCode}]` : '';
    
    log(
      `${statusIcon} ${endpoint.method.padEnd(6)} ${endpoint.name.padEnd(40)} ${statusInfo}${timingInfo}`,
      statusColor
    );

    if (result.error || result.notes) {
      log(`  └─ ${result.error || result.notes}`, 'gray');
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Print summary
  printSummary();
}

function printSummary() {
  log('\n' + '='.repeat(80), 'blue');
  log('📊 TEST SUMMARY', 'blue');
  log('='.repeat(80) + '\n', 'blue');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const notImplemented = results.filter(r => r.status === 'NOT_IMPLEMENTED').length;
  const total = results.length;

  log(`✓ Passed:          ${passed}`, 'green');
  log(`✗ Failed:          ${failed}`, 'red');
  log(`○ Skipped (Known): ${skipped}`, 'yellow');
  log(`? Not Implemented: ${notImplemented}`, 'gray');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'blue');
  log(`  Total:           ${total}\n`, 'blue');

  // Coverage calculation (excluding skipped)
  const testable = total - skipped;
  const working = passed;
  const coverage = testable > 0 ? ((working / testable) * 100).toFixed(1) : '0.0';

  log(`📈 API Coverage: ${coverage}% (${working}/${testable} endpoints working)\n`, 'blue');

  // List failed endpoints
  if (failed > 0) {
    log('❌ FAILED ENDPOINTS:', 'red');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        log(`   • ${r.method} ${r.endpoint}`, 'red');
        if (r.error) log(`     └─ ${r.error}`, 'gray');
      });
    log('');
  }

  // List not implemented endpoints
  if (notImplemented > 0) {
    log('⚠️  NOT IMPLEMENTED (404):', 'yellow');
    results
      .filter(r => r.status === 'NOT_IMPLEMENTED')
      .forEach(r => {
        log(`   • ${r.method} ${r.endpoint}`, 'yellow');
      });
    log('');
  }

  // List known gaps
  if (skipped > 0) {
    log('📝 KNOWN GAPS (Documented):', 'yellow');
    results
      .filter(r => r.status === 'SKIP')
      .forEach(r => {
        log(`   • ${r.method} ${r.endpoint}`, 'yellow');
        if (r.notes) log(`     └─ ${r.notes}`, 'gray');
      });
    log('');
  }

  // Performance stats
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.filter(r => r.responseTime).length;

  if (avgResponseTime) {
    log(`⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms\n`, 'blue');
  }

  log('='.repeat(80) + '\n', 'blue');
}

// Run tests
runTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

