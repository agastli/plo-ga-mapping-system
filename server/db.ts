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
  type College,
  type Department,
  type Program,
  type GraduateAttribute,
  type Competency,
  type PLO,
  type Mapping,
  type Justification,
  type InsertCollege,
  type InsertDepartment,
  type InsertProgram,
  type InsertPLO,
  type InsertMapping,
  type InsertJustification,
  type InsertAuditLog,
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
