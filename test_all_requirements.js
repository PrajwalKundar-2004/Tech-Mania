const http = require('http');

const API_BASE = 'http://127.0.0.1:5000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, ok: res.ok, data: json };
}

async function runTests() {
  console.log('====================================================');
  console.log('  TECHMANIA 2.0 - COMPREHENSIVE VERIFICATION SUITE  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'ONLINE', '1. Backend Health Check responds ONLINE');

    // 2. Fetch events
    const eventsRes = await request('/events');
    assert(eventsRes.status === 200 && eventsRes.data.count === 4, '2. Fetches exactly 4 configured events');
    const events = eventsRes.data.data;
    const eventA = events[0];
    const eventB = events[1];
    console.log(`   Event A: ${eventA.name} (Max: ${eventA.maximumParticipants}, Remaining: ${eventA.remainingSlots})`);
    console.log(`   Event B: ${eventB.name} (Max: ${eventB.maximumParticipants}, Remaining: ${eventB.remainingSlots})`);

    // 3. Admin Login
    const loginRes = await request('/admin/login', {
      method: 'POST',
      body: { username: 'admin', password: 'TechMania@2026' },
    });
    assert(loginRes.status === 200 && loginRes.data.token, '3. Admin Login succeeds and returns JWT token');
    const adminToken = loginRes.data.token;

    // 4. Test Name Validation
    const invalidNameRes = await request('/registrations', {
      method: 'POST',
      body: {
        fullName: '   ',
        email: 'testname@gmail.com',
        usn: '4VP23MC001',
        eventId: eventA.id,
      },
    });
    assert(invalidNameRes.status === 400 && invalidNameRes.data.error.includes('Name'), '4. Blank/Invalid Name rejected with clear error message');

    // 5. Test Non-Gmail rejection (when GMAIL_ONLY is active)
    const nonGmailRes = await request('/registrations', {
      method: 'POST',
      body: {
        fullName: 'Prajwal Bhat',
        email: 'prajwal@yahoo.com',
        usn: '4VP23MC002',
        eventId: eventA.id,
      },
    });
    assert(nonGmailRes.status === 400 && nonGmailRes.data.error.includes('Gmail'), '5. Non-Gmail address rejected');

    // 6. Test Invalid USN format
    const invalidUsnRes = await request('/registrations', {
      method: 'POST',
      body: {
        fullName: 'Prajwal Bhat',
        email: 'prajwal.valid@gmail.com',
        usn: 'INVALID_USN',
        eventId: eventA.id,
      },
    });
    assert(invalidUsnRes.status === 400 && invalidUsnRes.data.error.includes('USN'), '6. Invalid USN format rejected');

    // 7. Successful First-Time Registration
    const reg1Payload = {
      fullName: 'Prajwal Student One',
      email: 'prajwal.student1@gmail.com',
      usn: '4VP23MC010',
      eventId: eventA.id,
    };
    const reg1 = await request('/registrations', { method: 'POST', body: reg1Payload });
    assert(
      reg1.status === 201 && reg1.data.success && reg1.data.data.registrationNumber.startsWith('TM2-'),
      '7. First-time registration succeeds with confirmed pass & registration ID'
    );
    const reg1Data = reg1.data.data;

    // 8. RULE 3: Duplicate registration for the SAME event rejected
    const dupSameEvent = await request('/registrations', { method: 'POST', body: reg1Payload });
    assert(
      dupSameEvent.status === 400 && dupSameEvent.data.error.includes('Duplicate registrations are not allowed'),
      '8. RULE 3: Duplicate registration for SAME event rejected with exact expected message'
    );

    // 9. RULE 2: Registration for ANOTHER event with same USN rejected
    const diffEventSameUsn = await request('/registrations', {
      method: 'POST',
      body: {
        fullName: 'Prajwal Student One',
        email: 'different.email@gmail.com',
        usn: '4VP23MC010', // Same USN
        eventId: eventB.id, // Different event!
      },
    });
    assert(
      diffEventSameUsn.status === 400 &&
      diffEventSameUsn.data.error.includes('Each participant is allowed to register for only one event'),
      '9. RULE 2: Registration for DIFFERENT event with same USN rejected with exact expected message'
    );

    // 10. RULE 2: Registration for ANOTHER event with same Email rejected
    const diffEventSameEmail = await request('/registrations', {
      method: 'POST',
      body: {
        fullName: 'Another Name',
        email: 'prajwal.student1@gmail.com', // Same email
        usn: '4VP23MC011', // Different USN
        eventId: eventB.id, // Different event!
      },
    });
    assert(
      diffEventSameEmail.status === 400 &&
      diffEventSameEmail.data.error.includes('Each participant is allowed to register for only one event'),
      '10. RULE 2: Registration for DIFFERENT event with same Email rejected with exact expected message'
    );

    // 11. Pass Lookup / Verification Check API
    const lookupByUsn = await request(`/registrations/check?usn=4VP23MC010`);
    assert(
      lookupByUsn.status === 200 && lookupByUsn.data.registered && lookupByUsn.data.data.fullName === 'Prajwal Student One',
      '11. Public pass lookup by USN finds verified registration record'
    );

    // 12. RULE 1 & RULE 5: Capacity limit & Simultaneous concurrency test
    // Let's test concurrency:
    // Create an event with maximumParticipants = 3
    const updateEventRes = await request(`/events/${eventA.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { maximumParticipants: 3 },
    });
    assert(updateEventRes.status === 200, '12. Admin sets Event A capacity to 3');

    // Register 2nd participant
    const reg2 = await request('/registrations', {
      method: 'POST',
      body: {
        fullName: 'Student Two',
        email: 'student2@gmail.com',
        usn: '4VP23MC020',
        eventId: eventA.id,
      },
    });
    assert(reg2.status === 201, '13. Second participant registers (2/3 filled)');

    // Now 1 slot is remaining!
    // Send 5 simultaneous requests with distinct users at the EXACT same time
    console.log('\n--- Firing 5 Simultaneous Registrations for the last 1 slot ---');
    const simultaneousUsers = [
      { fullName: 'Sim User Alpha', email: 'sim1@gmail.com', usn: '4VP23MC031', eventId: eventA.id },
      { fullName: 'Sim User Beta', email: 'sim2@gmail.com', usn: '4VP23MC032', eventId: eventA.id },
      { fullName: 'Sim User Gamma', email: 'sim3@gmail.com', usn: '4VP23MC033', eventId: eventA.id },
      { fullName: 'Sim User Delta', email: 'sim4@gmail.com', usn: '4VP23MC034', eventId: eventA.id },
      { fullName: 'Sim User Epsilon', email: 'sim5@gmail.com', usn: '4VP23MC035', eventId: eventA.id },
    ];

    const concurrentResults = await Promise.all(
      simultaneousUsers.map((user) => request('/registrations', { method: 'POST', body: user }))
    );

    const successfulConcurrent = concurrentResults.filter((r) => r.status === 201);
    const rejectedConcurrent = concurrentResults.filter((r) => r.status === 400);

    console.log(`   Simultaneous outcome: ${successfulConcurrent.length} succeeded, ${rejectedConcurrent.length} rejected`);
    assert(
      successfulConcurrent.length === 1 && rejectedConcurrent.length === 4,
      '14. RULE 1 & 5: Exactly 1 slot won atomically among concurrent requests, capacity never exceeded'
    );

    // Verify rejection error message
    const sampleReject = rejectedConcurrent[0];
    assert(
      sampleReject.data.error.includes('Registration Closed – All Slots Filled') || sampleReject.data.error.includes('Closed'),
      '15. Rejected simultaneous users received "Registration Closed – All Slots Filled."'
    );

    // Check event status is now FULL
    const eventACheck = await request(`/events/${eventA.id}`);
    assert(
      eventACheck.data.data.status === 'FULL' && eventACheck.data.data.remainingSlots === 0,
      '16. Event status automatically marked FULL with 0 remaining slots'
    );

    // 17. Admin Dashboard Stats
    const statsRes = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      statsRes.status === 200 && statsRes.data.stats.totalRegistrations === 3,
      '17. Admin Dashboard stats reflects accurate total registrations and event breakdown'
    );

    // 18. Admin CSV Export
    const csvRes = await fetch(`${API_BASE}/admin/export?eventId=all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const csvText = await csvRes.text();
    assert(
      csvRes.status === 200 && csvText.includes('Registration Number') && csvText.includes('Prajwal Student One'),
      '18. Admin CSV export generates compliant CSV file with participant rows'
    );

    // 19. Cancel / Delete registration and verify slot rollback
    const deleteRes = await request(`/admin/registrations/${reg1Data._id || reg1Data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteRes.status === 200, '19. Admin cancels registration and frees slot');

    // Verify event A re-opened from FULL to OPEN
    const eventARecheck = await request(`/events/${eventA.id}`);
    assert(
      eventARecheck.data.data.status === 'OPEN' && eventARecheck.data.data.remainingSlots === 1,
      '20. Event A automatically re-opened to OPEN with 1 freed slot available'
    );

    // Restore Event A capacity to default (25)
    await request(`/events/${eventA.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { maximumParticipants: 25 },
    });

  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runTests();
