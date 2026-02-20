import { drizzle } from "drizzle-orm/mysql2";
import { graduateAttributes, competencies } from "../drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const gaData = [
  { code: "GA1", nameEn: "Competent", nameAr: "الكفاءة", sortOrder: 1 },
  { code: "GA2", nameEn: "Life-long Learner", nameAr: "المتعلم مدى الحياة", sortOrder: 2 },
  { code: "GA3", nameEn: "Well Rounded", nameAr: "المتكامل", sortOrder: 3 },
  { code: "GA4", nameEn: "Ethically & Socially Responsible", nameAr: "المسؤول أخلاقياً واجتماعياً", sortOrder: 4 },
  { code: "GA5", nameEn: "Entrepreneurial", nameAr: "الريادي", sortOrder: 5 },
];

const competencyData = [
  // GA1: Competent
  { gaCode: "GA1", code: "C1-1", nameEn: "Subject-matter mastery", nameAr: "التمكن من الموضوع", sortOrder: 1 },
  { gaCode: "GA1", code: "C1-2", nameEn: "Critical-thinking skills", nameAr: "مهارات التفكير النقدي", sortOrder: 2 },
  { gaCode: "GA1", code: "C1-3", nameEn: "Problem-solving skills", nameAr: "مهارات حل المشكلات", sortOrder: 3 },
  { gaCode: "GA1", code: "C1-4", nameEn: "Research, and Novel and Adaptive Thinking", nameAr: "البحث والتفكير الجديد والتكيفي", sortOrder: 4 },
  
  // GA2: Life-long Learner
  { gaCode: "GA2", code: "C2-1", nameEn: "Self-awareness", nameAr: "الوعي الذاتي", sortOrder: 1 },
  { gaCode: "GA2", code: "C2-2", nameEn: "Adaptability", nameAr: "القدرة على التكيف", sortOrder: 2 },
  { gaCode: "GA2", code: "C2-3", nameEn: "Adaptive Thinking", nameAr: "التفكير التكيفي", sortOrder: 3 },
  { gaCode: "GA2", code: "C2-4", nameEn: "Desire for life-long learning", nameAr: "الرغبة في التعلم مدى الحياة", sortOrder: 4 },
  
  // GA3: Well Rounded
  { gaCode: "GA3", code: "C3-1", nameEn: "Cultured", nameAr: "المثقف", sortOrder: 1 },
  { gaCode: "GA3", code: "C3-2", nameEn: "Effective communication skills", nameAr: "مهارات التواصل الفعال", sortOrder: 2 },
  { gaCode: "GA3", code: "C3-3", nameEn: "Awareness of local and international issues", nameAr: "الوعي بالقضايا المحلية والدولية", sortOrder: 3 },
  
  // GA4: Ethically & Socially Responsible
  { gaCode: "GA4", code: "C4-1", nameEn: "Embody the Arabic-Islamic identity", nameAr: "تجسيد الهوية العربية الإسلامية", sortOrder: 1 },
  { gaCode: "GA4", code: "C4-2", nameEn: "Embrace diversity", nameAr: "احتضان التنوع", sortOrder: 2 },
  { gaCode: "GA4", code: "C4-3", nameEn: "Professional and ethical conduct", nameAr: "السلوك المهني والأخلاقي", sortOrder: 3 },
  { gaCode: "GA4", code: "C4-4", nameEn: "Civically engaged", nameAr: "المشاركة المدنية", sortOrder: 4 },
  { gaCode: "GA4", code: "C4-5", nameEn: "Community and Global Engagement", nameAr: "المشاركة المجتمعية والعالمية", sortOrder: 5 },
  
  // GA5: Entrepreneurial
  { gaCode: "GA5", code: "C5-1", nameEn: "Creativity and innovation", nameAr: "الإبداع والابتكار", sortOrder: 1 },
  { gaCode: "GA5", code: "C5-2", nameEn: "Collaborative", nameAr: "التعاون", sortOrder: 2 },
  { gaCode: "GA5", code: "C5-3", nameEn: "Management", nameAr: "الإدارة", sortOrder: 3 },
  { gaCode: "GA5", code: "C5-4", nameEn: "Interpersonal", nameAr: "المهارات الشخصية", sortOrder: 4 },
  { gaCode: "GA5", code: "C5-5", nameEn: "Leadership", nameAr: "القيادة", sortOrder: 5 },
];

async function seed() {
  console.log("Seeding Graduate Attributes and Competencies...");
  
  try {
    // Insert Graduate Attributes
    console.log("Inserting Graduate Attributes...");
    await db.insert(graduateAttributes).values(gaData);
    console.log("✓ Graduate Attributes inserted");
    
    // Fetch inserted GAs to get their IDs
    const insertedGAs = await db.select().from(graduateAttributes);
    const gaMap = new Map(insertedGAs.map(ga => [ga.code, ga.id]));
    
    // Insert Competencies with correct gaId
    console.log("Inserting Competencies...");
    const competenciesToInsert = competencyData.map(comp => ({
      gaId: gaMap.get(comp.gaCode),
      code: comp.code,
      nameEn: comp.nameEn,
      nameAr: comp.nameAr,
      sortOrder: comp.sortOrder,
    }));
    
    await db.insert(competencies).values(competenciesToInsert);
    console.log("✓ Competencies inserted");
    
    console.log("\n✓ Seeding completed successfully!");
    console.log(`  - ${gaData.length} Graduate Attributes`);
    console.log(`  - ${competencyData.length} Competencies`);
    
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();
