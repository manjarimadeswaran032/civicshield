
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import Department from '../models/Department.js';
import ComplaintCategory from '../models/ComplaintCategory.js';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import SecurityEvent from '../models/SecurityEvent.js';
import SystemSetting from '../models/SystemSetting.js';

import { ROLES, COMPLAINT_STATUS, COMPLAINT_PRIORITY, NOTIFICATION_TYPES, AUDIT_ACTIONS, SECURITY_EVENT_TYPES } from '../config/constants.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[SEEDER] Provisioning CivicShield initial database...');
    

    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Permission.deleteMany({}),
      Department.deleteMany({}),
      ComplaintCategory.deleteMany({}),
      Complaint.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      SecurityEvent.deleteMany({}),
      SystemSetting.deleteMany({})
    ]);

    // 1. Permissions
    await Permission.insertMany([
      { name: 'complaints:create', description: 'Create new complaint', resource: 'complaints', action: 'create' },
      { name: 'complaints:read:own', description: 'Read own complaints', resource: 'complaints', action: 'read' },
      { name: 'complaints:read:all', description: 'Read all complaints', resource: 'complaints', action: 'read' },
      { name: 'complaints:update:status', description: 'Update complaint lifecycle status', resource: 'complaints', action: 'update' },
      { name: 'complaints:assign', description: 'Assign complaint to officer', resource: 'complaints', action: 'assign' },
      { name: 'complaints:resolve', description: 'Mark complaint resolved', resource: 'complaints', action: 'resolve' },
      { name: 'complaints:reopen', description: 'Reopen resolved complaint', resource: 'complaints', action: 'reopen' },
      { name: 'users:manage', description: 'Full user administration', resource: 'users', action: 'manage' },
      { name: 'roles:manage', description: 'Manage RBAC roles and permissions', resource: 'roles', action: 'manage' },
      { name: 'departments:manage', description: 'Manage municipal departments', resource: 'departments', action: 'manage' },
      { name: 'categories:manage', description: 'Manage complaint categories', resource: 'categories', action: 'manage' },
      { name: 'audit_logs:read', description: 'View system audit logs', resource: 'audit_logs', action: 'read' },
      { name: 'analytics:read', description: 'View system analytics', resource: 'analytics', action: 'read' }
    ]);

    // 2. Roles
    await Role.insertMany([
      {
        name: ROLES.CITIZEN,
        displayName: 'Registered Citizen',
        description: 'Citizen reporting civic issues, tracking resolution progress, and providing feedback.',
        permissions: ['complaints:create', 'complaints:read:own', 'complaints:reopen']
      },
      {
        name: ROLES.OFFICER,
        displayName: 'Municipal Field Officer',
        description: 'Authorized field officer resolving assigned complaints and adding progress remarks.',
        permissions: ['complaints:read:all', 'complaints:update:status', 'complaints:resolve']
      },
      {
        name: ROLES.MANAGER,
        displayName: 'Department Operations Manager',
        description: 'Department manager assigning officers, supervising SLAs, and monitoring department analytics.',
        permissions: ['complaints:read:all', 'complaints:update:status', 'complaints:assign', 'complaints:resolve', 'analytics:read']
      },
      {
        name: ROLES.ADMIN,
        displayName: 'System Administrator',
        description: 'Supervisory authority managing users, departments, categories, audit logs, and security.',
        permissions: [
          'complaints:create', 'complaints:read:all', 'complaints:update:status', 'complaints:assign', 'complaints:resolve', 'complaints:reopen',
          'users:manage', 'roles:manage', 'departments:manage', 'categories:manage', 'audit_logs:read', 'analytics:read'
        ]
      }
    ]);

    // 3. Departments
    const deptRoads = await Department.create({
      name: 'Roads & Transportation Infrastructure',
      code: 'ROADS',
      description: 'Road resurfacing, pothole repairs, bridges, and traffic signage.',
      contactEmail: 'roads.dept@civicshield.gov',
      contactPhone: '+1-800-555-ROAD'
    });

    const deptSanitation = await Department.create({
      name: 'Sanitation & Solid Waste Management',
      code: 'SWM',
      description: 'Garbage collection, community bins, and street cleaning.',
      contactEmail: 'sanitation@civicshield.gov',
      contactPhone: '+1-800-555-WASTE'
    });

    const deptElectricity = await Department.create({
      name: 'Public Lighting & Electricity',
      code: 'ELEC',
      description: 'Streetlights, electrical poles, and transformers.',
      contactEmail: 'electricity@civicshield.gov',
      contactPhone: '+1-800-555-LIGHT'
    });

    const deptWater = await Department.create({
      name: 'Water Supply & Sewerage Board',
      code: 'WATER',
      description: 'Municipal drinking water pipeline, storm drainage, and sewage.',
      contactEmail: 'water.board@civicshield.gov',
      contactPhone: '+1-800-555-WATER'
    });

    const deptParks = await Department.create({
      name: 'Parks & Public Amenities',
      code: 'PARKS',
      description: 'Parks, gardens, and urban tree maintenance.',
      contactEmail: 'parks@civicshield.gov',
      contactPhone: '+1-800-555-PARK'
    });

    const deptHealth = await Department.create({
      name: 'Public Health & Vector Control',
      code: 'HEALTH',
      description: 'Vector-borne disease prevention and mosquito control.',
      contactEmail: 'health@civicshield.gov',
      contactPhone: '+1-800-555-HEAL'
    });

    // 4. Categories
    const catPothole = await ComplaintCategory.create({
      name: 'Pothole & Road Damage',
      code: 'POT',
      description: 'Deep road potholes, broken dividers, and asphalt damage.',
      icon: 'AlertTriangle',
      defaultDepartment: deptRoads._id,
      defaultPriority: COMPLAINT_PRIORITY.HIGH,
      defaultSlaHours: 48
    });

    const catStreetlight = await ComplaintCategory.create({
      name: 'Streetlight Malfunction',
      code: 'LGT',
      description: 'Broken, flickering, or unlit municipal street lights.',
      icon: 'Zap',
      defaultDepartment: deptElectricity._id,
      defaultPriority: COMPLAINT_PRIORITY.MEDIUM,
      defaultSlaHours: 72
    });

    const catGarbage = await ComplaintCategory.create({
      name: 'Overflowing Waste Bins',
      code: 'GAR',
      description: 'Uncollected community waste bins and trash overflow.',
      icon: 'Trash2',
      defaultDepartment: deptSanitation._id,
      defaultPriority: COMPLAINT_PRIORITY.HIGH,
      defaultSlaHours: 24
    });

    const catWaterLeak = await ComplaintCategory.create({
      name: 'Water Pipeline Leakage',
      code: 'WAT',
      description: 'Burst pipelines and high-volume water leakage.',
      icon: 'Droplets',
      defaultDepartment: deptWater._id,
      defaultPriority: COMPLAINT_PRIORITY.CRITICAL,
      defaultSlaHours: 12
    });

    const catDrainage = await ComplaintCategory.create({
      name: 'Blocked Drainage & Sewage',
      code: 'DRN',
      description: 'Clogged storm drains and overflowing sewer manholes.',
      icon: 'Waves',
      defaultDepartment: deptWater._id,
      defaultPriority: COMPLAINT_PRIORITY.HIGH,
      defaultSlaHours: 36
    });

    const catTree = await ComplaintCategory.create({
      name: 'Fallen Tree / Dangerous Branch',
      code: 'TRE',
      description: 'Fallen tree limbs blocking roads or walkways.',
      icon: 'TreePine',
      defaultDepartment: deptParks._id,
      defaultPriority: COMPLAINT_PRIORITY.MEDIUM,
      defaultSlaHours: 48
    });

    // 5. Users
    const salt = await bcrypt.genSalt(12);
    const adminPass = await bcrypt.hash('Admin@123456', salt);
    const mgrPass = await bcrypt.hash('Manager@123456', salt);
    const offPass = await bcrypt.hash('Officer@123456', salt);
    const citPass = await bcrypt.hash('Citizen@123456', salt);

    const adminUser = await User.create({
      name: 'Chief Municipal Administrator',
      email: 'admin@civicshield.gov',
      passwordHash: adminPass,
      role: ROLES.ADMIN,
      phone: '+1-555-0100',
      address: 'Civic Command Centre, Central City',
      isActive: true
    });

    const managerRoads = await User.create({
      name: 'Victoria Vance (Roads Manager)',
      email: 'manager.roads@civicshield.gov',
      passwordHash: mgrPass,
      role: ROLES.MANAGER,
      department: deptRoads._id,
      phone: '+1-555-0101',
      address: 'Works Division HQ, Zone A',
      isActive: true
    });

    const managerWater = await User.create({
      name: 'Marcus Chen (Water Board Manager)',
      email: 'manager.water@civicshield.gov',
      passwordHash: mgrPass,
      role: ROLES.MANAGER,
      department: deptWater._id,
      phone: '+1-555-0102',
      address: 'Water Supply Complex, Zone B',
      isActive: true
    });

    const officerSharma = await User.create({
      name: 'Inspector Rajesh Sharma',
      email: 'officer.sharma@civicshield.gov',
      passwordHash: offPass,
      role: ROLES.OFFICER,
      department: deptRoads._id,
      phone: '+1-555-0103',
      address: 'Field Unit 4, Road Maintenance',
      isActive: true
    });

    const officerLisa = await User.create({
      name: 'Engineer Lisa Morales',
      email: 'officer.morales@civicshield.gov',
      passwordHash: offPass,
      role: ROLES.OFFICER,
      department: deptElectricity._id,
      phone: '+1-555-0104',
      address: 'Grid Maintenance Station 2',
      isActive: true
    });

    const officerTariq = await User.create({
      name: 'Supervisor Tariq Ahmed',
      email: 'officer.ahmed@civicshield.gov',
      passwordHash: offPass,
      role: ROLES.OFFICER,
      department: deptSanitation._id,
      phone: '+1-555-0105',
      address: 'Central Waste Depo 7',
      isActive: true
    });

    const citizenRahul = await User.create({
      name: 'Rahul Verma',
      email: 'citizen.rahul@example.com',
      passwordHash: citPass,
      role: ROLES.CITIZEN,
      phone: '+1-555-0201',
      address: 'Flat 402, Sunshine Heights, MG Road',
      isActive: true
    });

    const citizenPriya = await User.create({
      name: 'Priya Sundaram',
      email: 'citizen.priya@example.com',
      passwordHash: citPass,
      role: ROLES.CITIZEN,
      phone: '+1-555-0202',
      address: '18 Oakwood Lane, Green Valley',
      isActive: true
    });

    // 6. Complaints
    const complaints = await Complaint.insertMany([
      {
        complaintId: 'CIV-2026-000001',
        citizenId: citizenRahul._id,
        citizenName: citizenRahul.name,
        citizenEmail: citizenRahul.email,
        citizenPhone: citizenRahul.phone,
        title: 'Deep Hazardous Pothole near MG Road Metro Station Gate 2',
        description: 'A 2-foot wide and 8-inch deep crater has formed on the right lane near Gate 2, causing two-wheelers to skid and triggering heavy traffic buildup.',
        category: catPothole.name,
        categoryCode: 'POT',
        location: {
          address: 'Opposite MG Road Metro Gate 2, Central Ward',
          landmark: 'Metro Station Gate 2',
          city: 'Metro City',
          postalCode: '110001',
          coordinates: { lat: 28.6139, lng: 77.2090 }
        },
        priority: COMPLAINT_PRIORITY.HIGH,
        status: COMPLAINT_STATUS.CLOSED,
        assignedDepartment: deptRoads._id,
        assignedDepartmentName: deptRoads.name,
        assignedOfficer: officerSharma._id,
        assignedOfficerName: officerSharma.name,
        assignedOfficerEmail: officerSharma.email,
        slaHours: 48,
        slaDeadline: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isOverdue: false,
        resolutionRemarks: 'Emergency asphalt cold-mix patch applied, compacted with road roller, and thermal sealed.',
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        closedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        citizenConfirmation: {
          isConfirmed: true,
          confirmedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          confirmationRemarks: 'Inspection verified. Excellent and prompt repair work!'
        },
        feedback: {
          rating: 5,
          comment: 'Very impressive response time. Repaired within 24 hours of reporting!',
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        statusHistory: [
          { previousStatus: 'None', newStatus: COMPLAINT_STATUS.SUBMITTED, remarks: 'Filed by citizen via mobile portal', updatedByName: citizenRahul.name, updatedByRole: 'citizen', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.SUBMITTED, newStatus: COMPLAINT_STATUS.ASSIGNED, remarks: 'Assigned to Inspector Sharma', updatedByName: managerRoads.name, updatedByRole: 'manager', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.ASSIGNED, newStatus: COMPLAINT_STATUS.IN_PROGRESS, remarks: 'Road repair crew deployed with materials', updatedByName: officerSharma.name, updatedByRole: 'officer', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.IN_PROGRESS, newStatus: COMPLAINT_STATUS.RESOLVED, remarks: 'Asphalt paving completed and compacted', updatedByName: officerSharma.name, updatedByRole: 'officer', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.RESOLVED, newStatus: COMPLAINT_STATUS.CLOSED, remarks: 'Citizen verified and confirmed resolution', updatedByName: citizenRahul.name, updatedByRole: 'citizen', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        complaintId: 'CIV-2026-000002',
        citizenId: citizenPriya._id,
        citizenName: citizenPriya.name,
        citizenEmail: citizenPriya.email,
        citizenPhone: citizenPriya.phone,
        title: 'Consecutive Dark Streetlights on Oakwood Avenue',
        description: 'Five consecutive streetlight poles (P-104 to P-109) have been pitch black for 3 nights, making nighttime transit unsafe.',
        category: catStreetlight.name,
        categoryCode: 'LGT',
        location: {
          address: 'Oakwood Avenue, Between Crossroad 4 and 6',
          landmark: 'Near Community Park Entrance',
          city: 'Metro City',
          postalCode: '110008',
          coordinates: { lat: 28.6250, lng: 77.2180 }
        },
        priority: COMPLAINT_PRIORITY.MEDIUM,
        status: COMPLAINT_STATUS.RESOLVED,
        assignedDepartment: deptElectricity._id,
        assignedDepartmentName: deptElectricity.name,
        assignedOfficer: officerLisa._id,
        assignedOfficerName: officerLisa.name,
        assignedOfficerEmail: officerLisa.email,
        slaHours: 72,
        slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000),
        isOverdue: false,
        resolutionRemarks: 'Feeder pillar fuse replaced and 3 damaged 90W LED luminaire drivers installed. All 5 poles illuminated.',
        resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        statusHistory: [
          { previousStatus: 'None', newStatus: COMPLAINT_STATUS.SUBMITTED, remarks: 'Submitted by citizen', updatedByName: citizenPriya.name, updatedByRole: 'citizen', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.SUBMITTED, newStatus: COMPLAINT_STATUS.ASSIGNED, remarks: 'Assigned to Grid Maintenance Unit', updatedByName: 'Admin', updatedByRole: 'admin', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.ASSIGNED, newStatus: COMPLAINT_STATUS.IN_PROGRESS, remarks: 'Electrician team inspecting underground line', updatedByName: officerLisa.name, updatedByRole: 'officer', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.IN_PROGRESS, newStatus: COMPLAINT_STATUS.RESOLVED, remarks: 'Drivers replaced and tested successfully', updatedByName: officerLisa.name, updatedByRole: 'officer', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) }
        ]
      },
      {
        complaintId: 'CIV-2026-000003',
        citizenId: citizenRahul._id,
        citizenName: citizenRahul.name,
        citizenEmail: citizenRahul.email,
        citizenPhone: citizenRahul.phone,
        title: 'Massive Waste Bin Overflowing & Litter Spillage',
        description: 'The green community dump bin has not been emptied for 4 days. Waste has spilled over onto the road with foul odor.',
        category: catGarbage.name,
        categoryCode: 'GAR',
        location: {
          address: 'Corner of 89 North End Boulevard & 5th Cross',
          landmark: 'Beside City Market Complex',
          city: 'Metro City',
          postalCode: '110012',
          coordinates: { lat: 28.6340, lng: 77.2250 }
        },
        priority: COMPLAINT_PRIORITY.HIGH,
        status: COMPLAINT_STATUS.IN_PROGRESS,
        assignedDepartment: deptSanitation._id,
        assignedDepartmentName: deptSanitation.name,
        assignedOfficer: officerTariq._id,
        assignedOfficerName: officerTariq.name,
        assignedOfficerEmail: officerTariq.email,
        slaHours: 24,
        slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
        isOverdue: false,
        officerRemarks: 'Sanitation compactor truck #14 dispatched with clean-up crew.',
        statusHistory: [
          { previousStatus: 'None', newStatus: COMPLAINT_STATUS.SUBMITTED, remarks: 'Submitted by citizen', updatedByName: citizenRahul.name, updatedByRole: 'citizen', timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.SUBMITTED, newStatus: COMPLAINT_STATUS.ASSIGNED, remarks: 'Assigned to Supervisor Tariq', updatedByName: 'System', updatedByRole: 'system', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.ASSIGNED, newStatus: COMPLAINT_STATUS.IN_PROGRESS, remarks: 'Compactor truck deployed', updatedByName: officerTariq.name, updatedByRole: 'officer', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
        ]
      },
      {
        complaintId: 'CIV-2026-000004',
        citizenId: citizenPriya._id,
        citizenName: citizenPriya.name,
        citizenEmail: citizenPriya.email,
        citizenPhone: citizenPriya.phone,
        title: 'Severe Sewage Overflow and Manhole Backflow on Sector 4 Lane',
        description: 'Sewage drain is clogged and overflowing into residential areas. Unsanitary condition and severe odor.',
        category: catDrainage.name,
        categoryCode: 'DRN',
        location: {
          address: 'Sector 4, Lane 3, Near Sunshine Public School',
          landmark: 'Adjacent to School Playground',
          city: 'Metro City',
          postalCode: '110008',
          coordinates: { lat: 28.6290, lng: 77.2120 }
        },
        priority: COMPLAINT_PRIORITY.HIGH,
        status: COMPLAINT_STATUS.REOPENED,
        assignedDepartment: deptWater._id,
        assignedDepartmentName: deptWater.name,
        slaHours: 36,
        slaDeadline: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isOverdue: true,
        escalationLevel: 2,
        escalationAlert: 'SLA Breached & Citizen Reopened: Sewer line still backing up.',
        reopenReason: 'The cleaning crew cleared surface debris, but the underground sewer line is still backed up.',
        reopenedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        reopenCount: 1,
        statusHistory: [
          { previousStatus: 'None', newStatus: COMPLAINT_STATUS.SUBMITTED, remarks: 'Logged by resident', updatedByName: citizenPriya.name, updatedByRole: 'citizen', timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.SUBMITTED, newStatus: COMPLAINT_STATUS.IN_PROGRESS, remarks: 'Suction jetting deployed', updatedByName: 'Staff', updatedByRole: 'officer', timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.IN_PROGRESS, newStatus: COMPLAINT_STATUS.RESOLVED, remarks: 'Initial clearing done', updatedByName: 'Staff', updatedByRole: 'officer', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.RESOLVED, newStatus: COMPLAINT_STATUS.REOPENED, remarks: 'Citizen rejected resolution: sewer still backing up', updatedByName: citizenPriya.name, updatedByRole: 'citizen', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) }
        ]
      },
      {
        complaintId: 'CIV-2026-000005',
        citizenId: citizenRahul._id,
        citizenName: citizenRahul.name,
        citizenEmail: citizenRahul.email,
        citizenPhone: citizenRahul.phone,
        title: 'Burst Drinking Water Pipeline – Urgent Repair Needed',
        description: 'Potable water pipeline joint ruptured. Clean water spilling over the road continuously.',
        category: catWaterLeak.name,
        categoryCode: 'WAT',
        location: {
          address: 'Near Sunshine Heights Gate 1, Ring Road',
          landmark: 'Opposite Shell Fuel Station',
          city: 'Metro City',
          postalCode: '110001',
          coordinates: { lat: 28.6180, lng: 77.2050 }
        },
        priority: COMPLAINT_PRIORITY.CRITICAL,
        status: COMPLAINT_STATUS.ASSIGNED,
        assignedDepartment: deptWater._id,
        assignedDepartmentName: deptWater.name,
        slaHours: 12,
        slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
        isOverdue: false,
        statusHistory: [
          { previousStatus: 'None', newStatus: COMPLAINT_STATUS.SUBMITTED, remarks: 'Critical priority water leakage flagged', updatedByName: citizenRahul.name, updatedByRole: 'citizen', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
          { previousStatus: COMPLAINT_STATUS.SUBMITTED, newStatus: COMPLAINT_STATUS.ASSIGNED, remarks: 'Assigned to emergency pipeline crew', updatedByName: managerWater.name, updatedByRole: 'manager', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) }
        ]
      }
    ]);

    // 7. Notifications
    await Notification.insertMany([
      {
        userId: citizenRahul._id,
        complaintId: complaints[0]._id,
        complaintCode: complaints[0].complaintId,
        type: NOTIFICATION_TYPES.RESOLUTION_CONFIRMED,
        title: '🎉 Complaint Closed & Resolution Confirmed',
        message: 'Your complaint CIV-2026-000001 has been confirmed and closed.',
        isRead: true,
        link: '/citizen/complaints/CIV-2026-000001'
      },
      {
        userId: citizenPriya._id,
        complaintId: complaints[1]._id,
        complaintCode: complaints[1].complaintId,
        type: NOTIFICATION_TYPES.COMPLAINT_RESOLVED,
        title: 'Streetlights Repaired – Please Confirm Resolution',
        message: 'Officer Lisa Morales has marked CIV-2026-000002 as Resolved. Please confirm if issue is solved.',
        isRead: false,
        link: '/citizen/complaints/CIV-2026-000002'
      },
      {
        userId: managerRoads._id,
        complaintId: complaints[3]._id,
        complaintCode: complaints[3].complaintId,
        type: NOTIFICATION_TYPES.COMPLAINT_ESCALATED,
        title: '🚨 Reopened Complaint Alert',
        message: 'CIV-2026-000004 has been reopened by citizen and requires immediate executive review.',
        isRead: false,
        link: '/officer/complaints/CIV-2026-000004'
      }
    ]);

    // 8. Audit Logs
    await AuditLog.insertMany([
      {
        userId: adminUser._id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        role: adminUser.role,
        action: AUDIT_ACTIONS.USER_LOGIN,
        resource: 'users',
        resourceId: adminUser._id.toString(),
        details: { method: 'JWT_BEARER', status: 'AUTHORIZED' },
        ipAddress: '127.0.0.1',
        userAgent: 'CivicShield Desktop Chrome/126',
        result: 'SUCCESS'
      },
      {
        userId: citizenRahul._id,
        userName: citizenRahul.name,
        userEmail: citizenRahul.email,
        role: citizenRahul.role,
        action: AUDIT_ACTIONS.COMPLAINT_CREATE,
        resource: 'complaints',
        resourceId: 'CIV-2026-000001',
        details: { category: 'Pothole & Road Damage', priority: 'High' },
        ipAddress: '192.168.1.104',
        result: 'SUCCESS'
      }
    ]);

    // 9. Security Events
    await SecurityEvent.insertMany([
      {
        eventType: SECURITY_EVENT_TYPES.FAILED_LOGIN,
        severity: 'MEDIUM',
        description: 'Failed password attempt for account non_existent_user@test.gov',
        email: 'non_existent_user@test.gov',
        ipAddress: '203.0.113.19',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
        path: '/api/auth/login',
        method: 'POST'
      },
      {
        eventType: SECURITY_EVENT_TYPES.PERMISSION_DENIED,
        severity: 'HIGH',
        description: 'Citizen attempted unauthorized access to /api/admin/users [Forbidden]',
        email: 'citizen.priya@example.com',
        ipAddress: '192.168.1.108',
        path: '/api/admin/users',
        method: 'GET'
      }
    ]);

    // 10. System Settings
    await SystemSetting.insertMany([
      { key: 'sla_check_interval_seconds', value: 60, description: 'Frequency of automated SLA check job' },
      { key: 'auto_escalation_enabled', value: true, description: 'Automatically flag overdue complaints' },
      { key: 'public_portal_banner', value: 'CivicShield 24/7 Municipal Portal is active.', description: 'Top announcement bar message' }
    ]);

    console.log('[SEEDER] =========================================================');
    console.log('[SEEDER] ✨ Database Seeding Completed Successfully!');
    console.log('[SEEDER] ---------------------------------------------------------');
    console.log('[SEEDER] 🔑 Demo Login Credentials for Evaluation:');
    console.log('[SEEDER] 👑 Admin:    admin@civicshield.gov           / Admin@123456');
    console.log('[SEEDER] 🏢 Manager:  manager.roads@civicshield.gov   / Manager@123456');
    console.log('[SEEDER] 👮 Officer:  officer.sharma@civicshield.gov  / Officer@123456');
    console.log('[SEEDER] 👤 Citizen:  citizen.rahul@example.com       / Citizen@123456');
    console.log('[SEEDER] =========================================================');

    
  } catch (error) {
    console.error('[SEEDER ERROR]', error);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].includes('seedData.js')) {
  seedDatabase();
}
