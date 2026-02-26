import { eq, and, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import * as schema from "../drizzle/schema";
import {
  InsertUser,
  users,
  userAssignments,
  colleges,
  clusters,
  departments,
  programs,
  graduateattributes,
  competencies,
  plos,
  mappings,
  justifications,
  auditLog,
  reportTemplates,
  type User,
  type UserAssignment,
  type College,
  type Cluster,
  type Department,
  type Program,
  type GraduateAttribute,
  type Competency,
  type PLO,
  type Mapping,
  type Justification,
  type ReportTemplate,
  type InsertCollege,
  type InsertCluster,
  type InsertDepartment,
  type InsertProgram,
  type InsertPLO,
  type InsertMapping,
  type InsertJustification,
  type InsertUserAssignment,
  type InsertAuditLog,
  type InsertReportTemplate,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Create mysql2 pool with proper configuration
      _pool = mysql.createPool(process.env.DATABASE_URL);
      
      // Set SQL mode to avoid ANSI_QUOTES on each connection
      _pool.on('connection', (connection: any) => {
        connection.query("SET SESSION sql_mode='TRADITIONAL'");
      });
      
      // Initialize Drizzle with schema to ensure proper column name mapping
      _db = drizzle(_pool, { schema, mode: 'default' });
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

    if (user.lastsignedin !== undefined) {
      values.lastsignedin = user.lastsignedin;
      updateSet.lastsignedin = user.lastsignedin;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastsignedin) {
      values.lastsignedin = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastsignedin = new Date();
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

// ============================================================================
// Cluster Management
// ============================================================================

export async function getAllClusters() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(clusters);
}

export async function getClustersByCollege(collegeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(clusters).where(eq(clusters.collegeId, collegeId)).orderBy(clusters.nameEn);
}

export async function getClusterById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clusters).where(eq(clusters.id, id)).limit(1);
  return result[0];
}

export async function createCluster(data: InsertCluster) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clusters).values(data);
  return Number(result[0].insertId);
}

// ============================================================================
// Department Management
// ============================================================================

export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(departments).orderBy(departments.nameEn);
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

export async function updateProgram(id: number, data: Partial<InsertProgram>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(programs).set(data).where(eq(programs.id, id));
}

export async function deleteProgram(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete justifications for this program (by programId)
  await db.delete(justifications).where(eq(justifications.programId, id));
  
  // Get all PLOs for this program
  const programPLOs = await db.select().from(plos).where(eq(plos.programId, id));
  const ploIds = programPLOs.map(plo => plo.id);
  
  if (ploIds.length > 0) {
    // Delete mappings for these PLOs
    await db.delete(mappings).where(inArray(mappings.ploId, ploIds));
    
    // Delete PLOs
    await db.delete(plos).where(eq(plos.programId, id));
  }
  
  // Finally, delete the program
  await db.delete(programs).where(eq(programs.id, id));
}

export async function getAllPrograms() {
  const db = await getDb();
  if (!db) return [];
  
  const allPrograms = await db
    .select({
      program: programs,
      department: departments,
      college: colleges,
    })
    .from(programs)
    .innerJoin(departments, eq(programs.departmentId, departments.id))
    .innerJoin(colleges, eq(departments.collegeId, colleges.id))
    .orderBy(colleges.nameEn, departments.nameEn, programs.nameEn);
  
  // Add PLO and mapping counts for each program
  const programsWithCounts = await Promise.all(
    allPrograms.map(async (item) => {
      const programPLOs = await db
        .select({ id: plos.id })
        .from(plos)
        .where(eq(plos.programId, item.program.id));
      
      const ploIds = programPLOs.map(p => p.id);
      
      let mappingCount = 0;
      if (ploIds.length > 0) {
        const programMappings = await db
          .select({ id: mappings.id })
          .from(mappings)
          .where(inArray(mappings.ploId, ploIds));
        mappingCount = programMappings.length;
      }
      
      return {
        ...item,
        ploCount: programPLOs.length,
        mappingCount,
      };
    })
  );
  
  return programsWithCounts;
}

// ============================================================================
// Graduate Attributes & Competencies
// ============================================================================

export async function getAllGraduateAttributes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(graduateattributes).orderBy(graduateattributes.sortOrder);
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
// ===============================================

export async function getMappingsByProgram(programId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const programPlos = await db.select({ id: plos.id }).from(plos).where(eq(plos.programId, programId));
  const ploIds = programPlos.map((p) => p.id);
  if (ploIds.length === 0) return [];
  const results = await db
    .select({
      mapping: mappings,
      plo: plos,
      competency: competencies,
    })
    .from(mappings)
    .innerJoin(plos, eq(mappings.ploId, plos.id))
    .innerJoin(competencies, eq(mappings.competencyId, competencies.id))
    .where(inArray(mappings.ploId, ploIds));
  
  // Convert weight from string to number for Linux MySQL compatibility
  return results.map(r => ({
    ...r,
    mapping: {
      ...r.mapping,
      weight: typeof r.mapping.weight === 'string' ? parseFloat(r.mapping.weight) : r.mapping.weight
    }
  }));
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
      ga: graduateattributes,
      competency: competencies,
    })
    .from(justifications)
    .innerJoin(graduateattributes, eq(justifications.gaid, graduateattributes.id))
    .innerJoin(competencies, eq(justifications.competencyId, competencies.id))
    .where(eq(justifications.programId, programId))
    .orderBy(graduateattributes.code, competencies.code);
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
  const allGAs = await db.select().from(graduateattributes).orderBy(graduateattributes.sortOrder);
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
        
        // Skip programs without PLOs
        if (programPLOs.length === 0) continue;
        
        const programMappings = await db
          .select({
            weight: mappings.weight,
            competencyId: mappings.competencyId,
          })
          .from(mappings)
          .innerJoin(plos, eq(mappings.ploId, plos.id))
          .where(eq(plos.programId, programId));
        
        // Skip programs without mappings
        if (programMappings.length === 0) continue;
        
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

export async function getClusterAnalytics(clusterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get cluster info
  const cluster = await db
    .select()
    .from(clusters)
    .where(eq(clusters.id, clusterId))
    .limit(1);

  if (!cluster || cluster.length === 0) {
    throw new Error("Cluster not found");
  }

  // Get all departments in this cluster
  const depts = await db.select().from(departments).where(eq(departments.clusterId, clusterId));

  // Get analytics for each department
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

  // Calculate cluster-wide metrics
  const totalPrograms = departmentAnalytics.reduce((sum, d) => sum + d.totalPrograms, 0);
  const totalPLOs = departmentAnalytics.reduce((sum, d) => sum + d.totalPLOs, 0);
  const avgAlignment = departmentAnalytics.length > 0
    ? departmentAnalytics.reduce((sum, d) => sum + d.averageAlignment, 0) / departmentAnalytics.length
    : 0;

  // Calculate GA breakdown
  const allGAs = await db.select().from(graduateattributes).orderBy(graduateattributes.sortOrder);
  const gaBreakdown = await Promise.all(
    allGAs.map(async (ga) => {
      const competenciesForGA = await db.select().from(competencies).where(eq(competencies.gaId, ga.id));
      const competencyIds = competenciesForGA.map((c) => c.id);

      const departmentIds = depts.map((d) => d.id);
      const clusterPrograms = await db.select().from(programs).where(inArray(programs.departmentId, departmentIds));
      const programIds = clusterPrograms.map((p) => p.id);

      if (programIds.length === 0 || competencyIds.length === 0) {
        return {
          gaId: ga.id,
          gaCode: ga.code,
          gaName: ga.nameEn,
          score: 0,
        };
      }

      const ploList = await db.select().from(plos).where(inArray(plos.programId, programIds));
      const ploIds = ploList.map((p) => p.id);

      if (ploIds.length === 0) {
        return {
          gaId: ga.id,
          gaCode: ga.code,
          gaName: ga.nameEn,
          score: 0,
        };
      }

      const mappingsForGA = await db
        .select()
        .from(mappings)
        .where(and(inArray(mappings.ploId, ploIds), inArray(mappings.competencyId, competencyIds)));

      const totalWeight = mappingsForGA.reduce((sum, m) => sum + (parseFloat(m.weight as any) || 0), 0);
      const maxPossibleWeight = ploIds.length * competencyIds.length;
      const score = maxPossibleWeight > 0 ? (totalWeight / maxPossibleWeight) * 100 : 0;

      return {
        gaId: ga.id,
        gaCode: ga.code,
        gaName: ga.nameEn,
        score: Math.round(score * 100) / 100,
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

  // Filter out programs without PLOs
  const programsWithData = programAnalytics.filter(p => p.totalPLOs > 0);

  const totalPLOs = programsWithData.reduce((sum, p) => sum + p.totalPLOs, 0);
  const avgAlignment = programsWithData.length > 0
    ? programsWithData.reduce((sum, p) => sum + p.alignmentScore, 0) / programsWithData.length
    : 0;

  return {
    totalPrograms: programsWithData.length,
    totalPLOs,
    averageAlignment: Math.round(avgAlignment * 100) / 100,
    programs: programsWithData,
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
  const allGAs = await db.select().from(graduateattributes);

  // Calculate alignment score for each GA
  const gaScores = allGAs.map((ga) => {
    const gaCompetencies = allCompetencies.filter((c) => c.gaId === ga.id);
    
    // Calculate average score for each competency, then average those for the GA
    const competencyScores: number[] = [];
    let totalWeight = 0;
    
    gaCompetencies.forEach((competency) => {
      // Get mappings for this competency in this program
      const competencyMappings = programMappings.filter((m) => m.competencyId === competency.id);
      
      // Competency score = SUM of all weights (should total to 1.0 or 0)
      const competencyWeight = competencyMappings.reduce((sum, m) => sum + parseFloat(m.weight), 0);
      competencyScores.push(competencyWeight);
      totalWeight += competencyWeight;
    });
    
    // GA score = average of competency scores (convert to percentage)
    const score = competencyScores.length > 0
      ? (competencyScores.reduce((sum, s) => sum + s, 0) / competencyScores.length) * 100
      : 0;
    
    // Max weight for display purposes
    const maxWeight = gaCompetencies.length * programPLOs.length;

    return {
      gaId: ga.id,
      gaCode: ga.code,
      gaName: ga.nameEn,
      score: Math.round(score * 100) / 100,
      totalWeight: Math.round(totalWeight * 100) / 100,
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
// Data Completeness Statistics
// ============================================================================

export async function getDataCompletenessStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get all programs with their college and department info
  const allPrograms = await db
    .select({
      programId: programs.id,
      programName: programs.nameEn,
      departmentId: departments.id,
      departmentName: departments.nameEn,
      collegeId: colleges.id,
      collegeName: colleges.nameEn,
    })
    .from(programs)
    .innerJoin(departments, eq(programs.departmentId, departments.id))
    .innerJoin(colleges, eq(departments.collegeId, colleges.id));
  
  // Calculate completeness for each program
  const programCompleteness = await Promise.all(
    allPrograms.map(async (prog) => {
      const programPLOs = await db
        .select({ id: plos.id })
        .from(plos)
        .where(eq(plos.programId, prog.programId));
      
      const ploIds = programPLOs.map(p => p.id);
      
      let mappingCount = 0;
      let justificationCount = 0;
      
      if (ploIds.length > 0) {
        const programMappings = await db
          .select({ id: mappings.id })
          .from(mappings)
          .where(inArray(mappings.ploId, ploIds));
        mappingCount = programMappings.length;
        
        const programJustifications = await db
          .select({ id: justifications.id })
          .from(justifications)
          .where(eq(justifications.programId, prog.programId));
        justificationCount = programJustifications.length;
      }
      
      return {
        ...prog,
        ploCount: programPLOs.length,
        mappingCount,
        justificationCount,
        hasPLOs: programPLOs.length > 0,
        hasMappings: mappingCount > 0,
        hasJustifications: justificationCount > 0,
        isComplete: programPLOs.length > 0 && mappingCount > 0,
      };
    })
  );
  
  // Group by college
  const collegeStats = allPrograms.reduce((acc, prog) => {
    if (!acc[prog.collegeId]) {
      acc[prog.collegeId] = {
        collegeId: prog.collegeId,
        collegeName: prog.collegeName,
        totalPrograms: 0,
        programsWithPLOs: 0,
        programsWithMappings: 0,
        programsWithJustifications: 0,
        completePrograms: 0,
      };
    }
    return acc;
  }, {} as Record<number, any>);
  
  programCompleteness.forEach((prog) => {
    const stats = collegeStats[prog.collegeId];
    stats.totalPrograms++;
    if (prog.hasPLOs) stats.programsWithPLOs++;
    if (prog.hasMappings) stats.programsWithMappings++;
    if (prog.hasJustifications) stats.programsWithJustifications++;
    if (prog.isComplete) stats.completePrograms++;
  });
  
  // Calculate overall stats
  const totalPrograms = allPrograms.length;
  const programsWithPLOs = programCompleteness.filter(p => p.hasPLOs).length;
  const programsWithMappings = programCompleteness.filter(p => p.hasMappings).length;
  const programsWithJustifications = programCompleteness.filter(p => p.hasJustifications).length;
  const completePrograms = programCompleteness.filter(p => p.isComplete).length;
  
  return {
    overall: {
      totalPrograms,
      programsWithPLOs,
      programsWithMappings,
      programsWithJustifications,
      completePrograms,
      ploCompletionRate: totalPrograms > 0 ? Math.round((programsWithPLOs / totalPrograms) * 100) : 0,
      mappingCompletionRate: totalPrograms > 0 ? Math.round((programsWithMappings / totalPrograms) * 100) : 0,
      justificationCompletionRate: totalPrograms > 0 ? Math.round((programsWithJustifications / totalPrograms) * 100) : 0,
      overallCompletionRate: totalPrograms > 0 ? Math.round((completePrograms / totalPrograms) * 100) : 0,
    },
    byCollege: Object.values(collegeStats).map((stats: any) => ({
      ...stats,
      ploCompletionRate: stats.totalPrograms > 0 ? Math.round((stats.programsWithPLOs / stats.totalPrograms) * 100) : 0,
      mappingCompletionRate: stats.totalPrograms > 0 ? Math.round((stats.programsWithMappings / stats.totalPrograms) * 100) : 0,
      justificationCompletionRate: stats.totalPrograms > 0 ? Math.round((stats.programsWithJustifications / stats.totalPrograms) * 100) : 0,
      overallCompletionRate: stats.totalPrograms > 0 ? Math.round((stats.completePrograms / stats.totalPrograms) * 100) : 0,
    })),
    programs: programCompleteness,
  };
}

export async function validateAllProgramsData() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const issues: Array<{
    severity: 'error' | 'warning' | 'info';
    category: string;
    programId: number;
    programName: string;
    collegeName: string;
    departmentName: string;
    issue: string;
    details: string;
  }> = [];
  
  // Get all programs with their college and department info
  const allPrograms = await db
    .select({
      programId: programs.id,
      programName: programs.nameEn,
      programCode: programs.code,
      departmentId: departments.id,
      departmentName: departments.nameEn,
      collegeId: colleges.id,
      collegeName: colleges.nameEn,
    })
    .from(programs)
    .innerJoin(departments, eq(programs.departmentId, departments.id))
    .innerJoin(colleges, eq(departments.collegeId, colleges.id));
  
  // Validate each program
  for (const prog of allPrograms) {
    // Check for PLOs
    const programPLOs = await db
      .select({ id: plos.id, descriptionEn: plos.descriptionEn, sortOrder: plos.sortOrder })
      .from(plos)
      .where(eq(plos.programId, prog.programId));
    
    if (programPLOs.length === 0) {
      issues.push({
        severity: 'error',
        category: 'Missing PLOs',
        programId: prog.programId,
        programName: prog.programName,
        collegeName: prog.collegeName,
        departmentName: prog.departmentName,
        issue: 'No PLOs defined',
        details: 'Program has no Program Learning Outcomes defined. This program will be excluded from analytics.',
      });
      continue; // Skip further checks if no PLOs
    }
    
    // Check for mappings
    const ploIds = programPLOs.map(p => p.id);
    const programMappings = await db
      .select({ id: mappings.id, ploId: mappings.ploId, weight: mappings.weight })
      .from(mappings)
      .where(inArray(mappings.ploId, ploIds));
    
    if (programMappings.length === 0) {
      issues.push({
        severity: 'error',
        category: 'Missing Mappings',
        programId: prog.programId,
        programName: prog.programName,
        collegeName: prog.collegeName,
        departmentName: prog.departmentName,
        issue: 'No competency mappings',
        details: `Program has ${programPLOs.length} PLOs but no competency mappings defined. This program will be excluded from analytics.`,
      });
      continue;
    }
    
    // Check for zero-weight mappings
    const zeroWeightMappings = programMappings.filter(m => parseFloat(m.weight) === 0);
    if (zeroWeightMappings.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'Zero-Weight Mappings',
        programId: prog.programId,
        programName: prog.programName,
        collegeName: prog.collegeName,
        departmentName: prog.departmentName,
        issue: `${zeroWeightMappings.length} mappings with zero weight`,
        details: 'Some PLO-competency mappings have zero weight, which may indicate incomplete data entry.',
      });
    }
    
    // Check for PLOs without mappings
    const plosWithMappings = new Set(programMappings.map(m => m.ploId));
    const plosWithoutMappings = programPLOs.filter(p => !plosWithMappings.has(p.id));
    if (plosWithoutMappings.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'Unmapped PLOs',
        programId: prog.programId,
        programName: prog.programName,
        collegeName: prog.collegeName,
        departmentName: prog.departmentName,
        issue: `${plosWithoutMappings.length} PLOs without competency mappings`,
        details: `PLOs: ${plosWithoutMappings.map(p => `PLO${p.sortOrder}`).join(', ')}`,
      });
    }
    
    // Check for justifications
    const programJustifications = await db
      .select({ id: justifications.id })
      .from(justifications)
      .where(eq(justifications.programId, prog.programId));
    
    if (programJustifications.length === 0) {
      issues.push({
        severity: 'info',
        category: 'Missing Justifications',
        programId: prog.programId,
        programName: prog.programName,
        collegeName: prog.collegeName,
        departmentName: prog.departmentName,
        issue: 'No mapping justifications',
        details: 'Program has no justifications for PLO-competency mappings. Justifications help explain the rationale for mappings.',
      });
    }
  }
  
  // Summary statistics
  const summary = {
    totalPrograms: allPrograms.length,
    programsWithErrors: new Set(issues.filter(i => i.severity === 'error').map(i => i.programId)).size,
    programsWithWarnings: new Set(issues.filter(i => i.severity === 'warning').map(i => i.programId)).size,
    programsWithInfo: new Set(issues.filter(i => i.severity === 'info').map(i => i.programId)).size,
    totalErrors: issues.filter(i => i.severity === 'error').length,
    totalWarnings: issues.filter(i => i.severity === 'warning').length,
    totalInfo: issues.filter(i => i.severity === 'info').length,
  };
  
  return {
    summary,
    issues: issues.sort((a, b) => {
      // Sort by severity first (error > warning > info), then by college, then by program
      const severityOrder = { error: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      if (a.collegeName !== b.collegeName) {
        return a.collegeName.localeCompare(b.collegeName);
      }
      return a.programName.localeCompare(b.programName);
    }),
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
  const allGAs = await db.select().from(graduateattributes).orderBy(graduateattributes.code);
  
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
      // For university-wide: calculate average competency score across all programs
      // Competency score per program = SUM of weights, then average across programs
      
      let competencySumAcrossPrograms = 0;
      let programCount = 0;
      
      allPrograms.forEach((program) => {
        const programPLOs = allPLOs.filter((p) => p.programId === program.id);
        const programPLOIds = programPLOs.map((p) => p.id);
        const competencyMappingsInProgram = allMappings.filter(
          (m) => m.competencyId === competency.id && programPLOIds.includes(m.ploId)
        );
        
        if (programPLOIds.length > 0) {
          // Competency score for this program = SUM of weights
          const competencyWeightInProgram = competencyMappingsInProgram.reduce(
            (sum, m) => sum + parseFloat(m.weight), 0
          );
          competencySumAcrossPrograms += competencyWeightInProgram;
          programCount++;
          totalWeight += competencyWeightInProgram;
        }
      });
      
      // Average competency score across all programs
      const avgCompetencyScore = programCount > 0 ? competencySumAcrossPrograms / programCount : 0;
      competencyScores.push(avgCompetencyScore);
      totalMappings += programCount;
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

    // Calculate GA alignment score as average of competency scores (convert to percentage)
    const avgScore = competencyScores.length > 0 
      ? (competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length) * 100
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

  const allGAs = await db.select().from(graduateattributes).orderBy(graduateattributes.code);
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

      // Use same formula as getGAAnalytics: calculate average of competency scores
      const competencyScores: number[] = [];
      
      gaCompetencies.forEach((competency) => {
        let competencySumAcrossPrograms = 0;
        let programCount = 0;
        
        collegePrograms.forEach((program) => {
          const programPLOs = allPLOs.filter((p) => p.programId === program.id);
          const programPLOIds = programPLOs.map((p) => p.id);
          const competencyMappingsInProgram = allMappings.filter(
            (m) => m.competencyId === competency.id && programPLOIds.includes(m.ploId)
          );
          
          if (programPLOIds.length > 0) {
            const competencyWeightInProgram = competencyMappingsInProgram.reduce(
              (sum, m) => sum + parseFloat(m.weight), 0
            );
            competencySumAcrossPrograms += competencyWeightInProgram;
            programCount++;
          }
        });
        
        const avgCompetencyScore = programCount > 0 ? competencySumAcrossPrograms / programCount : 0;
        competencyScores.push(avgCompetencyScore);
      });

      const score = competencyScores.length > 0 
        ? (competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length) * 100
        : 0;

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

export async function getGAByProgramAnalytics(collegeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allGAs = await db.select().from(graduateattributes).orderBy(graduateattributes.code);
  const allDepartments = await db.select().from(departments).where(eq(departments.collegeId, collegeId));
  const departmentIds = allDepartments.map((d) => d.id);
  const allPrograms = await db.select().from(programs).where(inArray(programs.departmentId, departmentIds));
  const allCompetencies = await db.select().from(competencies);
  const allPLOs = await db.select().from(plos);
  const allMappings = await db.select().from(mappings);

  const programData = allPrograms.map((program) => {
    const gaScores = allGAs.map((ga) => {
      const gaCompetencies = allCompetencies.filter((c) => c.gaId === ga.id);
      const gaCompetencyIds = gaCompetencies.map((c) => c.id);

      const programPLOs = allPLOs.filter((p) => p.programId === program.id);
      
      // Calculate competency scores for this program
      const competencyScores = gaCompetencies.map((competency) => {
        const competencyMappings = allMappings.filter(
          (m) => programPLOs.some((plo) => plo.id === m.ploId) && m.competencyId === competency.id
        );
        // Competency score = SUM of weights
        return competencyMappings.reduce((sum, m) => sum + parseFloat(m.weight), 0);
      });
      
      // GA score = AVERAGE of competency scores × 100
      const avgCompetencyScore = competencyScores.length > 0
        ? competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length
        : 0;
      const score = avgCompetencyScore * 100;

      return {
        gaCode: ga.code,
        score: Math.round(score * 100) / 100,
      };
    });

    return {
      programId: program.id,
      programCode: program.code,
      programNameEn: program.nameEn,
      programNameAr: program.nameAr,
      gaScores,
    };
  });

  return {
    programData,
    gaList: allGAs.map((ga) => ({ code: ga.code, nameEn: ga.nameEn, nameAr: ga.nameAr })),
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
    let totalWeightAcrossPrograms = 0;
    let programCount = 0;
    let justificationCount = 0;

    allPrograms.forEach((program) => {
      const programPLOs = allPLOs.filter((p) => p.programId === program.id);
      const programMappings = allMappings.filter(
        (m) => programPLOs.some((plo) => plo.id === m.ploId) && m.competencyId === competency.id
      );

      if (programPLOs.length > 0) {
        // Competency score for this program = SUM of all weights
        const competencyWeightInProgram = programMappings.reduce(
          (sum, m) => sum + parseFloat(m.weight), 0
        );
        
        if (competencyWeightInProgram > 0) {
          programsWithCompetency.add(program.id);
        }
        
        totalWeightAcrossPrograms += competencyWeightInProgram;
        programCount++;
      }

      // Count justifications for this competency in this program
      const programJustifications = allJustifications.filter(
        (j) => j.programId === program.id && j.competencyId === competency.id
      );
      justificationCount += programJustifications.length;
    });

    // Calculate average weight per program (SUM of weights per program, then average)
    const avgWeight = programCount > 0 ? totalWeightAcrossPrograms / programCount : 0;

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
      totalWeight: Math.round(totalWeightAcrossPrograms * 100) / 100,
      mappingCount: programCount,
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
export async function getFilteredGAAnalytics(filters?: { collegeId?: number; clusterId?: number; programId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all GAs
  const allGAs = await db.select().from(graduateattributes).orderBy(graduateattributes.code);
  
  // Get filtered programs
  let filteredPrograms = await db.select().from(programs);
  
  if (filters?.programId) {
    // Filter by specific program
    filteredPrograms = filteredPrograms.filter((p) => p.id === filters.programId);
  } else if (filters?.clusterId) {
    // Filter by cluster (get departments in cluster first, then programs)
    const clusterDepartments = await db.select().from(departments).where(eq(departments.clusterId, filters.clusterId));
    const deptIds = clusterDepartments.map((d) => d.id);
    filteredPrograms = filteredPrograms.filter((p) => deptIds.includes(p.departmentId));
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
      // For filtered programs: calculate average competency score across filtered programs
      // Competency score per program = SUM of weights, then average across programs
      
      let competencySumAcrossPrograms = 0;
      let programCount = 0;
      
      filteredPrograms.forEach((program) => {
        const programPLOs = allPLOs.filter((p) => p.programId === program.id);
        const programPLOIds = programPLOs.map((p) => p.id);
        const competencyMappingsInProgram = allMappings.filter(
          (m) => m.competencyId === competency.id && programPLOIds.includes(m.ploId)
        );
        
        if (programPLOIds.length > 0) {
          // Competency score for this program = SUM of weights
          const competencyWeightInProgram = competencyMappingsInProgram.reduce(
            (sum, m) => sum + parseFloat(m.weight), 0
          );
          competencySumAcrossPrograms += competencyWeightInProgram;
          programCount++;
          totalWeight += competencyWeightInProgram;
        }
      });
      
      // Average competency score across filtered programs
      const avgCompetencyScore = programCount > 0 ? competencySumAcrossPrograms / programCount : 0;
      competencyScores.push(avgCompetencyScore);
      totalMappings += programCount;
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

    // Calculate GA alignment score as average of competency scores (convert to percentage)
    const avgScore = competencyScores.length > 0 
      ? (competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length) * 100
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
export async function getFilteredCompetencyAnalytics(filters?: { collegeId?: number; clusterId?: number; programId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all competencies
  const allCompetencies = await db.select().from(competencies);
  
  // Get filtered programs
  let filteredPrograms = await db.select().from(programs);
  
  if (filters?.programId) {
    // Filter by specific program
    filteredPrograms = filteredPrograms.filter((p) => p.id === filters.programId);
  } else if (filters?.clusterId) {
    // Filter by cluster (get departments in cluster first, then programs)
    const clusterDepartments = await db.select().from(departments).where(eq(departments.clusterId, filters.clusterId));
    const deptIds = clusterDepartments.map((d) => d.id);
    filteredPrograms = filteredPrograms.filter((p) => deptIds.includes(p.departmentId));
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

      if (programPLOs.length > 0) {
        // Competency score for this program = SUM of all weights
        const competencyWeightInProgram = programMappings.reduce(
          (sum, m) => sum + parseFloat(m.weight), 0
        );
        
        if (competencyWeightInProgram > 0) {
          programsWithComp.add(program.id);
        }
        
        totalWeight += competencyWeightInProgram;
        mappingCount++;
      }

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


// ==================== User Management ====================

/**
 * Get all users with their assignments
 */
export async function getAllUsers(): Promise<(User & { assignments: UserAssignment[] })[]> {
  const db = await getDb();
  if (!db) return [];

  const allUsers = await db.select().from(users).orderBy(users.createdAt);
  
  const usersWithAssignments = await Promise.all(
    allUsers.map(async (user) => {
      const assignments = await db
        .select()
        .from(userAssignments)
        .where(eq(userAssignments.userId, user.id));
      
      return {
        ...user,
        assignments,
      };
    })
  );

  return usersWithAssignments;
}

/**
 * Get user by ID with assignments
 */
export async function getUserById(userId: number): Promise<(User & { assignments: UserAssignment[] }) | null> {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  const assignments = await db
    .select()
    .from(userAssignments)
    .where(eq(userAssignments.userId, userId));

  return {
    ...user,
    assignments,
  };
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: number, role: 'admin' | 'viewer' | 'editor'): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Create user assignment
 */
export async function createUserAssignment(assignment: InsertUserAssignment): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userAssignments).values(assignment);
  return result[0].insertId;
}

/**
 * Delete user assignment
 */
export async function deleteUserAssignment(assignmentId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(userAssignments).where(eq(userAssignments.id, assignmentId));
}

/**
 * Delete all assignments for a user
 */
export async function deleteUserAssignments(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(userAssignments).where(eq(userAssignments.userId, userId));
}

/**
 * Get user assignments by user ID
 */
export async function getUserAssignments(userId: number): Promise<UserAssignment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userAssignments)
    .where(eq(userAssignments.userId, userId));
}

/**
 * Check if user has access to a specific department
 * Returns true if:
 * - User is admin
 * - User has university-level assignment
 * - User has college-level assignment matching department's college
 * - User has cluster-level assignment matching department's cluster
 * - User has department-level assignment matching the department
 */
export async function userHasAccessToDepartment(userId: number, departmentId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Get user
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return false;

  // Admin has access to everything
  if (user.role === 'admin') return true;

  // Get department details
  const [dept] = await db
    .select()
    .from(departments)
    .where(eq(departments.id, departmentId));
  if (!dept) return false;

  // Get user assignments
  const assignments = await db
    .select()
    .from(userAssignments)
    .where(eq(userAssignments.userId, userId));

  // Check assignments
  for (const assignment of assignments) {
    // University-level access
    if (assignment.assignmentType === 'university') return true;

    // College-level access
    if (assignment.assignmentType === 'college' && assignment.collegeId === dept.collegeId) {
      return true;
    }

    // Cluster-level access
    if (assignment.assignmentType === 'cluster' && dept.clusterId && assignment.clusterId === dept.clusterId) {
      return true;
    }

    // Department-level access
    if (assignment.assignmentType === 'department' && assignment.departmentId === departmentId) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user has access to a specific program
 */
export async function userHasAccessToProgram(userId: number, programId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Get program with department
  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.id, programId));
  
  if (!program) return false;

  return await userHasAccessToDepartment(userId, program.departmentId);
}

/**
 * Get accessible departments for a user
 * Returns all departments the user can view based on their assignments
 */
export async function getAccessibleDepartments(userId: number): Promise<Department[]> {
  const db = await getDb();
  if (!db) return [];

  // Get user
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return [];

  // Admin has access to all departments
  if (user.role === 'admin') {
    return await db.select().from(departments);
  }

  // Get user assignments
  const assignments = await db
    .select()
    .from(userAssignments)
    .where(eq(userAssignments.userId, userId));

  if (assignments.length === 0) return [];

  const accessibleDepts: Department[] = [];

  for (const assignment of assignments) {
    if (assignment.assignmentType === 'university') {
      // University-level: all departments
      return await db.select().from(departments);
    } else if (assignment.assignmentType === 'college' && assignment.collegeId) {
      // College-level: all departments in college
      const depts = await db
        .select()
        .from(departments)
        .where(eq(departments.collegeId, assignment.collegeId));
      accessibleDepts.push(...depts);
    } else if (assignment.assignmentType === 'cluster' && assignment.clusterId) {
      // Cluster-level: all departments in cluster
      const depts = await db
        .select()
        .from(departments)
        .where(eq(departments.clusterId, assignment.clusterId));
      accessibleDepts.push(...depts);
    } else if (assignment.assignmentType === 'department' && assignment.departmentId) {
      // Department-level: specific department
      const [dept] = await db
        .select()
        .from(departments)
        .where(eq(departments.id, assignment.departmentId));
      if (dept) accessibleDepts.push(dept);
    }
  }

  // Remove duplicates
  const uniqueDepts = Array.from(
    new Map(accessibleDepts.map(d => [d.id, d])).values()
  );

  return uniqueDepts;
}

/**
 * Get accessible programs for a user
 * Returns all programs the user can view based on their assignments
 */
export async function getAccessiblePrograms(userId: number): Promise<Program[]> {
  const db = await getDb();
  if (!db) return [];

  const accessibleDepts = await getAccessibleDepartments(userId);
  if (accessibleDepts.length === 0) return [];

  const deptIds = accessibleDepts.map(d => d.id);
  
  return await db
    .select()
    .from(programs)
    .where(inArray(programs.departmentId, deptIds));
}
