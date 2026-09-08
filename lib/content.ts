// Site content, kept in one place so real details can be swapped in easily.
// Facts marked "REAL" come from the gym's discovery questionnaire, the owner's
// approved "WhatsApp Knowledge & Guardrails" submission, live WhatsApp setup,
// or the Google Business listing. "PLACEHOLDER" is generic copy standing in
// until real testimonials are collected.

import type { IconName } from "@/components/Icon";

export const SITE = {
  name: "Flex Fitness", // REAL
  legalName: "Flex Fitness by Nithish™", // REAL — from the owner's approved submission
  tagline: "Ayodhya of Bodybuilding", // REAL — from the brand logo
  greetingLine: "Feel the vibe. Join the tribe.", // REAL — from the owner's approved WhatsApp greeting
  ownerSignature: "By Nithish", // REAL — from the brand logo
  neighborhood: "Gubbalala", // REAL
  city: "Bengaluru", // REAL
  whatsappNumber: "919019204104", // Testing number for now — owner will switch this to the real gym number (996440 6662) before launch
  whatsappLink: "https://wa.me/919019204104",
  whatsappTrialLink: "https://wa.me/919019204104?text=" + encodeURIComponent("Hi! I'd like to book a free trial at Flex Fitness."),
  memberCount: "500+", // REAL — active members (discovery call)
  transformationCount: "1,500+", // REAL — total health transformations (owner's approved submission)
  sqft: "8,000 sq ft across 2 floors", // REAL
  address: "C Square, 389/390, Jayanagar Housing Society (JHCS Layout), Gubbalala Main Road, Subramanyapura Post, Bengaluru 560061", // REAL
  phone: "9964406662", // REAL — gym contact number
  phoneAlt: "9964406663", // REAL — second gym contact number
  email: "flexfitnessbynithish@gmail.com", // REAL
  instagram: "https://www.instagram.com/flexfitnessbynithish_", // REAL
  mapsLink: "https://share.google/7FgH3adUZvq2gApqK", // REAL — includes 360° view and photos/videos
  minAge: 14, // REAL
  logo: {
    wordmark: "/brand/logo-wordmark.jpg", // crest + "FLEX FITNESS" + tagline, black bg
    markGoldOnBlack: "/brand/logo-mark-gold-on-black.jpg",
    markBlackOnWhite: "/brand/logo-mark-black-on-white.jpg",
    markSquare: "/brand/logo-mark-square.jpg",
  },
};

export const HOURS = [
  { day: "Monday", time: "5:30 AM – 10:00 PM" },
  { day: "Tuesday", time: "5:30 AM – 10:00 PM" },
  { day: "Wednesday", time: "5:30 AM – 10:00 PM" },
  { day: "Thursday", time: "5:30 AM – 10:00 PM" },
  { day: "Friday", time: "5:30 AM – 10:00 PM" },
  { day: "Saturday", time: "5:30 AM – 10:00 PM" },
  { day: "Sunday", time: "8:00 AM – 1:00 PM" },
]; // REAL
export const HOLIDAY_POLICY = "Closed on national holidays and major Hindu festivals."; // REAL

export const SERVICES: { name: string; description: string; icon: IconName; photo: string }[] = [
  {
    name: "General Gym",
    description:
      "Full-floor strength and cardio equipment across 4,000 sq ft, open every session for members training on their own schedule.",
    icon: "dumbbell",
    photo: "/gallery/general-gym.jpg",
  },
  {
    name: "Personal Training",
    description:
      "One-on-one coaching built around your goals, available all day. Female trainers available on request.",
    icon: "user",
    photo: "/gallery/personal-training.jpg",
  },
  {
    name: "Group Classes",
    description:
      "Yoga, Zumba, and Pilates in a dedicated 4,000 sq ft studio — no booking needed, just show up.",
    icon: "users",
    photo: "/gallery/group-classes.jpg",
  },
  {
    name: "Functional Training & CrossFit",
    description:
      "HIIT and functional training in our dedicated rig area, for members who want high-intensity, varied workouts.",
    icon: "star",
    photo: "/gallery/functional-crossfit.jpg",
  },
  {
    name: "Sports Injury Rehab",
    photo: "/gallery/sports-rehab.jpg",
    description:
      "Recovery-focused training for athletes and anyone coming back from injury, with health history reviewed before you start.",
    icon: "heart",
  },
]; // REAL — from the owner's approved submission (swapped Kids Fitness Academy for Functional Training/CrossFit since minimum age is 14)

export const GOOGLE_RATING = { score: 4.9, count: 144 };

// Real reviews from the gym's Google Business listing.
export const TESTIMONIALS = [
  {
    quote:
      "I lost 10 kg with the help of our personal trainer Girish Sir. Am very happy — this is the best gym, everybody must visit this gym. Thanks to Flex Fitness by Nithish and my personal trainer.",
    name: "Amulya Halady",
    role: "Google review",
  },
  {
    quote:
      "The gym is well equipped and the trainers are always happy to help people seeking guidance. They also offer diverse classes like Zumba, yoga, Pilates etc. I would highly recommend the gym.",
    name: "Tanuja Malatesha",
    role: "Google review",
  },
  {
    quote:
      "Basava trainer is very dedicated and ensures we show up every day. Very motivating. I feel considerably fit since joining here.",
    name: "Pratika Puranik",
    role: "Google review",
  },
  {
    quote:
      "Regular gym with huge space and new equipment added day by day as every trainers are friendly.",
    name: "Ashwath S.",
    role: "Google review",
  },
  {
    quote:
      "Just joined this gym and I'm already hooked! Love the energy in the group classes and the trainers are super supportive. Pushing me to be my best self. Highly recommend!",
    name: "Anu Shree Deekshith",
    role: "Google review",
  },
  {
    quote:
      "Thank you to the amazing team at Flex Fitness for helping me on my journey to transform my body and mind. Your expert guidance, support, and motivation have been invaluable. I'm grateful for the state-of-the-art facilities and inspiring atmosphere.",
    name: "Shridhar BR",
    role: "Google review",
  },
  {
    quote:
      "I have been doing my rehab with Nithish since a few months post my knee surgery. I feel far more confident than before and can see the difference. Both him and Shashi train well. Highly recommend.",
    name: "Devipriya V.",
    role: "Google review",
  },
  {
    quote:
      "Going to this gym from 3 months, great experience. All the equipments are well maintained. Interactive trainers and Nitesh is very helpful and awesome trainer. I enjoy all group classes a lot, especially Zumba and CrossFit.",
    name: "Harini Prasannakumar",
    role: "Google review",
  },
  {
    quote:
      "I've been training at this gym for more than six months, and it's been an incredible experience. The facilities are top-notch, and the environment is motivating. Special shoutout to Nitish and Santosh sir, who are phenomenal trainers.",
    name: "Mahavir Shantilal Dhoka",
    role: "Google review",
  },
  {
    quote:
      "The gym has a positive atmosphere. Trainers are professional and are very helpful with weights and machines. Also the gym is well maintained and people are respectful around. Highly recommended.",
    name: "Roopali Vyas",
    role: "Google review",
  },
  {
    quote:
      "Gym is amazing. It has all the equipment, neat and clean. Nitish is very humble and friendly. Gives equal attention to each person in gym and trains them based on their fitness level. Best in the locality.",
    name: "Prerana Ojha",
    role: "Google review",
  },
  {
    quote:
      "The trainers are not only knowledgeable but also highly considerate and helpful towards clients, including Nitish. The space itself is fantastic, equipped with advanced equipment, making everything an overall excellent experience.",
    name: "Rajesh Yadav",
    role: "Google review",
  },
];

export const FACILITIES = [
  "8,000 sq ft across 2 floors — 4,000 sq ft workout floor, 4,000 sq ft group class studio",
  "Free parking on-site",
  "Lockers, showers & changing rooms",
  "Female trainers available for personal training",
  "CCTV-monitored facility",
  "Mobile app for tracking your workouts and diet",
]; // REAL — from the owner's approved submission

export const MEMBERSHIP_PLANS = [
  { name: "Monthly", price: "₹2,500", note: "+ 5% GST" },
  { name: "3 Months", price: "₹7,000", note: null },
  { name: "6 Months", price: "₹10,000", note: null },
  { name: "Yearly", price: "₹12,999", note: null },
];
export const REGISTRATION_FEE = "₹500"; // one-time, lifetime membership registration
export const FREE_TRIAL = "A free 1-day trial is available (minimum age 14)."; // REAL
