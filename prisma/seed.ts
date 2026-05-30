import { db } from '../app/lib/db';

async function main() {
  console.log('Clearing old database records...');
  await db.savedCollege.deleteMany();
  await db.course.deleteMany();
  await db.college.deleteMany();
  await db.user.deleteMany();

  console.log('Generating expanded dataset with single cutoff ranks... 🚀');

  const collegesData = [
    {
      name: 'Indian Institute of Technology Bombay',
      location: 'Mumbai, Maharashtra',
      fees: 850000,
      rating: 4.9,
      courses: [
        { title: 'Computer Science', cutoffRank: 60 },
        { title: 'Electrical Engineering', cutoffRank: 400 },
      ],
    },
    {
      name: 'Indian Institute of Technology Delhi',
      location: 'New Delhi, Delhi',
      fees: 820000,
      rating: 4.8,
      courses: [
        { title: 'Computer Science', cutoffRank: 100 },
        { title: 'Mathematics and Computing', cutoffRank: 300 },
      ],
    },
    {
      name: 'National Institute of Technology Trichy',
      location: 'Tiruchirappalli, Tamil Nadu',
      fees: 500000,
      rating: 4.7,
      courses: [
        { title: 'Computer Science', cutoffRank: 1500 },
        { title: 'Electronics & Communication', cutoffRank: 3500 },
      ],
    },
    {
      name: 'Delhi Technological University (DTU)',
      location: 'New Delhi, Delhi',
      fees: 600000,
      rating: 4.5,
      courses: [
        { title: 'Software Engineering', cutoffRank: 3500 },
        { title: 'Mechanical Engineering', cutoffRank: 12000 },
      ],
    },
    {
      name: 'Birla Institute of Technology and Science',
      location: 'Pilani, Rajasthan',
      fees: 2200000,
      rating: 4.8,
      courses: [
        { title: 'Computer Science', cutoffRank: 400 },
        { title: 'Electrical & Electronics', cutoffRank: 1200 },
      ],
    },
    {
      name: 'Vellore Institute of Technology',
      location: 'Vellore, Tamil Nadu',
      fees: 1500000,
      rating: 4.3,
      courses: [
        { title: 'Computer Science', cutoffRank: 5000 },
        { title: 'Information Technology', cutoffRank: 9000 },
      ],
    },
    {
      name: 'Jadavpur University',
      location: 'Kolkata, West Bengal',
      fees: 25000, 
      rating: 4.6,
      courses: [
        { title: 'Computer Science', cutoffRank: 100 },
        { title: 'Chemical Engineering', cutoffRank: 800 },
      ],
    },
    {
      name: 'Indian Institute of Information Technology',
      location: 'Hyderabad, Telangana',
      fees: 1400000,
      rating: 4.8,
      courses: [
        { title: 'Computer Science', cutoffRank: 900 },
      ],
    },
    {
      name: 'National Institute of Technology Surathkal',
      location: 'Mangalore, Karnataka',
      fees: 520000,
      rating: 4.6,
      courses: [
        { title: 'Computer Science', cutoffRank: 2000 },
        { title: 'Civil Engineering', cutoffRank: 18000 },
      ],
    },
    {
      name: 'College of Engineering Pune (COEP)',
      location: 'Pune, Maharashtra',
      fees: 350000,
      rating: 4.4,
      courses: [
        { title: 'Computer Engineering', cutoffRank: 1500 },
      ],
    },
    {
      name: 'Netaji Subhas University of Technology',
      location: 'New Delhi, Delhi',
      fees: 650000,
      rating: 4.4,
      courses: [
        { title: 'Computer Science', cutoffRank: 4000 },
      ],
    },
  ];

  // Loop through and insert all colleges with their nested courses
  for (const college of collegesData) {
    await db.college.create({
      data: {
        name: college.name,
        location: college.location,
        fees: college.fees,
        rating: college.rating,
        courses: {
          create: college.courses,
        },
      },
    });
  }

  console.log(`Successfully seeded ${collegesData.length} colleges into the database! 🌱`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });