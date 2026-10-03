import { SCREEN_TYPE } from '../../src/constants/screenType.js';

export const theaters = [
  {
    name: 'CineBook Salt Lake',
    city: 'Kolkata',
    address: 'City Centre, Sector 1, Salt Lake',
    pincode: '700064',
    coordinates: [88.4147, 22.5867],
    amenities: ['Dolby Audio', 'Recliner Seats', 'Food Court', 'Parking'],
    managerEmail: 'manager1@cinebook.com',
    screens: [
      { name: 'Screen 1', type: SCREEN_TYPE.TWO_D, layout: 'STANDARD' },
      { name: 'Screen 2', type: SCREEN_TYPE.THREE_D, layout: 'COMPACT' },
    ],
  },
  {
    name: 'CineBook Park Street',
    city: 'Kolkata',
    address: '12 Park Street',
    pincode: '700016',
    coordinates: [88.3517, 22.5535],
    amenities: ['Dolby Audio', 'Food Court'],
    managerEmail: 'manager1@cinebook.com',
    screens: [
      { name: 'Screen 1', type: SCREEN_TYPE.TWO_D, layout: 'COMPACT' },
      { name: 'Screen 2', type: SCREEN_TYPE.TWO_D, layout: 'STANDARD' },
    ],
  },
  {
    name: 'CineBook Andheri',
    city: 'Mumbai',
    address: 'Link Road, Andheri West',
    pincode: '400053',
    coordinates: [72.8369, 19.1363],
    amenities: ['IMAX', 'Recliner Seats', 'Parking'],
    managerEmail: 'manager2@cinebook.com',
    screens: [
      { name: 'Screen 1', type: SCREEN_TYPE.IMAX, layout: 'LARGE' },
      { name: 'Screen 2', type: SCREEN_TYPE.TWO_D, layout: 'STANDARD' },
    ],
  },
  {
    name: 'CineBook Indiranagar',
    city: 'Bengaluru',
    address: '100 Feet Road, Indiranagar',
    pincode: '560038',
    coordinates: [77.6408, 12.9784],
    amenities: ['Dolby Audio', 'Food Court', 'Wheelchair Access'],
    managerEmail: 'manager2@cinebook.com',
    screens: [
      { name: 'Screen 1', type: SCREEN_TYPE.THREE_D, layout: 'STANDARD' },
      { name: 'Screen 2', type: SCREEN_TYPE.TWO_D, layout: 'COMPACT' },
    ],
  },
];
