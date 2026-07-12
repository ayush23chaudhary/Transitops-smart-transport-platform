import { PrismaClient, UserRole, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, ExpenseCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data to allow re-seeding
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organizationSettings.deleteMany();

  console.log('Seeding database...');

  // 1. Users
  const saltRounds = 10;
  const safetyPassword = await bcrypt.hash('safety123', saltRounds);
  const fleetPassword = await bcrypt.hash('fleet123', saltRounds);
  const dispatcherPassword = await bcrypt.hash('dispatcher123', saltRounds);
  const financePassword = await bcrypt.hash('finance123', saltRounds);

  const safetyOfficer = await prisma.user.create({
    data: {
      name: 'Safety Officer',
      email: 'safety@transitops.com',
      passwordHash: safetyPassword,
      role: UserRole.SAFETY_OFFICER,
      isActive: true,
    },
  });

  const fleetManager = await prisma.user.create({
    data: {
      name: 'Fleet Manager',
      email: 'fleet@transitops.com',
      passwordHash: fleetPassword,
      role: UserRole.FLEET_MANAGER,
      isActive: true,
    },
  });

  const dispatcher = await prisma.user.create({
    data: {
      name: 'Lead Dispatcher',
      email: 'dispatcher@transitops.com',
      passwordHash: dispatcherPassword,
      role: UserRole.DISPATCHER,
      isActive: true,
    },
  });

  const financialAnalyst = await prisma.user.create({
    data: {
      name: 'Financial Analyst',
      email: 'finance@transitops.com',
      passwordHash: financePassword,
      role: UserRole.FINANCIAL_ANALYST,
      isActive: true,
    },
  });

  console.log('Users seeded.');

  // 2. Settings
  await prisma.organizationSettings.create({
    data: {
      depotName: 'Houston Central Dispatch Depot',
      currencyCode: 'USD',
      distanceUnit: 'km',
    },
  });

  console.log('Settings seeded.');

  // 3. Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'TX-789-AB',
      name: 'Heavy Duty Volvo FH16',
      type: 'Semi-Truck',
      maxLoadCapacity: 25000.00,
      odometer: 152000.50,
      acquisitionCost: 120000.00,
      status: VehicleStatus.AVAILABLE,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'CA-123-CD',
      name: 'Freightliner Cascadia',
      type: 'Semi-Truck',
      maxLoadCapacity: 22000.00,
      odometer: 85400.00,
      acquisitionCost: 95000.00,
      status: VehicleStatus.ON_TRIP,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'NY-456-EF',
      name: 'Ford F-550 Super Duty',
      type: 'Box Truck',
      maxLoadCapacity: 8000.00,
      odometer: 45000.20,
      acquisitionCost: 65000.00,
      status: VehicleStatus.AVAILABLE,
    },
  });

  const vehicle4 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'FL-321-GH',
      name: 'Isuzu NPR-HD',
      type: 'Box Truck',
      maxLoadCapacity: 6500.00,
      odometer: 98000.00,
      acquisitionCost: 55000.00,
      status: VehicleStatus.IN_SHOP,
    },
  });

  const vehicle5 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'NV-987-JK',
      name: 'Mercedes-Benz Sprinter 3500XD',
      type: 'Cargo Van',
      maxLoadCapacity: 3400.00,
      odometer: 12000.00,
      acquisitionCost: 48000.00,
      status: VehicleStatus.RETIRED,
    },
  });

  console.log('Vehicles seeded.');

  // 4. Drivers
  const driver1 = await prisma.driver.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@transitops.com',
      phone: '+1-555-0100',
      licenseNumber: 'DL-987654321',
      licenseCategory: 'Class A CDL',
      licenseExpiryDate: new Date('2028-12-31'),
      safetyScore: 9.5,
      status: DriverStatus.AVAILABLE,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@transitops.com',
      phone: '+1-555-0200',
      licenseNumber: 'DL-123456789',
      licenseCategory: 'Class A CDL',
      licenseExpiryDate: new Date('2027-06-30'),
      safetyScore: 9.8,
      status: DriverStatus.ON_TRIP,
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      name: 'Bob Johnson',
      email: 'bob.johnson@transitops.com',
      phone: '+1-555-0300',
      licenseNumber: 'DL-expired-111',
      licenseCategory: 'Class B CDL',
      licenseExpiryDate: new Date('2025-01-01'), // Expired
      safetyScore: 8.2,
      status: DriverStatus.AVAILABLE,
    },
  });

  const driver4 = await prisma.driver.create({
    data: {
      name: 'Alice Williams',
      email: 'alice.williams@transitops.com',
      phone: '+1-555-0400',
      licenseNumber: 'DL-suspended-222',
      licenseCategory: 'Class A CDL',
      licenseExpiryDate: new Date('2029-08-15'),
      safetyScore: 6.0,
      status: DriverStatus.SUSPENDED,
    },
  });

  const driver5 = await prisma.driver.create({
    data: {
      name: 'Charlie Brown',
      email: 'charlie.brown@transitops.com',
      phone: '+1-555-0500',
      licenseNumber: 'DL-active-333',
      licenseCategory: 'Class C CDL',
      licenseExpiryDate: new Date('2030-01-10'),
      safetyScore: 8.9,
      status: DriverStatus.OFF_DUTY,
    },
  });

  console.log('Drivers seeded.');

  // 5. Trips
  const tripDraft = await prisma.trip.create({
    data: {
      tripNumber: 'TRIP-001',
      source: 'Houston, TX Warehouse',
      destination: 'Dallas, TX Distribution Center',
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      cargoWeight: 18000.00,
      plannedDistance: 240.00,
      status: TripStatus.DRAFT,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      createdById: dispatcher.id,
    },
  });

  const tripDispatched = await prisma.trip.create({
    data: {
      tripNumber: 'TRIP-002',
      source: 'Los Angeles, CA Port',
      destination: 'Phoenix, AZ Depot',
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      cargoWeight: 20000.00,
      plannedDistance: 370.00,
      status: TripStatus.DISPATCHED,
      scheduledAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      dispatchedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
      createdById: dispatcher.id,
    },
  });

  const tripCompleted = await prisma.trip.create({
    data: {
      tripNumber: 'TRIP-003',
      source: 'New York, NY Port',
      destination: 'Philadelphia, PA Warehouse',
      vehicleId: vehicle3.id,
      driverId: driver1.id,
      cargoWeight: 5000.00,
      plannedDistance: 95.00,
      actualDistance: 98.20,
      startOdometer: 44902.00,
      endOdometer: 45000.20,
      status: TripStatus.COMPLETED,
      scheduledAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      dispatchedAt: new Date(Date.now() - 47 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 44 * 60 * 60 * 1000),
      revenue: 1200.00,
      createdById: dispatcher.id,
    },
  });

  const tripCancelled = await prisma.trip.create({
    data: {
      tripNumber: 'TRIP-004',
      source: 'Miami, FL Port',
      destination: 'Orlando, FL Depot',
      vehicleId: vehicle3.id,
      driverId: driver5.id,
      cargoWeight: 4000.00,
      plannedDistance: 235.00,
      status: TripStatus.CANCELLED,
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      cancelledAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      createdById: dispatcher.id,
    },
  });

  console.log('Trips seeded.');

  // 6. Maintenance Records
  await prisma.maintenanceRecord.create({
    data: {
      vehicleId: vehicle4.id,
      maintenanceType: 'Engine Tuning',
      description: 'Scheduled engine diagnostics, replacement of sparks and filters.',
      cost: 450.00,
      status: MaintenanceStatus.IN_PROGRESS,
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdById: fleetManager.id,
    },
  });

  console.log('Maintenance records seeded.');

  // 7. Fuel Logs
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle2.id,
      tripId: tripDispatched.id,
      liters: 150.50,
      cost: 210.75,
      odometerReading: 85550.00,
      recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdById: financialAnalyst.id,
    },
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle3.id,
      tripId: tripCompleted.id,
      liters: 45.20,
      cost: 65.40,
      odometerReading: 45000.20,
      recordedAt: new Date(Date.now() - 44 * 60 * 60 * 1000),
      createdById: financialAnalyst.id,
    },
  });

  console.log('Fuel logs seeded.');

  // 8. Expenses
  await prisma.expense.create({
    data: {
      vehicleId: vehicle3.id,
      tripId: tripCompleted.id,
      category: ExpenseCategory.TOLL,
      amount: 15.00,
      description: 'NJ Turnpike Toll fee',
      expenseDate: new Date(Date.now() - 46 * 60 * 60 * 1000),
      createdById: financialAnalyst.id,
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: vehicle2.id,
      tripId: tripDispatched.id,
      category: ExpenseCategory.PARKING,
      amount: 25.00,
      description: 'Overnight rest stop secure parking',
      expenseDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdById: financialAnalyst.id,
    },
  });

  console.log('Expenses seeded.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
