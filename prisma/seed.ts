import { db } from '../app/lib/db';

async function main() {
  console.log('Clearing old database records...');
  await db.savedCollege.deleteMany();
  await db.course.deleteMany();
  await db.college.deleteMany();
  await db.user.deleteMany();

  console.log('Generating expanded multi-disciplinary dataset... 🚀');

  const collegesData = [
    // --- ORIGINAL ENGINEERING (JEE/BITSAT/ETC) ---
    {
      name: 'Indian Institute of Technology Bombay',
      location: 'Mumbai, Maharashtra',
      fees: 850000,
      rating: 4.9,
      courses: [
        { title: 'Computer Science', cutoffRank: 60, examAccepted: 'JEE Advanced' },
        { title: 'Electrical Engineering', cutoffRank: 400, examAccepted: 'JEE Advanced' },
      ],
    },
    {
      name: 'Indian Institute of Technology Delhi',
      location: 'New Delhi, Delhi',
      fees: 820000,
      rating: 4.8,
      courses: [
        { title: 'Computer Science', cutoffRank: 100, examAccepted: 'JEE Advanced' },
        { title: 'Mathematics and Computing', cutoffRank: 300, examAccepted: 'JEE Advanced' },
      ],
    },
    {
      name: 'National Institute of Technology Trichy',
      location: 'Tiruchirappalli, Tamil Nadu',
      fees: 500000,
      rating: 4.7,
      courses: [
        { title: 'Computer Science', cutoffRank: 1500, examAccepted: 'JEE Main' },
        { title: 'Electronics & Communication', cutoffRank: 3500, examAccepted: 'JEE Main' },
      ],
    },
    {
      name: 'Delhi Technological University (DTU)',
      location: 'New Delhi, Delhi',
      fees: 600000,
      rating: 4.5,
      courses: [
        { title: 'Software Engineering', cutoffRank: 3500, examAccepted: 'JEE Main' },
        { title: 'Mechanical Engineering', cutoffRank: 12000, examAccepted: 'JEE Main' },
      ],
    },
    {
      name: 'Birla Institute of Technology and Science',
      location: 'Pilani, Rajasthan',
      fees: 2200000,
      rating: 4.8,
      courses: [
        { title: 'Computer Science', cutoffRank: 400, examAccepted: 'BITSAT' },
        { title: 'Electrical & Electronics', cutoffRank: 1200, examAccepted: 'BITSAT' },
      ],
    },
    {
      name: 'Vellore Institute of Technology',
      location: 'Vellore, Tamil Nadu',
      fees: 1500000,
      rating: 4.3,
      courses: [
        { title: 'Computer Science', cutoffRank: 5000, examAccepted: 'VITEEE' },
        { title: 'Information Technology', cutoffRank: 9000, examAccepted: 'VITEEE' },
      ],
    },
    {
      name: 'Jadavpur University',
      location: 'Kolkata, West Bengal',
      fees: 25000, 
      rating: 4.6,
      courses: [
        { title: 'Computer Science', cutoffRank: 100, examAccepted: 'WBJEE' },
        { title: 'Chemical Engineering', cutoffRank: 800, examAccepted: 'WBJEE' },
      ],
    },
    {
      name: 'Indian Institute of Information Technology',
      location: 'Hyderabad, Telangana',
      fees: 1400000,
      rating: 4.8,
      courses: [
        { title: 'Computer Science', cutoffRank: 900, examAccepted: 'JEE Main' },
      ],
    },
    {
      name: 'National Institute of Technology Surathkal',
      location: 'Mangalore, Karnataka',
      fees: 520000,
      rating: 4.6,
      courses: [
        { title: 'Computer Science', cutoffRank: 2000, examAccepted: 'JEE Main' },
        { title: 'Civil Engineering', cutoffRank: 18000, examAccepted: 'JEE Main' },
      ],
    },
    {
      name: 'College of Engineering Pune (COEP)',
      location: 'Pune, Maharashtra',
      fees: 350000,
      rating: 4.4,
      courses: [
        { title: 'Computer Engineering', cutoffRank: 1500, examAccepted: 'MHT CET' },
      ],
    },
    {
      name: 'Netaji Subhas University of Technology',
      location: 'New Delhi, Delhi',
      fees: 650000,
      rating: 4.4,
      courses: [
        { title: 'Computer Science', cutoffRank: 4000, examAccepted: 'JEE Main' },
      ],
    },

    // --- NEW: MEDICAL (NEET) ---
    {
      name: 'All India Institute of Medical Sciences (AIIMS)',
      location: 'New Delhi, Delhi',
      fees: 6000, // Famous for extremely low fees
      rating: 4.9,
      courses: [
        { title: 'MBBS', cutoffRank: 50, examAccepted: 'NEET' },
      ],
    },
    {
      name: 'Christian Medical College (CMC)',
      location: 'Vellore, Tamil Nadu',
      fees: 150000,
      rating: 4.8,
      courses: [
        { title: 'MBBS', cutoffRank: 150, examAccepted: 'NEET' },
      ],
    },
    {
      name: 'All India Institute of Medical Sciences (AIIMS) Patna',
      location: 'Patna, Bihar',
      fees: 6000,
      rating: 4.5,
      courses: [
        { title: 'MBBS', cutoffRank: 1500, examAccepted: 'NEET' },
      ],
    },

    // --- NEW: LAW (CLAT / AILET) ---
    {
      name: 'National Law School of India University (NLSIU)',
      location: 'Bengaluru, Karnataka',
      fees: 325000,
      rating: 4.9,
      courses: [
        { title: 'BA LLB (Hons)', cutoffRank: 100, examAccepted: 'CLAT' },
      ],
    },
    {
      name: 'National Law University (NLU)',
      location: 'New Delhi, Delhi',
      fees: 280000,
      rating: 4.7,
      courses: [
        { title: 'BA LLB (Hons)', cutoffRank: 80, examAccepted: 'AILET' },
      ],
    },

    // --- NEW: COMMERCE & ARTS (CUET) ---
    {
      name: 'Shri Ram College of Commerce (SRCC)',
      location: 'New Delhi, Delhi',
      fees: 30000,
      rating: 4.8,
      courses: [
        { title: 'B.Com (Hons)', cutoffRank: 500, examAccepted: 'CUET' },
        { title: 'BA Economics (Hons)', cutoffRank: 350, examAccepted: 'CUET' },
      ],
    },
    {
      name: 'Hindu College',
      location: 'New Delhi, Delhi',
      fees: 25000,
      rating: 4.7,
      courses: [
        { title: 'BA Political Science', cutoffRank: 400, examAccepted: 'CUET' },
        { title: 'B.Sc Physics', cutoffRank: 600, examAccepted: 'CUET' },
      ],
    },

    // --- NEW: MANAGEMENT (IPMAT) ---
    {
      name: 'Indian Institute of Management (IIM) Indore',
      location: 'Indore, Madhya Pradesh',
      fees: 2800000, // 5-year integrated program
      rating: 4.8,
      courses: [
        { title: 'Integrated Programme in Management (BBA+MBA)', cutoffRank: 300, examAccepted: 'IPMAT' },
      ],
    },

    // --- NEW: REGIONAL ENGINEERING (COMEDK / JEE) ---
    {
      name: 'RV College of Engineering',
      location: 'Bengaluru, Karnataka',
      fees: 1100000,
      rating: 4.5,
      courses: [
        { title: 'Computer Science', cutoffRank: 350, examAccepted: 'COMEDK' },
        { title: 'Aerospace Engineering', cutoffRank: 2500, examAccepted: 'COMEDK' },
      ],
    },
    {
      name: 'Indian Institute of Technology Patna',
      location: 'Patna, Bihar',
      fees: 800000,
      rating: 4.6,
      courses: [
        { title: 'Computer Science', cutoffRank: 2800, examAccepted: 'JEE Advanced' },
        { title: 'Artificial Intelligence', cutoffRank: 3500, examAccepted: 'JEE Advanced' },
      ],
    }
  ];

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

  console.log(`Successfully seeded ${collegesData.length} multi-disciplinary colleges! 🌱`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });