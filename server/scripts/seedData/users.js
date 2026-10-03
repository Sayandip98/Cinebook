import { env } from '../../src/config/env.js';
import { ROLES } from '../../src/constants/roles.js';

export const DEFAULT_USER_PASSWORD = 'Password@123';

export const adminUser = {
  name: 'CineBook Admin',
  email: env.SEED_ADMIN_EMAIL || 'admin@cinebook.com',
  password: env.SEED_ADMIN_PASSWORD || 'ChangeMe@123',
  role: ROLES.ADMIN,
  isVerified: true,
};

export const managerUsers = [
  {
    name: 'Rahul Sen',
    email: 'manager1@cinebook.com',
    password: DEFAULT_USER_PASSWORD,
    phone: '9000000001',
    role: ROLES.THEATER_MANAGER,
    isVerified: true,
  },
  {
    name: 'Priya Nair',
    email: 'manager2@cinebook.com',
    password: DEFAULT_USER_PASSWORD,
    phone: '9000000002',
    role: ROLES.THEATER_MANAGER,
    isVerified: true,
  },
];

export const regularUsers = [
  { name: 'Aarav Sharma', email: 'user1@cinebook.com', phone: '9100000001' },
  { name: 'Diya Patel', email: 'user2@cinebook.com', phone: '9100000002' },
  { name: 'Kabir Singh', email: 'user3@cinebook.com', phone: '9100000003' },
  { name: 'Meera Iyer', email: 'user4@cinebook.com', phone: '9100000004' },
  { name: 'Rohan Das', email: 'user5@cinebook.com', phone: '9100000005' },
].map((user) => ({
  ...user,
  password: DEFAULT_USER_PASSWORD,
  role: ROLES.USER,
  isVerified: true,
}));
