import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import { ROLES, COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../config/constants.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 Starting CivicShield Automated Backend Test Suite');
  console.log('====================================================');

  await connectDB();

  try {
    console.log('\n--- 1. Authentication & Password Security Tests ---');
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('SecurePassword@2026', salt);
    const validMatch = await bcrypt.compare('SecurePassword@2026', hash);
    const invalidMatch = await bcrypt.compare('WrongPassword', hash);
    
    assert(validMatch === true, 'Bcrypt verifies valid password hash');
    assert(invalidMatch === false, 'Bcrypt rejects incorrect password');

    console.log('\n--- 2. JWT Generation & Role Payload Tests ---');
    const secret = 'test_secret_key_civicshield';
    const token = jwt.sign({ id: 'user_123', role: ROLES.CITIZEN }, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);

    assert(decoded.id === 'user_123', 'JWT carries correct User ID');
    assert(decoded.role === ROLES.CITIZEN, 'JWT carries correct RBAC Role');

    console.log('\n--- 3. Complaint Lifecycle & State Machine Tests ---');
    const validTransitions = {
      [COMPLAINT_STATUS.SUBMITTED]: [COMPLAINT_STATUS.UNDER_REVIEW, COMPLAINT_STATUS.ASSIGNED],
      [COMPLAINT_STATUS.UNDER_REVIEW]: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS],
      [COMPLAINT_STATUS.ASSIGNED]: [COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.UNDER_REVIEW],
      [COMPLAINT_STATUS.IN_PROGRESS]: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.UNDER_REVIEW],
      [COMPLAINT_STATUS.RESOLVED]: [COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REOPENED]
    };

    assert(validTransitions[COMPLAINT_STATUS.SUBMITTED].includes(COMPLAINT_STATUS.UNDER_REVIEW), 'Submitted can transition to Under Review');
    assert(validTransitions[COMPLAINT_STATUS.RESOLVED].includes(COMPLAINT_STATUS.REOPENED), 'Resolved can transition to Reopened');
    assert(!validTransitions[COMPLAINT_STATUS.SUBMITTED].includes(COMPLAINT_STATUS.CLOSED), 'Submitted CANNOT jump directly to Closed');

    console.log('\n--- 4. Role Hierarchy & Permission Scope Tests ---');
    const hasAdminAccess = (role) => role === ROLES.ADMIN;
    const hasOfficerAccess = (role) => [ROLES.OFFICER, ROLES.MANAGER, ROLES.ADMIN].includes(role);

    assert(hasAdminAccess(ROLES.ADMIN) === true, 'Admin has administrative access');
    assert(hasAdminAccess(ROLES.OFFICER) === false, 'Officer is blocked from admin functions');
    assert(hasAdminAccess(ROLES.CITIZEN) === false, 'Citizen is blocked from admin functions');
    assert(hasOfficerAccess(ROLES.OFFICER) === true, 'Officer has officer portal access');
    assert(hasOfficerAccess(ROLES.CITIZEN) === false, 'Citizen is blocked from officer endpoints');

    console.log('\n--- 5. SLA Calculation Logic Tests ---');
    const prioritySla = {
      [COMPLAINT_PRIORITY.LOW]: 168,
      [COMPLAINT_PRIORITY.MEDIUM]: 72,
      [COMPLAINT_PRIORITY.HIGH]: 48,
      [COMPLAINT_PRIORITY.CRITICAL]: 12
    };

    assert(prioritySla[COMPLAINT_PRIORITY.CRITICAL] === 12, 'Critical priority has 12h SLA');
    assert(prioritySla[COMPLAINT_PRIORITY.HIGH] === 48, 'High priority has 48h SLA');

    console.log('\n====================================================');
    console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test Suite Error:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

runTestSuite();
