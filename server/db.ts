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
  graduateAttributes,
  competencies,
  plos,
  mappings,
  justifications,
  auditLog,
  reportTemplates,
  loginHistory,
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
  type LoginHistory,
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
  type InsertLoginHistory,
  systemSettings,
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

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: {
  username: string;
  password: string;
  email?: string | null;
  name?: string | null;
  role?: "admin" | "editor" | "viewer";
  loginMethod?: string | null;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values({
    username: data.username,
    password: data.password,
    email: data.email || null,
    name: data.name || null,
    role: data.role || "viewer",
    loginMethod: data.loginMethod || "password",
  });

  return result[0].insertId;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserResetToken(
  userId: number,
  resetToken: string,
  resetTokenExpiry: Date
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ resetToken, resetTokenExpiry })
    .where(eq(users.id, userId));
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

export async function updateCollege(id: number, data: Partial<InsertCollege>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(colleges).set(data).where(eq(colleges.id, id));
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

export async function updateCluster(id: number, data: Partial<InsertCluster>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clusters).set(data).where(eq(clusters.id, id));
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

export async function updateDepartment(id: number, data: Partial<InsertDepartment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(departments).set(data).where(eq(departments.id, id));
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

export async function deleteCollege(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Cascade: departments -> programs -> PLOs -> mappings are all ON DELETE CASCADE in schema
  // But we also need to clean up justifications manually
  const collegeDepts = await db.select().from(departments).where(eq(departments.collegeId, id));
  const deptIds = collegeDepts.map(d => d.id);
  if (deptIds.length > 0) {
    const deptPrograms = await db.select().from(programs).where(inArray(programs.departmentId, deptIds));
    const progIds = deptPrograms.map(p => p.id);
    if (progIds.length > 0) {
      await db.delete(justifications).where(inArray(justifications.programId, progIds));
      const progPLOs = await db.select().from(plos).where(inArray(plos.programId, progIds));
      const ploIds = progPLOs.map(p => p.id);
      if (ploIds.length > 0) {
        await db.delete(mappings).where(inArray(mappings.ploId, ploIds));
        await db.delete(plos).where(inArray(plos.programId, progIds));
      }
      await db.delete(programs).where(inArray(programs.departmentId, deptIds));
    }
    await db.delete(departments).where(eq(departments.collegeId, id));
  }
  await db.delete(clusters).where(eq(clusters.collegeId, id));
  await db.delete(colleges).where(eq(colleges.id, id));
}

export async function deleteCluster(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Set clusterId to null on departments that reference this cluster
  await db.update(departments).set({ clusterId: null }).where(eq(departments.clusterId, id));
  await db.delete(clusters).where(eq(clusters.id, id));
}

export async function deleteDepartment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const deptPrograms = await db.select().from(programs).where(eq(programs.departmentId, id));
  const progIds = deptPrograms.map(p => p.id);
  if (progIds.length > 0) {
    await db.delete(justifications).where(inArray(justifications.programId, progIds));
    const progPLOs = await db.select().from(plos).where(inArray(plos.programId, progIds));
    const ploIds = progPLOs.map(p => p.id);
    if (ploIds.length > 0) {
      await db.delete(mappings).where(inArray(mappings.ploId, ploIds));
      await db.delete(plos).where(inArray(plos.programId, progIds));
    }
    await db.delete(programs).where(eq(programs.departmentId, id));
  }
  await db.delete(departments).where(eq(departments.id, id));
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

/**
 * Returns the current sum of weights for a given competency across all PLOs,
 * optionally excluding the PLO that is about to be updated (to allow edits).
 */
export async function getCompetencyTotalWeight(
  competencyId: number,
  excludePloId?: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .select({ weight: mappings.weight, ploId: mappings.ploId })
    .from(mappings)
    .where(eq(mappings.competencyId, competencyId));
  return rows
    .filter((r) => excludePloId === undefined || r.ploId !== excludePloId)
    .reduce((sum, r) => sum + (typeof r.weight === 'string' ? parseFloat(r.weight) : Number(r.weight)), 0);
}

export async function upsertMapping(ploId: number, competencyId: number, weight: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const newWeight = parseFloat(weight);
  if (isNaN(newWeight) || newWeight < 0 || newWeight > 1) {
    throw new Error(`Weight must be between 0 and 1 (got ${weight}).`);
  }

  // Note: saving is always allowed regardless of total.
  // The frontend shows a warning badge when the total exceeds 100%,
  // but never blocks the user from adjusting weights.

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
  const allGAs = await db.select().from(graduateAttributes).orderBy(graduateAttributes.sortOrder);
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
  const allGAs = await db.select().from(graduateAttributes);

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

// ── System Settings ──────────────────────────────────────────────────────────
export async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
  try {
    const db = await getDb();
    if (!db) return defaultValue;
    const rows = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
    if (rows.length === 0) return defaultValue;
    return rows[0].value;
  } catch {
    // Table may not exist yet on this environment; return the default
    return defaultValue;
  }
}
export async function setSystemSetting(key: string, value: string, updatedBy?: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  // Ensure the table exists before inserting
  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`systemSettings\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`key\` VARCHAR(191) NOT NULL UNIQUE,
      value TEXT NOT NULL,
      description TEXT,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      updatedBy INT,
      FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  await db
    .insert(systemSettings)
    .values({ key, value, updatedBy: updatedBy ?? null })
    .onDuplicateKeyUpdate({ set: { value, updatedBy: updatedBy ?? null } });
}

export async function validateAllProgramsData(coverageThreshold: number = 80) {
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
      .select({ id: mappings.id, ploId: mappings.ploId, competencyId: mappings.competencyId, weight: mappings.weight })
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
    
    // Check mapping coverage: percentage of competencies with non-zero total PLO weight
    // Warn if coverage falls below the configurable threshold (default 80%)
    const competencyWeightSums = new Map<number, number>();
    for (const m of programMappings) {
      const prev = competencyWeightSums.get(m.competencyId) ?? 0;
      competencyWeightSums.set(m.competencyId, prev + parseFloat(m.weight));
    }
    const totalCompetencies = competencyWeightSums.size;
    const mappedCompetencies = Array.from(competencyWeightSums.values()).filter(sum => sum > 0).length;
    const unmappedCompetencies = totalCompetencies - mappedCompetencies;
    const coveragePercent = totalCompetencies > 0 ? (mappedCompetencies / totalCompetencies) * 100 : 100;
    if (totalCompetencies > 0 && coveragePercent < coverageThreshold) {
      issues.push({
        severity: 'warning',
        category: 'Low Mapping Coverage',
        programId: prog.programId,
        programName: prog.programName,
        collegeName: prog.collegeName,
        departmentName: prog.departmentName,
        issue: `Mapping coverage ${coveragePercent.toFixed(1)}% is below the ${coverageThreshold}% threshold`,
        details: `${unmappedCompetencies} of ${totalCompetencies} competencies have a total PLO weight sum of zero. Coverage is ${coveragePercent.toFixed(1)}%, which is below the required ${coverageThreshold}% threshold.`,
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
    
    // Check for over-100% competency weight totals
    const allCompetencies = await db.select({ id: competencies.id, code: competencies.code, nameEn: competencies.nameEn }).from(competencies);
    for (const comp of allCompetencies) {
      const compMappings = programMappings.filter(m => {
        // We need to join with competencies - get mappings for this competency
        return true; // will filter below
      });
      // Get mappings for this competency across this program's PLOs
      const compWeightRows = await db
        .select({ weight: mappings.weight })
        .from(mappings)
        .where(and(inArray(mappings.ploId, ploIds), eq(mappings.competencyId, comp.id)));
      const total = compWeightRows.reduce((sum, r) => sum + parseFloat(r.weight || '0'), 0);
      if (total > 1.001) { // small epsilon for floating point
        issues.push({
          severity: 'error',
          category: 'Over-Limit Competency Weights',
          programId: prog.programId,
          programName: prog.programName,
          collegeName: prog.collegeName,
          departmentName: prog.departmentName,
          issue: `${comp.code} total weight is ${(total * 100).toFixed(1)}% (exceeds 100%)`,
          details: `Competency "${comp.nameEn}" (${comp.code}) has a total weight of ${(total * 100).toFixed(1)}% across all PLOs in this program. The maximum allowed is 100%. Please reduce some PLO weights for this competency.`,
        });
      }
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
// Normalize Over-Limit Competency Weights
// ============================================================================
export async function normalizeOverLimitWeights() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all programs
  const allPrograms = await db
    .select({ id: programs.id })
    .from(programs);

  let fixedCount = 0;
  let affectedPrograms = 0;

  for (const prog of allPrograms) {
    // Get all PLOs for this program
    const progPLOs = await db
      .select({ id: plos.id })
      .from(plos)
      .where(eq(plos.programId, prog.id));
    if (progPLOs.length === 0) continue;
    const ploIds = progPLOs.map(p => p.id);

    // Get all competencies
    const allComps = await db
      .select({ id: competencies.id })
      .from(competencies);

    let programFixed = false;
    for (const comp of allComps) {
      // Get all mappings for this competency within this program's PLOs
      const compMappings = await db
        .select({ ploId: mappings.ploId, weight: mappings.weight })
        .from(mappings)
        .where(and(inArray(mappings.ploId, ploIds), eq(mappings.competencyId, comp.id)));

      if (compMappings.length === 0) continue;
      const total = compMappings.reduce((sum, r) => sum + parseFloat(r.weight || '0'), 0);
      if (total <= 1.001) continue; // already within limit

      // Proportionally scale all weights down so they sum to 1.0
      for (const m of compMappings) {
        const original = parseFloat(m.weight || '0');
        const normalized = Math.round((original / total) * 100) / 100;
        const normStr = normalized.toFixed(2);
        await db
          .update(mappings)
          .set({ weight: normStr, updatedAt: new Date() })
          .where(and(eq(mappings.ploId, m.ploId), eq(mappings.competencyId, comp.id)));
        fixedCount++;
      }
      programFixed = true;
    }
    if (programFixed) affectedPrograms++;
  }

  return { fixedCount, affectedPrograms };
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

  const allGAs = await db.select().from(graduateAttributes).orderBy(graduateAttributes.code);
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
  const allGAs = await db.select().from(graduateAttributes).orderBy(graduateAttributes.code);
  
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
 * Update user last signed in timestamp
 */
export async function updateUserLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
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
 * Update user information
 */
export async function updateUser(userId: number, data: {
  name?: string;
  email?: string;
  role?: 'admin' | 'viewer' | 'editor';
  password?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const updateData: any = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.password !== undefined) updateData.password = data.password;

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId));
}

/**
 * Update user profile (name and email only)
 */
export async function updateUserProfile(userId: number, name?: string, email?: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const updateData: any = { updatedAt: new Date() };
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId));
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Delete a user by ID
 */
export async function deleteUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(users).where(eq(users.id, userId));
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

  // Get user
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return false;

  // Admin has access to all programs
  if (user.role === 'admin') return true;

  // Get program with department
  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.id, programId));
  
  if (!program) return false;

  // Get user assignments
  const assignments = await db
    .select()
    .from(userAssignments)
    .where(eq(userAssignments.userId, userId));

  // Check assignments
  for (const assignment of assignments) {
    // Program-level access: direct match
    if (assignment.assignmentType === 'program' && assignment.programId === programId) {
      return true;
    }
    
    // Department-level access: check if program belongs to assigned department
    if (assignment.assignmentType === 'department' && assignment.departmentId === program.departmentId) {
      return true;
    }
  }

  // Fall back to department-level check for other assignment types
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
export async function getAccessiblePrograms(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get user
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return [];

  // Admin has access to all programs
  if (user.role === 'admin') {
    return await getAllPrograms();
  }

  // Get user assignments
  const assignments = await db
    .select()
    .from(userAssignments)
    .where(eq(userAssignments.userId, userId));

  if (assignments.length === 0) return [];

  const accessibleProgIds: number[] = [];

  for (const assignment of assignments) {
    if (assignment.assignmentType === 'university') {
      // University-level: all programs
      return await getAllPrograms();
    } else if (assignment.assignmentType === 'program' && assignment.programId) {
      // Program-level: specific program
      accessibleProgIds.push(assignment.programId);
    }
  }

  // Also include programs from accessible departments
  const accessibleDepts = await getAccessibleDepartments(userId);
  if (accessibleDepts.length > 0) {
    const deptIds = accessibleDepts.map(d => d.id);
    const deptProgs = await db
      .select({ id: programs.id })
      .from(programs)
      .where(inArray(programs.departmentId, deptIds));
    accessibleProgIds.push(...deptProgs.map(p => p.id));
  }

  // Remove duplicates
  const uniqueProgIds = Array.from(new Set(accessibleProgIds));
  
  if (uniqueProgIds.length === 0) return [];
  
  // Get enriched program data with counts
  const allPrograms = await getAllPrograms();
  return allPrograms.filter(p => uniqueProgIds.includes(p.program.id));
}

// ========================================
// Login History Functions
// ========================================

/**
 * Record a user login event
 */
export async function recordLoginHistory(data: InsertLoginHistory): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(loginHistory).values(data);
}

/**
 * Get all login history (admin only)
 */
export async function getAllLoginHistory(limit: number = 100): Promise<LoginHistory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select()
    .from(loginHistory)
    .orderBy(sql`${loginHistory.loginAt} DESC`)
    .limit(limit);

  return results;
}

/**
 * Get login history for a specific user
 */
export async function getLoginHistoryByUser(userId: number, limit: number = 50): Promise<LoginHistory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select()
    .from(loginHistory)
    .where(eq(loginHistory.userId, userId))
    .orderBy(sql`${loginHistory.loginAt} DESC`)
    .limit(limit);

  return results;
}

/**
 * Delete specific login history records by their IDs (admin only)
 */
export async function deleteLoginHistoryByIds(ids: number[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return 0;
  const result = await db
    .delete(loginHistory)
    .where(inArray(loginHistory.id, ids));
  return (result as any).affectedRows ?? 0;
}

/**
 * Delete login history records older than a given number of days (admin only)
 */
export async function deleteLoginHistoryOlderThan(days: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await db
    .delete(loginHistory)
    .where(sql`${loginHistory.loginAt} < ${cutoff}`);
  return (result as any).affectedRows ?? 0;
}

/**
 * Get the most recent login event per user from loginHistory.
 * Returns one row per userId with the latest loginAt, username, and loginMethod.
 */
export async function getLoginHistorySummaryPerUser(): Promise<
  { userId: number; username: string | null; lastLoginAt: Date; loginMethod: string | null }[]
> {
  const db = await getDb();
  if (!db) return [];
  // Use raw SQL subquery to get max loginAt per userId
  const rows = await db.execute(
    sql`SELECT userId, username, loginMethod, MAX(loginAt) AS lastLoginAt
        FROM loginHistory
        GROUP BY userId, username, loginMethod
        HAVING MAX(loginAt) = (
          SELECT MAX(loginAt) FROM loginHistory lh2 WHERE lh2.userId = loginHistory.userId
        )
        ORDER BY lastLoginAt DESC`
  ) as any;
  const result = Array.isArray(rows[0]) ? rows[0] : rows;
  return result.map((r: any) => ({
    userId: r.userId,
    username: r.username ?? null,
    lastLoginAt: r.lastLoginAt instanceof Date ? r.lastLoginAt : new Date(r.lastLoginAt),
    loginMethod: r.loginMethod ?? null,
  }));
}

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Update lastActiveAt on the most recent open login record (heartbeat)
 */
export async function heartbeatSession(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.execute(
    sql`UPDATE loginHistory SET lastActiveAt = NOW()
        WHERE userId = ${userId} AND logoutAt IS NULL
        ORDER BY loginAt DESC LIMIT 1`
  );
}

/**
 * Check if the user's session has been inactive for more than 2 hours.
 * If so, stamp logoutAt and return true (caller should clear the cookie).
 */
export async function checkAndExpireInactiveSession(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.execute(
    sql`SELECT id, loginAt, lastActiveAt FROM loginHistory
        WHERE userId = ${userId} AND logoutAt IS NULL
        ORDER BY loginAt DESC LIMIT 1`
  ) as any;
  const result = Array.isArray(rows[0]) ? rows[0] : rows;
  if (result.length === 0) return false;
  const row = result[0];
  const lastActivity: Date = row.lastActiveAt
    ? (row.lastActiveAt instanceof Date ? row.lastActiveAt : new Date(row.lastActiveAt))
    : (row.loginAt instanceof Date ? row.loginAt : new Date(row.loginAt));
  const inactiveDuration = Date.now() - lastActivity.getTime();
  if (inactiveDuration > INACTIVITY_TIMEOUT_MS) {
    // Stamp logoutAt
    await db.execute(
      sql`UPDATE loginHistory SET logoutAt = NOW() WHERE id = ${row.id}`
    );
    return true; // session expired
  }
  return false;
}

/**
 * Stamp logoutAt on the most recent login record for a user
 */
export async function stampLogoutForUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Find the most recent login record that has not yet been logged out
  const rows = await db.execute(
    sql`SELECT id FROM loginHistory WHERE userId = ${userId} AND logoutAt IS NULL ORDER BY loginAt DESC LIMIT 1`
  ) as any;
  const result = Array.isArray(rows[0]) ? rows[0] : rows;
  if (result.length === 0) return;
  const id = result[0].id;
  await db.execute(
    sql`UPDATE loginHistory SET logoutAt = NOW() WHERE id = ${id}`
  );
}

/**
 * Get login history with duration info for the Login Tracking page
 */
export async function getLoginHistoryWithDuration(limit: number = 500): Promise<{
  id: number;
  userId: number;
  username: string | null;
  ipAddress: string | null;
  loginMethod: string | null;
  loginAt: Date;
  logoutAt: Date | null;
  tokenExpiresAt: Date | null;
  lastActiveAt: Date | null;
}[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.execute(
    sql`SELECT id, userId, username, ipAddress, loginMethod, loginAt, logoutAt, tokenExpiresAt, lastActiveAt
        FROM loginHistory
        ORDER BY loginAt DESC
        LIMIT ${limit}`
  ) as any;
  const result = Array.isArray(rows[0]) ? rows[0] : rows;
  return result.map((r: any) => ({
    id: r.id,
    userId: r.userId,
    username: r.username ?? null,
    ipAddress: r.ipAddress ?? null,
    loginMethod: r.loginMethod ?? null,
    loginAt: r.loginAt instanceof Date ? r.loginAt : new Date(r.loginAt),
    logoutAt: r.logoutAt ? (r.logoutAt instanceof Date ? r.logoutAt : new Date(r.logoutAt)) : null,
    tokenExpiresAt: r.tokenExpiresAt ? (r.tokenExpiresAt instanceof Date ? r.tokenExpiresAt : new Date(r.tokenExpiresAt)) : null,
    lastActiveAt: r.lastActiveAt ? (r.lastActiveAt instanceof Date ? r.lastActiveAt : new Date(r.lastActiveAt)) : null,
  }));
}

// ============================================================================
export async function getLoginHistoryByUserId(userId: number, limit: number = 100): Promise<{
  id: number;
  ipAddress: string | null;
  loginMethod: string | null;
  loginAt: Date;
  logoutAt: Date | null;
}[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.execute(
    sql`SELECT id, ipAddress, loginMethod, loginAt, logoutAt
        FROM loginHistory
        WHERE userId = ${userId}
        ORDER BY loginAt DESC
        LIMIT ${limit}`
  ) as any;
  const result = Array.isArray(rows[0]) ? rows[0] : rows;
  return result.map((r: any) => ({
    id: r.id,
    ipAddress: r.ipAddress ?? null,
    loginMethod: r.loginMethod ?? null,
    loginAt: r.loginAt instanceof Date ? r.loginAt : new Date(r.loginAt),
    logoutAt: r.logoutAt ? (r.logoutAt instanceof Date ? r.logoutAt : new Date(r.logoutAt)) : null,
  }));
}

// Mapping Completeness Tracker
// ============================================================================
/**
 * Get per-program completeness: how many PLOs have at least one mapping
 */
export async function getProgramCompleteness(programIds?: number[]) {
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

  const filtered = programIds
    ? allPrograms.filter(p => programIds.includes(p.program.id))
    : allPrograms;

  const result = await Promise.all(
    filtered.map(async (item) => {
      const programPLOs = await db
        .select({ id: plos.id })
        .from(plos)
        .where(eq(plos.programId, item.program.id));

      const ploIds = programPLOs.map(p => p.id);
      let mappedPLOCount = 0;

      if (ploIds.length > 0) {
        // Count PLOs that have at least one mapping
        const mappedPLOs = await db
          .selectDistinct({ ploId: mappings.ploId })
          .from(mappings)
          .where(inArray(mappings.ploId, ploIds));
        mappedPLOCount = mappedPLOs.length;
      }

      const totalPLOs = programPLOs.length;
      const completenessRate = totalPLOs > 0 ? Math.round((mappedPLOCount / totalPLOs) * 100) : 0;

      return {
        programId: item.program.id,
        programName: item.program.nameEn,
        programCode: item.program.code,
        collegeName: item.college.nameEn,
        departmentName: item.department.nameEn,
        totalPLOs,
        mappedPLOs: mappedPLOCount,
        unmappedPLOs: totalPLOs - mappedPLOCount,
        completenessRate,
        isComplete: totalPLOs > 0 && mappedPLOCount === totalPLOs,
        hasNoPLOs: totalPLOs === 0,
      };
    })
  );

  return result;
}

// ============================================================================
// Mapping Audit Log (detailed per-mapping history)
// ============================================================================
/**
 * Log a mapping change with old/new weight values
 */
export async function logMappingAudit(data: {
  userId: number | null;
  programId: number;
  ploId: number;
  competencyId: number;
  action: 'create' | 'update' | 'delete';
  oldWeight?: string | null;
  newWeight?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values({
    userId: data.userId,
    action: data.action,
    entityType: 'mapping',
    entityId: data.ploId,
    details: JSON.stringify({
      programId: data.programId,
      ploId: data.ploId,
      competencyId: data.competencyId,
      oldWeight: data.oldWeight ?? null,
      newWeight: data.newWeight ?? null,
    }),
  });
}

/**
 * Get mapping audit log for a specific program
 */
export async function getMappingAuditLog(programId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  // Get all PLO ids for this program
  const programPLOs = await db
    .select({ id: plos.id })
    .from(plos)
    .where(eq(plos.programId, programId));

  if (programPLOs.length === 0) return [];

  const ploIds = programPLOs.map(p => p.id);

  // Fetch audit log entries for these PLOs (mapping type)
  const entries = await db
    .select({
      id: auditLog.id,
      userId: auditLog.userId,
      action: auditLog.action,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
      userName: users.name,
      userUsername: users.username,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .where(
      sql`${auditLog.entityType} = 'mapping' AND JSON_EXTRACT(${auditLog.details}, '$.programId') = ${programId}`
    )
    .orderBy(sql`${auditLog.createdAt} DESC`)
    .limit(limit);

  return entries.map(e => ({
    ...e,
    details: e.details ? JSON.parse(e.details) : null,
  }));
}

// ============================================================================
// Bulk PLO Import
// ============================================================================
/**
 * Bulk insert PLOs for a program, skipping duplicates by code
 */
export async function bulkCreatePLOs(programId: number, rows: Array<{
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get existing PLO codes for this program
  const existing = await db
    .select({ code: plos.code })
    .from(plos)
    .where(eq(plos.programId, programId));
  const existingCodes = new Set(existing.map(e => e.code.toLowerCase()));

  // Get current max sortOrder
  const maxSort = await db
    .select({ maxSort: sql<number>`MAX(${plos.sortOrder})` })
    .from(plos)
    .where(eq(plos.programId, programId));
  let nextSort = (maxSort[0]?.maxSort ?? 0) + 1;

  const toInsert = rows.filter(r => !existingCodes.has(r.code.toLowerCase()));
  const skipped = rows.length - toInsert.length;

  if (toInsert.length > 0) {
    await db.insert(plos).values(
      toInsert.map(r => ({
        programId,
        code: r.code.trim(),
        descriptionEn: r.descriptionEn?.trim() || null,
        descriptionAr: r.descriptionAr?.trim() || null,
        sortOrder: nextSort++,
      }))
    );
  }

  return { inserted: toInsert.length, skipped };
}

// getUserById already exists above (returns user with assignments)
