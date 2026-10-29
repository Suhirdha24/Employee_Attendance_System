const http = require('http');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:5000';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          // keep as string e.g. for CSV
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function ensureServerRunning() {
  try {
    const health = await request('GET', '/api/health');
    if (health.status === 200) {
      return null; // already running
    }
  } catch (e) {
    // not running
  }

  console.log('⚡ Server not running on :5000. Launching child server for tests...');
  const child = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'ignore',
  });

  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 600));
    try {
      const health = await request('GET', '/api/health');
      if (health.status === 200) {
        console.log('✅ Background test server responsive.\n');
        return child;
      }
    } catch (e) {}
  }

  return child;
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE ATTENDANCE SYSTEM TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  let serverProcess = null;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  try {
    serverProcess = await ensureServerRunning();

    // 1. Health Check
    console.log('--- 1. SYSTEM HEALTH CHECKS ---');
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health responds with 200 OK');

    // 2. Auth - Seeded Employee Login
    console.log('\n--- 2. AUTHENTICATION & SECURITY ---');
    const empLogin = await request('POST', '/api/auth/login', {
      email: 'alex@company.com',
      password: 'password123',
    });
    assert(empLogin.status === 200 && empLogin.data.token, 'Employee login (alex@company.com) returns JWT token');
    const empToken = empLogin.data.token;
    const empUser = empLogin.data.user;

    // 3. Auth - Seeded Manager Login
    const mgrLogin = await request('POST', '/api/auth/login', {
      email: 'manager@company.com',
      password: 'manager123',
    });
    assert(mgrLogin.status === 200 && mgrLogin.data.token && mgrLogin.data.user.role === 'manager', 'Manager login returns JWT with role "manager"');
    const mgrToken = mgrLogin.data.token;

    // 4. Auth - Invalid Password Rejection
    const invalidLogin = await request('POST', '/api/auth/login', {
      email: 'alex@company.com',
      password: 'wrongpassword',
    });
    assert(invalidLogin.status === 400, 'Invalid password correctly rejected with 400 Bad Request');

    // 5. Auth - Me Endpoint
    const meRes = await request('GET', '/api/auth/me', null, empToken);
    assert(meRes.status === 200 && meRes.data.user.email === 'alex@company.com', 'GET /api/auth/me returns authenticated employee profile');

    // 6. Auth - Password Reset Flow
    const resetReq = await request('POST', '/api/auth/request-reset', { email: 'alex@company.com' });
    assert(resetReq.status === 200 && resetReq.data.id, 'POST /api/auth/request-reset verifies email and returns user ID');

    // 7. Dynamic User Registration
    const testEmail = `testuser_${Date.now()}@company.com`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Test Automation User',
      email: testEmail,
      password: 'testpassword123',
      department: 'Engineering',
      role: 'employee',
    });
    assert(regRes.status === 201 && regRes.data.token && regRes.data.user.employeeId, `POST /api/auth/register provisions user with generated employeeId: ${regRes.data?.user?.employeeId}`);
    const newEmpToken = regRes.data.token;

    // 8. Auth - Profile Update Feature
    const updateProfRes = await request('PUT', '/api/auth/profile', { name: 'Test Auto Renamed' }, newEmpToken);
    assert(updateProfRes.status === 200 && updateProfRes.data.user.name === 'Test Auto Renamed', 'PUT /api/auth/profile updates user display name');

    // 9. Attendance Punching - Check-in with WorkMode & Remarks
    console.log('\n--- 3. EMPLOYEE ATTENDANCE OPERATIONS ---');
    const checkInRes = await request('POST', '/api/attendance/checkin', { workMode: 'Remote', remarks: 'Testing remote punch' }, newEmpToken);
    assert(checkInRes.status === 200 && checkInRes.data.attendance?.checkInTime && checkInRes.data.attendance?.workMode === 'Remote', `POST /api/attendance/checkin records valid punch time with Remote workMode`);

    // 10. Attendance Punching - Double Check-in Prevention
    const doubleCheckIn = await request('POST', '/api/attendance/checkin', {}, newEmpToken);
    assert(doubleCheckIn.status === 400, 'POST /api/attendance/checkin prevents double check-in on the same day');

    // 11. Attendance Punching - Check-out with remarks
    const checkOutRes = await request('POST', '/api/attendance/checkout', { remarks: 'Completed remote sprint' }, newEmpToken);
    assert(checkOutRes.status === 200 && checkOutRes.data.attendance?.checkOutTime, 'POST /api/attendance/checkout records check-out time and totalHours');

    // 12. Attendance Punching - Double Check-out Prevention
    const doubleCheckOut = await request('POST', '/api/attendance/checkout', {}, newEmpToken);
    assert(doubleCheckOut.status === 400, 'POST /api/attendance/checkout prevents double check-out on the same day');

    // 13. Employee - Today Status
    const todayStatus = await request('GET', '/api/attendance/today', null, newEmpToken);
    assert(todayStatus.status === 200 && todayStatus.data.attendance !== null, 'GET /api/attendance/today returns today attendance object');

    // 14. Employee - History
    const historyRes = await request('GET', '/api/attendance/my-history', null, newEmpToken);
    assert(historyRes.status === 200 && Array.isArray(historyRes.data) && historyRes.data.length >= 1, 'GET /api/attendance/my-history returns attendance history array');

    // 15. Employee - Summary
    const summaryRes = await request('GET', '/api/attendance/my-summary', null, newEmpToken);
    assert(summaryRes.status === 200 && typeof summaryRes.data.attendancePercentage === 'number', 'GET /api/attendance/my-summary returns compliance metrics');

    // 16. Employee - Dashboard
    const empDash = await request('GET', '/api/dashboard/employee', null, newEmpToken);
    assert(empDash.status === 200 && empDash.data.today && empDash.data.stats, 'GET /api/dashboard/employee returns live workstation data');

    // 17. Security - Role Authorization Protection
    console.log('\n--- 4. ROLE-BASED ACCESS CONTROL (RBAC) ---');
    const forbiddenRes = await request('GET', '/api/attendance/all', null, empToken);
    assert(forbiddenRes.status === 403, 'Employee token accessing manager route GET /api/attendance/all is blocked with 403 Forbidden');

    // 18. Manager - All Attendance
    console.log('\n--- 5. MANAGER WORKFORCE OPERATIONS ---');
    const allAttendance = await request('GET', '/api/attendance/all', null, mgrToken);
    assert(allAttendance.status === 200 && Array.isArray(allAttendance.data) && allAttendance.data.length > 0, `GET /api/attendance/all returns ${allAttendance.data?.length} attendance logs`);

    // 19. Manager - Filtered Attendance by Department
    const deptFiltered = await request('GET', '/api/attendance/all?department=Engineering', null, mgrToken);
    assert(deptFiltered.status === 200 && deptFiltered.data.every(r => r.department === 'Engineering'), 'GET /api/attendance/all?department=Engineering filters correctly');

    // 20. Manager - Filtered Attendance by Status
    const statusFiltered = await request('GET', '/api/attendance/all?status=present', null, mgrToken);
    assert(statusFiltered.status === 200 && statusFiltered.data.every(r => r.status === 'present'), 'GET /api/attendance/all?status=present filters correctly');

    // 21. Manager - Today All Employees Status
    const allToday = await request('GET', '/api/attendance/all-today', null, mgrToken);
    assert(allToday.status === 200 && Array.isArray(allToday.data) && allToday.data.length > 0, `GET /api/attendance/all-today returns status for ${allToday.data?.length} team members`);

    // 22. Manager - Specific Employee History Drilldown
    const empDrilldown = await request('GET', `/api/attendance/employee/${empUser.id}`, null, mgrToken);
    assert(empDrilldown.status === 200 && empDrilldown.data.employee && empDrilldown.data.stats && Array.isArray(empDrilldown.data.history), `GET /api/attendance/employee/:id returns comprehensive drilldown for ${empDrilldown.data?.employee?.name}`);

    // 23. Manager - Rectify Attendance Record
    const testRecordId = checkInRes.data.attendance._id;
    const updateAttRes = await request('PUT', `/api/attendance/${testRecordId}`, { status: 'present', totalHours: 8.0, remarks: 'Manager verified work' }, mgrToken);
    assert(updateAttRes.status === 200 && updateAttRes.data.attendance.modifiedByManager === true, 'PUT /api/attendance/:id rectifies record and sets modifiedByManager flag');

    // 24. Manager - Team Summary
    const teamSum = await request('GET', '/api/attendance/summary', null, mgrToken);
    assert(teamSum.status === 200 && teamSum.data.totalEmployees > 0, `GET /api/attendance/summary returns metrics for ${teamSum.data?.totalEmployees} total employees`);

    // 25. Manager - Dashboard Metrics & 7-Day Trends
    const mgrDash = await request('GET', '/api/dashboard/manager', null, mgrToken);
    assert(mgrDash.status === 200 && mgrDash.data.overview && Array.isArray(mgrDash.data.dailyTrends) && mgrDash.data.dailyTrends.length === 7, 'GET /api/dashboard/manager returns KPI overview and 7-day trend series');

    // 26. Manager - Export CSV (Includes Work Mode and Remarks)
    const csvRes = await request('GET', '/api/attendance/export', null, mgrToken);
    assert(csvRes.status === 200 && typeof csvRes.data === 'string' && csvRes.data.includes('Work Mode') && csvRes.data.includes('Remarks'), 'GET /api/attendance/export generates valid CSV with Work Mode & Remarks columns');

  } catch (err) {
    console.error('Test Suite encountered fatal exception:', err);
    failed++;
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  if (failed === 0) {
    console.log('🎉 ALL SYSTEM FUNCTIONS ARE WORKING PROPERLY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite();
