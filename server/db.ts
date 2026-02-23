import { eq, and, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  colleges,
  departments,
  programs,
  graduateAttributes,
  competencies,
  plos,
  mappings,
  justifications,
  auditLog,
  reportTemplates,
  type College,
  type Department,
  type Program,
  type GraduateAttribute,
  type Competency,
  type PLO,
  type Mapping,
  type Justification,
  type ReportTemplate,
  type InsertCollege,
  type InsertDepartment,
  type InsertProgram,
  type InsertPLO,
  type InsertMapping,
  type InsertJustification,
  type InsertAuditLog,
  type InsertReportTemplate,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// User Management
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Organizational Structure
// ============================================================================

export async function getAllColleges() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(colleges).orderBy(colleges.nameEn);
}

export async function getCollegeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(colleges).where(eq(colleges.id, id)).limit(1);
  return result[0];
}

export async function createCollege(data: InsertCollege) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(colleges).values(data);
  return Number(result[0].insertId);
}

export async function getDepartmentsByCollege(collegeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(departments).where(eq(departments.collegeId, collegeId)).orderBy(departments.nameEn);
}

export async function getDepartmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
  return result[0];
}

export async function createDepartment(data: InsertDepartment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(departments).values(data);
  return Number(result[0].insertId);
}

export async function getProgramsByDepartment(departmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(programs).where(eq(programs.departmentId, departmentId)).orderBy(programs.nameEn);
}

export async function getProgramById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(programs).where(eq(programs.id, id)).limit(1);
  return result[0];
}

export async function createProgram(data: InsertProgram) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(programs).values(data);
  return Number(result[0].insertId);
}

export async function getAllPrograms() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      program: programs,
      department: departments,
      college: colleges,
    })
    .from(programs)
    .innerJoin(departments, eq(programs.departmentId, departments.id))
    .innerJoin(colleges, eq(departments.collegeId, colleges.id))
    .orderBy(colleges.nameEn, departments.nameEn, programs.nameEn);
}

// ============================================================================
// Graduate Attributes & Competencies
// ============================================================================

export async function getAllGraduateAttributes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(graduateAttributes).orderBy(graduateAttributes.sortOrder);
}

export async function getAllCompetencies() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(competencies).orderBy(competencies.sortOrder);
}

export async function getCompetenciesByGA(gaId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(competencies).where(eq(competencies.gaId, gaId)).orderBy(competencies.sortOrder);
}

// ============================================================================
// PLOs
// ============================================================================

export async function getPLOsByProgram(programId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(plos).where(eq(plos.programId, programId)).orderBy(plos.sortOrder);
}

export async function createPLO(data: InsertPLO) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(plos).values(data);
  return Number(result[0].insertId);
}

export async function updatePLO(id: number, data: Partial<InsertPLO>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(plos).set(data).where(eq(plos.id, id));
}

export async function deletePLO(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(plos).where(eq(plos.id, id));
}

export async function upsertPLO(data: InsertPLO) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Try to find existing PLO by programId and code
  const existing = await db
    .select()
    .from(plos)
    .where(and(eq(plos.programId, data.programId), eq(plos.code, data.code)))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing PLO
    await db.update(plos).set(data).where(eq(plos.id, existing[0].id));
    return existing[0].id;
  } else {
    // Create new PLO
    const result = await db.insert(plos).values(data);
    return Number(result[0].insertId);
  }
}

export async function deletePLOsByProgram(programId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // This will cascade delete all mappings and justifications
  await db.delete(plos).where(eq(plos.programId, programId));
}

// ============================================================================
// Mappings
// ============================================================================

export async function getMappingsByProgram(programId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all PLOs for the program
  const programPLOs = await getPLOsByProgram(programId);
  const ploIds = programPLOs.map(p => p.id);
  
  if (ploIds.length === 0) return [];
  
  return await db
    .select({
      mapping: mappings,
      plo: plos,
      competency: competencies,
    })
    .from(mappings)
    .innerJoin(plos, eq(mappings.ploId, plos.id))
    .innerJoin(competencies, eq(mappings.competencyId, competencies.id))
    .where(inArray(mappings.ploId, ploIds));
}

export async function createMapping(data: InsertMapping) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(mappings).values(data);
  return Number(result[0].insertId);
}

export async function updateMapping(id: number, weight: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(mappings).set({ weight }).where(eq(mappings.id, id));
}

export async function deleteMapping(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(mappings).where(eq(mappings.id, id));
}

export async function upsertMapping(ploId: number, competencyId: number, weight: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .insert(mappings)
    .values({ ploId, competencyId, weight })
    .onDuplicateKeyUpdate({
      set: { weight, updatedAt: new Date() },
    });
}

// ============================================================================
// Justifications
// ============================================================================

export async function getJustificationsByProgram(programId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      justification: justifications,
      ga: graduateAttributes,
      competency: competencies,
    })
    .from(justifications)
    .innerJoin(graduateAttributes, eq(justifications.gaId, graduateAttributes.id))
    .innerJoin(competencies, eq(justifications.competencyId, competencies.id))
    .where(eq(justifications.programId, programId))
    .orderBy(graduateAttributes.code, competencies.code);
}

export async function upsertJustification(data: InsertJustification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .insert(justifications)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        textEn: data.textEn,
        textAr: data.textAr,
        updatedAt: new Date(),
      },
    });
}

// ============================================================================
// Audit Log
// ============================================================================

export async function logAudit(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(auditLog).values(data);
  } catch (error) {
    console.error("[Audit Log] Failed to log action:", error);
  }
}

// ============================================================================
// Analytics
// ============================================================================

export async function getUniversityAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all colleges with their analytics
  const allColleges = await db.select().from(colleges);
  
  const collegeAnalytics = await Promise.all(
    allColleges.map(async (college) => {
      const analytics = await getCollegeAnalytics(college.id);
      return {
        collegeId: college.id,
        collegeName: college.nameEn,
        collegeCode: college.code,
        ...analytics,
      };
    })
  );

  // Calculate university-wide metrics
  const totalPrograms = collegeAnalytics.reduce((sum, c) => sum + c.totalPrograms, 0);
  const totalPLOs = collegeAnalytics.reduce((sum, c) => sum + c.totalPLOs, 0);
  const avgAlignment = collegeAnalytics.length > 0
    ? collegeAnalytics.reduce((sum, c) => sum + c.averageAlignment, 0) / collegeAnalytics.length
    : 0;

  return {
    totalColleges: allColleges.length,
    totalPrograms,
    totalPLOs,
    averageAlignment: Math.round(avgAlignment * 100) / 100,
    colleges: collegeAnalytics,
  };
}

export async function getCollegeAnalytics(collegeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get college info
  const college = await db
    .select()
    .from(colleges)
    .where(eq(colleges.id, collegeId))
    .limit(1);

  if (college.length === 0) {
    throw new Error("College not found");
  }

  // Get all departments in this college
  const depts = await db
    .select()
    .from(departments)
    .where(eq(departments.collegeId, collegeId));

  const departmentAnalytics = await Promise.all(
    depts.map(async (dept) => {
      const analytics = await getDepartmentAnalytics(dept.id);
      return {
        departmentId: dept.id,
        departmentName: dept.nameEn,
        departmentCode: dept.code,
        ...analytics,
      };
    })
  );

  const totalPrograms = departmentAnalytics.reduce((sum, d) => sum + d.totalPrograms, 0);
  const totalPLOs = departmentAnalytics.reduce((sum, d) => sum + d.totalPLOs, 0);
  const avgAlignment = departmentAnalytics.length > 0
    ? departmentAnalytics.reduce((sum, d) => sum + d.averageAlignment, 0) / departmentAnalytics.length
    : 0;

  // Calculate GA breakdown across all programs in this college
  const allGAs = await db.select().from(graduateAttributes).orderBy(graduateAttributes.sortOrder);
  const gaBreakdown = await Promise.all(
    allGAs.map(async (ga) => {
      const gaCompetencies = await db
        .select({ id: competencies.id })
        .from(competencies)
        .where(eq(competencies.gaId, ga.id));
      
      const competencyIds = gaCompetencies.map(c => c.id);
      
      // Get all programs in this college
      const collegeProgramIds = departmentAnalytics.flatMap(d => d.programs.map(p => p.programId));
      
      let totalScore = 0;
      let programCount = 0;
      
      for (const programId of collegeProgramIds) {
        const programPLOs = await db
          .select()
          .from(plos)
          .where(eq(plos.programId, programId));
        
        const programMappings = await db
          .select({
            weight: mappings.weight,
            competencyId: mappings.competencyId,
          })
          .from(mappings)
          .innerJoin(plos, eq(mappings.ploId, plos.id))
          .where(eq(plos.programId, programId));
        
        const gaMappings = programMappings.filter(m => competencyIds.includes(m.competencyId));
        const totalWeight = gaMappings.reduce((sum, m) => sum + parseFloat(m.weight), 0);
        const maxPossibleWeight = programPLOs.length * competencyIds.length;
        const score = maxPossibleWeight > 0 ? (totalWeight / maxPossibleWeight) * 100 : 0;
        
        totalScore += score;
        programCount++;
      }
      
      return {
        gaId: ga.id,
        gaCode: ga.code,
        gaName: ga.nameEn,
        averageScore: programCount > 0 ? Math.round((totalScore / programCount) * 100) / 100 : 0,
      };
    })
  );

  return {
    totalDepartments: depts.length,
    totalPrograms,
    totalPLOs,
    averageAlignment: Math.round(avgAlignment * 100) / 100,
    departments: departmentAnalytics,
    gaBreakdown,
  };
}

export async function getDepartmentAnalytics(departmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all programs in this department
  const progs = await db
    .select()
    .from(programs)
    .where(eq(programs.departmentId, departmentId));

  const programAnalytics = await Promise.all(
    progs.map(async (prog) => {
      const analytics = await getProgramAnalytics(prog.id);
      return {
        programId: prog.id,
        programName: prog.nameEn,
        programCode: prog.code,
        ...analytics,
      };
    })
  );

  const totalPLOs = programAnalytics.reduce((sum, p) => sum + p.totalPLOs, 0);
  const avgAlignment = programAnalytics.length > 0
    ? programAnalytics.reduce((sum, p) => sum + p.alignmentScore, 0) / programAnalytics.length
    : 0;

  return {
    totalPrograms: progs.length,
    totalPLOs,
    averageAlignment: Math.round(avgAlignment * 100) / 100,
    programs: programAnalytics,
  };
}

export async function getProgramAnalytics(programId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get PLOs for this program
  const programPLOs = await db
    .select()
    .from(plos)
    .where(eq(plos.programId, programId));

  // Get all mappings for this program
  const programMappings = await db
    .select({
      weight: mappings.weight,
      competencyId: mappings.competencyId,
    })
    .from(mappings)
    .innerJoin(plos, eq(mappings.ploId, plos.id))
    .where(eq(plos.programId, programId));

  // Get all competencies with their GA assignments
  const allCompetencies = await db
    .select({
      id: competencies.id,
      code: competencies.code,
      gaId: competencies.gaId,
    })
    .from(competencies);

  // Get all GAs
  const allGAs = await db.select().from(graduateAttributes);

  // Calculate alignment score for each GA
  const gaScores = allGAs.map((ga) => {
    const gaCompetencies = allCompetencies.filter((c) => c.gaId === ga.id);
    const gaCompetencyIds = gaCompetencies.map((c) => c.id);

    // Sum of weights for this GA's competencies
    const totalWeight = programMappings
      .filter((m) => gaCompetencyIds.includes(m.competencyId))
      .reduce((sum, m) => sum + parseFloat(m.weight), 0);

    // Max possible weight = number of competencies × number of PLOs
    const maxWeight = gaCompetencies.length * programPLOs.length;

    // Score as percentage
    const score = maxWeight > 0 ? (totalWeight / maxWeight) * 100 : 0;

    return {
      gaId: ga.id,
      gaCode: ga.code,
      gaName: ga.nameEn,
      score: Math.round(score * 100) / 100,
      totalWeight,
      maxWeight,
    };
  });

  // Overall alignment score = average of all GA scores
  const alignmentScore = gaScores.length > 0
    ? gaScores.reduce((sum, ga) => sum + ga.score, 0) / gaScores.length
    : 0;

  // Coverage rate = percentage of competencies with at least one mapping > 0
  const competenciesWithMappings = new Set(
    programMappings.filter((m) => parseFloat(m.weight) > 0).map((m) => m.competencyId)
  );
  const coverageRate = allCompetencies.length > 0
    ? (competenciesWithMappings.size / allCompetencies.length) * 100
    : 0;

  return {
    totalPLOs: programPLOs.length,
    totalMappings: programMappings.length,
    alignmentScore: Math.round(alignmentScore * 100) / 100,
    coverageRate: Math.round(coverageRate * 100) / 100,
    gaScores,
  };
}

// ============================================================================
// Report Templates
// ============================================================================

export async function createReportTemplate(data: InsertReportTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(reportTemplates).values(data);
  return result;
}

export async function getReportTemplatesByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select()
    .from(reportTemplates)
    .where(eq(reportTemplates.userId, userId))
    .orderBy(sql`${reportTemplates.updatedAt} DESC`);
}

export async function getPublicReportTemplates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select()
    .from(reportTemplates)
    .where(eq(reportTemplates.isPublic, 1))
    .orderBy(sql`${reportTemplates.updatedAt} DESC`);
}

export async function getReportTemplateById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [template] = await db
    .select()
    .from(reportTemplates)
    .where(eq(reportTemplates.id, id));
  
  return template;
}

export async function updateReportTemplate(id: number, data: Partial<InsertReportTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(reportTemplates)
    .set(data)
    .where(eq(reportTemplates.id, id));
}

export async function deleteReportTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(reportTemplates)
    .where(eq(reportTemplates.id, id));
}

// ============================================================================
// Graduate Attribute Analytics
// ============================================================================

/**
 * Get GA coverage statistics across all programs
 * Returns data for: which GAs are most/least covered, average alignment scores per GA
 */
export async function getGAAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all GAs
  const allGAs = await db.select().from(graduateAttributes).orderBy(graduateAttributes.code);
  
  // Get all programs
  const allPrograms = await db.select().from(programs);
  
  // Get all competencies
  const allCompetencies = await db.select().from(competencies);
  
  // Get all mappings
  const allMappings = await db.select().from(mappings);
  
  // Get all PLOs
  const allPLOs = await db.select().from(plos);

  const gaStats = allGAs.map((ga) => {
    // Get competencies for this GA
    const gaCompetencies = allCompetencies.filter((c) => c.gaId === ga.id);
    const gaCompetencyIds = gaCompetencies.map((c) => c.id);

    // Count programs that have mappings to this GA's competencies
    const programsWithGA = new Set<number>();
    let totalWeight = 0;
    let totalMappings = 0;

    // Calculate alignment score for each competency, then average them
    const competencyScores: number[] = [];
    
    gaCompetencies.forEach((competency) => {
      // Get all mappings for this competency across all programs
      const competencyMappings = allMappings.filter((m) => m.competencyId === competency.id);
      
      // Only count non-zero weight mappings (matching competency analytics behavior)
      const nonZeroMappings = competencyMappings.filter((m) => parseFloat(m.weight) > 0);
      
      if (nonZeroMappings.length > 0) {
        const competencyWeight = nonZeroMappings.reduce((sum, m) => sum + parseFloat(m.weight), 0);
        const competencyAvg = (competencyWeight / nonZeroMappings.length) * 100;
        competencyScores.push(competencyAvg);
        
        // Track total weight and mappings for display
        totalWeight += competencyWeight;
        totalMappings += nonZeroMappings.length;
      }
    });

    // Track which programs have mappings to this GA
    allPrograms.forEach((program) => {
      const programPLOs = allPLOs.filter((p) => p.programId === program.id);
      const programMappings = allMappings.filter(
        (m) => programPLOs.some((plo) => plo.id === m.ploId) && gaCompetencyIds.includes(m.competencyId)
      );

      if (programMappings.length > 0 && programMappings.some((m) => parseFloat(m.weight) > 0)) {
        programsWithGA.add(program.id);
      }
    });

    // Calculate GA alignment score as average of competency scores
    const avgScore = competencyScores.length > 0 
      ? competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length
      : 0;

    // Calculate coverage rate (% of programs that map to this GA)
    const coverageRate = allPrograms.length > 0 ? (programsWithGA.size / allPrograms.length) * 100 : 0;

    return {
      gaId: ga.id,
      gaCode: ga.code,
      gaNameEn: ga.nameEn,
      gaNameAr: ga.nameAr,
      programCount: programsWithGA.size,
      totalPrograms: allPrograms.length,
      coverageRate: Math.round(coverageRate * 100) / 100,
      avgAlignmentScore: Math.round(avgScore * 100) / 100,
      totalWeight: Math.round(totalWeight * 100) / 100,
      competencyCount: gaCompetencies.length,
    };
  });

  return {
    gaStats,
    totalGAs: allGAs.length,
    totalPrograms: allPrograms.length,
  };
}

/**
 * Get GA coverage by college (heatmap data)
 * Returns: which colleges emphasize which GAs
 */
export async function getGAByCollegeAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allGAs = await db.select().from(graduateAttributes).orderBy(graduateAttributes.code);
  const allColleges = await db.select().from(colleges).orderBy(colleges.code);
  const allDepartments = await db.select().from(departments);
  const allPrograms = await db.select().from(programs);
  const allCompetencies = await db.select().from(competencies);
  const allPLOs = await db.select().from(plos);
  const allMappings = await db.select().from(mappings);

  const heatmapData = allColleges.map((college) => {
    // Get all programs in this college
    const collegeDepartments = allDepartments.filter((d) => d.collegeId === college.id);
    const collegeDepartmentIds = collegeDepartments.map((d) => d.id);
    const collegePrograms = allPrograms.filter((p) => collegeDepartmentIds.includes(p.departmentId));
    const collegeProgramIds = collegePrograms.map((p) => p.id);

    const gaScores = allGAs.map((ga) => {
      const gaCompetencies = allCompetencies.filter((c) => c.gaId === ga.id);
      const gaCompetencyIds = gaCompetencies.map((c) => c.id);

      let totalWeight = 0;
      let totalPossibleWeight = 0;

      collegePrograms.forEach((program) => {
        const programPLOs = allPLOs.filter((p) => p.programId === program.id);
        const programMappings = allMappings.filter(
          (m) => programPLOs.some((plo) => plo.id === m.ploId) && gaCompetencyIds.includes(m.competencyId)
        );

        totalWeight += programMappings.reduce((sum, m) => sum + parseFloat(m.weight), 0);
        totalPossibleWeight += gaCompetencies.length * programPLOs.length;
      });

      const score = totalPossibleWeight > 0 ? (totalWeight / totalPossibleWeight) * 100 : 0;

      return {
        gaCode: ga.code,
        score: Math.round(score * 100) / 100,
      };
    });

    return {
      collegeId: college.id,
      collegeCode: college.code,
      collegeNameEn: college.nameEn,
      collegeNameAr: college.nameAr,
      programCount: collegePrograms.length,
      gaScores,
    };
  });

  return {
    heatmapData,
    gaList: allGAs.map((ga) => ({ code: ga.code, nameEn: ga.nameEn, nameAr: ga.nameAr })),
    collegeList: allColleges.map((c) => ({ code: c.code, nameEn: c.nameEn, nameAr: c.nameAr })),
  };
}

// ============================================================================
// Competency Analytics
// ============================================================================

/**
 * Get competency usage statistics across all programs
 * Returns: which competencies are most/least mapped, average weights, coverage rates
 */
export async function getCompetencyAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allCompetencies = await db.select().from(competencies).orderBy(competencies.code);
  const allPrograms = await db.select().from(programs);
  const allPLOs = await db.select().from(plos);
  const allMappings = await db.select().from(mappings);
  const allJustifications = await db.select().from(justifications);

  const competencyStats = allCompetencies.map((competency) => {
    // Count programs that have mappings to this competency
    const programsWithCompetency = new Set<number>();
    let totalWeight = 0;
    let mappingCount = 0;
    let justificationCount = 0;

    allPrograms.forEach((program) => {
      const programPLOs = allPLOs.filter((p) => p.programId === program.id);
      const programMappings = allMappings.filter(
        (m) => programPLOs.some((plo) => plo.id === m.ploId) && m.competencyId === competency.id
      );

      if (programMappings.length > 0 && programMappings.some((m) => parseFloat(m.weight) > 0)) {
        programsWithCompetency.add(program.id);
      }

      programMappings.forEach((m) => {
        const weight = parseFloat(m.weight);
        if (weight > 0) {
          totalWeight += weight;
          mappingCount++;
        }
      });

      // Count justifications for this competency in this program
      const programJustifications = allJustifications.filter(
        (j) => j.programId === program.id && j.competencyId === competency.id
      );
      justificationCount += programJustifications.length;
    });

    // Calculate average weight (only for non-zero mappings)
    const avgWeight = mappingCount > 0 ? totalWeight / mappingCount : 0;

    // Calculate coverage rate (% of programs that map to this competency)
    const coverageRate = allPrograms.length > 0 ? (programsWithCompetency.size / allPrograms.length) * 100 : 0;

    // Justification completeness (% of programs with justifications)
    const justificationRate = allPrograms.length > 0 ? (justificationCount / allPrograms.length) * 100 : 0;

    return {
      competencyId: competency.id,
      competencyCode: competency.code,
      competencyNameEn: competency.nameEn,
      competencyNameAr: competency.nameAr,
      gaId: competency.gaId,
      programCount: programsWithCompetency.size,
      totalPrograms: allPrograms.length,
      coverageRate: Math.round(coverageRate * 100) / 100,
      avgWeight: Math.round(avgWeight * 100) / 100,
      totalWeight: Math.round(totalWeight * 100) / 100,
      mappingCount,
      justificationCount,
      justificationRate: Math.round(justificationRate * 100) / 100,
    };
  });

  return {
    competencyStats,
    totalCompetencies: allCompetencies.length,
    totalPrograms: allPrograms.length,
  };
}

/**
 * Get competency distribution by department (heatmap data)
 */
export async function getCompetencyByDepartmentAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allCompetencies = await db.select().from(competencies).orderBy(competencies.code);
  const allDepartments = await db.select().from(departments).orderBy(departments.code);
  const allPrograms = await db.select().from(programs);
  const allPLOs = await db.select().from(plos);
  const allMappings = await db.select().from(mappings);

  const heatmapData = allDepartments.map((department) => {
    const departmentPrograms = allPrograms.filter((p) => p.departmentId === department.id);

    const competencyScores = allCompetencies.map((competency) => {
      let totalWeight = 0;
      let mappingCount = 0;

      departmentPrograms.forEach((program) => {
        const programPLOs = allPLOs.filter((p) => p.programId === program.id);
        const programMappings = allMappings.filter(
          (m) => programPLOs.some((plo) => plo.id === m.ploId) && m.competencyId === competency.id
        );

        programMappings.forEach((m) => {
          const weight = parseFloat(m.weight);
          if (weight > 0) {
            totalWeight += weight;
            mappingCount++;
          }
        });
      });

      const avgWeight = mappingCount > 0 ? totalWeight / mappingCount : 0;

      return {
        competencyCode: competency.code,
        avgWeight: Math.round(avgWeight * 100) / 100,
        mappingCount,
      };
    });

    return {
      departmentId: department.id,
      departmentCode: department.code,
      departmentNameEn: department.nameEn,
      departmentNameAr: department.nameAr,
      programCount: departmentPrograms.length,
      competencyScores,
    };
  });

  return {
    heatmapData,
    competencyList: allCompetencies.map((c) => ({ code: c.code, nameEn: c.nameEn, nameAr: c.nameAr })),
    departmentList: allDepartments.map((d) => ({ code: d.code, nameEn: d.nameEn, nameAr: d.nameAr })),
  };
}

/**
 * Get GA analytics with optional filters (college or program)
 * @param filters - Optional filters: { collegeId?: number, programId?: number }
 */
export async function getFilteredGAAnalytics(filters?: { collegeId?: number; programId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all GAs
  const allGAs = await db.select().from(graduateAttributes).orderBy(graduateAttributes.code);
  
  // Get filtered programs
  let filteredPrograms = await db.select().from(programs);
  
  if (filters?.programId) {
    // Filter by specific program
    filteredPrograms = filteredPrograms.filter((p) => p.id === filters.programId);
  } else if (filters?.collegeId) {
    // Filter by college (get departments first, then programs)
    const collegeDepartments = await db.select().from(departments).where(eq(departments.collegeId, filters.collegeId));
    const deptIds = collegeDepartments.map((d) => d.id);
    filteredPrograms = filteredPrograms.filter((p) => deptIds.includes(p.departmentId));
  }
  
  // Get all competencies
  const allCompetencies = await db.select().from(competencies);
  
  // Get all mappings
  const allMappings = await db.select().from(mappings);
  
  // Get all PLOs
  const allPLOs = await db.select().from(plos);

  const gaStats = allGAs.map((ga) => {
    // Get competencies for this GA
    const gaCompetencies = allCompetencies.filter((c) => c.gaId === ga.id);
    const gaCompetencyIds = gaCompetencies.map((c) => c.id);

    // Count programs that have mappings to this GA's competencies
    const programsWithGA = new Set<number>();
    let totalWeight = 0;
    let totalMappings = 0;

    // Calculate alignment score for each competency, then average them
    const competencyScores: number[] = [];
    
    // Get PLO IDs from filtered programs only
    const filteredProgramIds = filteredPrograms.map(p => p.id);
    const filteredPLOs = allPLOs.filter(plo => filteredProgramIds.includes(plo.programId));
    const filteredPLOIds = filteredPLOs.map(plo => plo.id);
    
    gaCompetencies.forEach((competency) => {
      // Get mappings for this competency from filtered programs only
      const competencyMappings = allMappings.filter(
        (m) => m.competencyId === competency.id && filteredPLOIds.includes(m.ploId)
      );
      
      // Only count non-zero weight mappings (matching competency analytics behavior)
      const nonZeroMappings = competencyMappings.filter((m) => parseFloat(m.weight) > 0);
      
      if (nonZeroMappings.length > 0) {
        const competencyWeight = nonZeroMappings.reduce((sum, m) => sum + parseFloat(m.weight), 0);
        const competencyAvg = (competencyWeight / nonZeroMappings.length) * 100;
        competencyScores.push(competencyAvg);
        
        // Track total weight and mappings for display
        totalWeight += competencyWeight;
        totalMappings += nonZeroMappings.length;
      }
    });

    // Track which programs have mappings to this GA
    filteredPrograms.forEach((program) => {
      const programPLOs = allPLOs.filter((p) => p.programId === program.id);
      const programMappings = allMappings.filter(
        (m) => programPLOs.some((plo) => plo.id === m.ploId) && gaCompetencyIds.includes(m.competencyId)
      );

      if (programMappings.length > 0 && programMappings.some((m) => parseFloat(m.weight) > 0)) {
        programsWithGA.add(program.id);
      }
    });

    // Calculate GA alignment score as average of competency scores
    const avgScore = competencyScores.length > 0 
      ? competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length
      : 0;

    // Calculate coverage rate (% of programs that map to this GA)
    const coverageRate = filteredPrograms.length > 0 ? (programsWithGA.size / filteredPrograms.length) * 100 : 0;

    return {
      gaId: ga.id,
      gaCode: ga.code,
      gaNameEn: ga.nameEn,
      gaNameAr: ga.nameAr,
      programCount: programsWithGA.size,
      totalPrograms: filteredPrograms.length,
      coverageRate: Math.round(coverageRate * 100) / 100,
      avgAlignmentScore: Math.round(avgScore * 100) / 100,
      totalWeight: Math.round(totalWeight * 100) / 100,
      competencyCount: gaCompetencies.length,
    };
  });

  return {
    gaStats,
    totalGAs: allGAs.length,
    totalPrograms: filteredPrograms.length,
  };
}

/**
 * Get Competency analytics with optional filters (college or program)
 * @param filters - Optional filters: { collegeId?: number, programId?: number }
 */
export async function getFilteredCompetencyAnalytics(filters?: { collegeId?: number; programId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all competencies
  const allCompetencies = await db.select().from(competencies);
  
  // Get filtered programs
  let filteredPrograms = await db.select().from(programs);
  
  if (filters?.programId) {
    // Filter by specific program
    filteredPrograms = filteredPrograms.filter((p) => p.id === filters.programId);
  } else if (filters?.collegeId) {
    // Filter by college (get departments first, then programs)
    const collegeDepartments = await db.select().from(departments).where(eq(departments.collegeId, filters.collegeId));
    const deptIds = collegeDepartments.map((d) => d.id);
    filteredPrograms = filteredPrograms.filter((p) => deptIds.includes(p.departmentId));
  }
  
  // Get all mappings
  const allMappings = await db.select().from(mappings);
  
  // Get all PLOs
  const allPLOs = await db.select().from(plos);
  
  // Get all justifications
  const allJustifications = await db.select().from(justifications);

  const competencyStats = allCompetencies.map((comp) => {
    // Count programs that have mappings to this competency
    const programsWithComp = new Set<number>();
    let totalWeight = 0;
    let mappingCount = 0;
    let justificationCount = 0;

    filteredPrograms.forEach((program) => {
      const programPLOs = allPLOs.filter((p) => p.programId === program.id);
      const programMappings = allMappings.filter(
        (m) => programPLOs.some((plo) => plo.id === m.ploId) && m.competencyId === comp.id
      );

      if (programMappings.length > 0 && programMappings.some((m) => parseFloat(m.weight) > 0)) {
        programsWithComp.add(program.id);
      }

      // Calculate weight for this program
      programMappings.forEach((m) => {
        const weight = parseFloat(m.weight);
        if (weight > 0) {
          totalWeight += weight;
          mappingCount++;
        }
      });

      // Count justifications for this competency in this program
      const programJustifications = allJustifications.filter(
        (j) => j.programId === program.id && j.competencyId === comp.id
      );
      justificationCount += programJustifications.length;
    });

    // Calculate average weight
    const avgWeight = mappingCount > 0 ? totalWeight / mappingCount : 0;

    // Calculate coverage rate (% of programs that map to this competency)
    const coverageRate = filteredPrograms.length > 0 ? (programsWithComp.size / filteredPrograms.length) * 100 : 0;
    
    // Justification completeness (% of programs with justifications)
    const justificationRate = filteredPrograms.length > 0 ? (justificationCount / filteredPrograms.length) * 100 : 0;

    return {
      competencyId: comp.id,
      competencyCode: comp.code,
      competencyNameEn: comp.nameEn,
      competencyNameAr: comp.nameAr,
      gaId: comp.gaId,
      programCount: programsWithComp.size,
      totalPrograms: filteredPrograms.length,
      coverageRate: Math.round(coverageRate * 100) / 100,
      avgWeight: Math.round(avgWeight * 100) / 100,
      mappingCount,
      justificationCount,
      justificationRate: Math.round(justificationRate * 100) / 100,
    };
  });

  return {
    competencyStats,
    totalCompetencies: allCompetencies.length,
    totalPrograms: filteredPrograms.length,
  };
}
