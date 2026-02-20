import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Colleges - Top level organizational unit
 */
export const colleges = mysqlTable("colleges", {
  id: int("id").autoincrement().primaryKey(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  code: varchar("code", { length: 50 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type College = typeof colleges.$inferSelect;
export type InsertCollege = typeof colleges.$inferInsert;

/**
 * Departments - Second level organizational unit
 */
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  collegeId: int("collegeId").notNull().references(() => colleges.id, { onDelete: "cascade" }),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  code: varchar("code", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueCode: unique().on(table.collegeId, table.code),
}));

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Programs - Academic programs within departments
 */
export const programs = mysqlTable("programs", {
  id: int("id").autoincrement().primaryKey(),
  departmentId: int("departmentId").notNull().references(() => departments.id, { onDelete: "cascade" }),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  code: varchar("code", { length: 50 }).notNull(),
  language: mysqlEnum("language", ["en", "ar", "both"]).notNull().default("en"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueCode: unique().on(table.departmentId, table.code),
}));

export type Program = typeof programs.$inferSelect;
export type InsertProgram = typeof programs.$inferInsert;

/**
 * Graduate Attributes - The 5 main attributes
 */
export const graduateAttributes = mysqlTable("graduateAttributes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(), // GA1, GA2, GA3, GA4, GA5
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").notNull(),
});

export type GraduateAttribute = typeof graduateAttributes.$inferSelect;
export type InsertGraduateAttribute = typeof graduateAttributes.$inferInsert;

/**
 * Competencies - The 21 competencies under the 5 GAs
 */
export const competencies = mysqlTable("competencies", {
  id: int("id").autoincrement().primaryKey(),
  gaId: int("gaId").notNull().references(() => graduateAttributes.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 10 }).notNull().unique(), // C1-1, C1-2, etc.
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").notNull(),
});

export type Competency = typeof competencies.$inferSelect;
export type InsertCompetency = typeof competencies.$inferInsert;

/**
 * Program Learning Outcomes (PLOs)
 */
export const plos = mysqlTable("plos", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull().references(() => programs.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }).notNull(), // PLO1, PLO2, etc.
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  sortOrder: int("sortOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueCode: unique().on(table.programId, table.code),
}));

export type PLO = typeof plos.$inferSelect;
export type InsertPLO = typeof plos.$inferInsert;

/**
 * Mappings - PLO to Competency mappings with weights
 */
export const mappings = mysqlTable("mappings", {
  id: int("id").autoincrement().primaryKey(),
  ploId: int("ploId").notNull().references(() => plos.id, { onDelete: "cascade" }),
  competencyId: int("competencyId").notNull().references(() => competencies.id, { onDelete: "cascade" }),
  weight: decimal("weight", { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueMapping: unique().on(table.ploId, table.competencyId),
}));

export type Mapping = typeof mappings.$inferSelect;
export type InsertMapping = typeof mappings.$inferInsert;

/**
 * Justifications - Organized by Graduate Attribute for each program
 */
export const justifications = mysqlTable("justifications", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull().references(() => programs.id, { onDelete: "cascade" }),
  gaId: int("gaId").notNull().references(() => graduateAttributes.id, { onDelete: "cascade" }),
  competencyId: int("competencyId").notNull().references(() => competencies.id, { onDelete: "cascade" }),
  textEn: text("textEn"),
  textAr: text("textAr"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueJustification: unique().on(table.programId, table.competencyId),
}));

export type Justification = typeof justifications.$inferSelect;
export type InsertJustification = typeof justifications.$inferInsert;

/**
 * Audit Log - Track all changes to mappings
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // program, plo, mapping, etc.
  entityId: int("entityId").notNull(),
  details: text("details"), // JSON string with change details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;
