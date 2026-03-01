import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 191 }).unique(),
  password: varchar("password", { length: 255 }), // bcrypt hash
  openId: varchar("openId", { length: 64 }).unique(), // Optional - for OAuth
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "viewer", "editor"]).default("viewer").notNull(),
  resetToken: varchar("resetToken", { length: 255 }), // Password reset token
  resetTokenExpiry: timestamp("resetTokenExpiry"), // Token expiration time
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User Assignments - Maps users to organizational units (college, cluster, department)
 * Determines what data a viewer/editor can access
 */
export const userAssignments = mysqlTable("userAssignments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignmentType: mysqlEnum("assignmentType", ["university", "college", "cluster", "department", "program"]).notNull(),
  // Only one of these will be set based on assignmentType
  collegeId: int("collegeId").references(() => colleges.id, { onDelete: "cascade" }),
  clusterId: int("clusterId").references(() => clusters.id, { onDelete: "cascade" }),
  departmentId: int("departmentId").references(() => departments.id, { onDelete: "cascade" }),
  programId: int("programId").references(() => programs.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserAssignment = typeof userAssignments.$inferSelect;
export type InsertUserAssignment = typeof userAssignments.$inferInsert;

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
 * Clusters - Organizational units within colleges (e.g., CAS has SSH, LCT, SAS)
 * Optional - only some colleges use clusters
 */
export const clusters = mysqlTable("clusters", {
  id: int("id").autoincrement().primaryKey(),
  collegeId: int("collegeId").notNull().references(() => colleges.id, { onDelete: "cascade" }),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueCode: unique().on(table.collegeId, table.code),
}));

export type Cluster = typeof clusters.$inferSelect;
export type InsertCluster = typeof clusters.$inferInsert;

/**
 * Departments - Second level organizational unit (or third level if cluster exists)
 */
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  collegeId: int("collegeId").notNull().references(() => colleges.id, { onDelete: "cascade" }),
  clusterId: int("clusterId").references(() => clusters.id, { onDelete: "set null" }), // Optional - null if college doesn't use clusters
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
export const graduateAttributes = mysqlTable("graduateattributes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(), // GA1, GA2, GA3, GA4, GA5
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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
 * Justifications - One justification per program/GA/competency explaining the mapping
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
  uniqueJustification: unique().on(table.programId, table.gaId, table.competencyId),
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

/**
 * Report Templates - Custom export configurations
 */
export const reportTemplates = mysqlTable("reportTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  format: mysqlEnum("format", ["pdf", "excel", "word", "csv"]).notNull(),
  // JSON configuration for metrics, charts, branding
  config: text("config").notNull(), // JSON string
  isPublic: int("isPublic").notNull().default(0), // 0 = private, 1 = public
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = typeof reportTemplates.$inferInsert;

/**
 * Login History - Track user login activity for security and auditing
 */
export const loginHistory = mysqlTable("loginHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 191 }), // Denormalized for easier querying
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv6 max length
  userAgent: text("userAgent"), // Browser/device information
  loginMethod: varchar("loginMethod", { length: 64 }), // 'password' or 'oauth'
  loginAt: timestamp("loginAt").defaultNow().notNull(),
});

export type LoginHistory = typeof loginHistory.$inferSelect;
export type InsertLoginHistory = typeof loginHistory.$inferInsert;

/**
 * System Settings - Key-value store for configurable system parameters
 * e.g. mappingCoverageThreshold = 80 (percentage)
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 191 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").references(() => users.id, { onDelete: "set null" }),
});
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
