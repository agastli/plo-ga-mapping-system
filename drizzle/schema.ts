import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 191 }).unique(),
  password: varchar("password", { length: 255 }), // bcrypt hash
  openid: varchar("openid", { length: 64 }).unique(), // Optional - for OAuth
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginmethod: varchar("loginmethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "viewer", "editor"]).default("viewer").notNull(),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
  lastsignedin: timestamp("lastsignedin").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User Assignments - Maps users to organizational units (college, cluster, department)
 * Determines what data a viewer/editor can access
 */
export const userAssignments = mysqlTable("userAssignments", {
  id: int("id").autoincrement().primaryKey(),
  userid: int("userid").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignmenttype: mysqlEnum("assignmenttype", ["university", "college", "cluster", "department"]).notNull(),
  // Only one of these will be set based on assignmentType
  collegeid: int("collegeid").references(() => colleges.id, { onDelete: "cascade" }),
  clusterid: int("clusterid").references(() => clusters.id, { onDelete: "cascade" }),
  departmentid: int("departmentid").references(() => departments.id, { onDelete: "cascade" }),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // Ensure user can only have one assignment per type
  uniqueUserAssignment: unique().on(table.userid, table.assignmenttype),
}));

export type UserAssignment = typeof userAssignments.$inferSelect;
export type InsertUserAssignment = typeof userAssignments.$inferInsert;

/**
 * Colleges - Top level organizational unit
 */
export const colleges = mysqlTable("colleges", {
  id: int("id").autoincrement().primaryKey(),
  nameen: varchar("nameen", { length: 255 }).notNull(),
  namear: varchar("namear", { length: 255 }),
  code: varchar("code", { length: 50 }).notNull().unique(),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
});

export type College = typeof colleges.$inferSelect;
export type InsertCollege = typeof colleges.$inferInsert;

/**
 * Clusters - Organizational units within colleges (e.g., CAS has SSH, LCT, SAS)
 * Optional - only some colleges use clusters
 */
export const clusters = mysqlTable("clusters", {
  id: int("id").autoincrement().primaryKey(),
  collegeid: int("collegeid").notNull().references(() => colleges.id, { onDelete: "cascade" }),
  nameen: varchar("nameen", { length: 255 }).notNull(),
  namear: varchar("namear", { length: 255 }),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueCode: unique().on(table.collegeid, table.code),
}));

export type Cluster = typeof clusters.$inferSelect;
export type InsertCluster = typeof clusters.$inferInsert;

/**
 * Departments - Second level organizational unit (or third level if cluster exists)
 */
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  collegeid: int("collegeid").notNull().references(() => colleges.id, { onDelete: "cascade" }),
  clusterid: int("clusterid").references(() => clusters.id, { onDelete: "set null" }), // Optional - null if college doesn't use clusters
  nameen: varchar("nameen", { length: 255 }).notNull(),
  namear: varchar("namear", { length: 255 }),
  code: varchar("code", { length: 50 }).notNull(),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueCode: unique().on(table.collegeid, table.code),
}));

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Programs - Academic programs within departments
 */
export const programs = mysqlTable("programs", {
  id: int("id").autoincrement().primaryKey(),
  departmentid: int("departmentid").notNull().references(() => departments.id, { onDelete: "cascade" }),
  nameen: varchar("nameen", { length: 255 }).notNull(),
  namear: varchar("namear", { length: 255 }),
  code: varchar("code", { length: 50 }).notNull(),
  language: mysqlEnum("language", ["en", "ar", "both"]).notNull().default("en"),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueCode: unique().on(table.departmentid, table.code),
}));

export type Program = typeof programs.$inferSelect;
export type InsertProgram = typeof programs.$inferInsert;

/**
 * Graduate Attributes - The 5 main attributes
 */
export const graduateattributes = mysqlTable("graduateattributes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(), // GA1, GA2, GA3, GA4, GA5
  nameen: varchar("nameen", { length: 255 }).notNull(),
  namear: varchar("namear", { length: 255 }).notNull(),
  sortorder: int("sortorder").notNull(),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
});

export type GraduateAttribute = typeof graduateattributes.$inferSelect;
export type InsertGraduateAttribute = typeof graduateattributes.$inferInsert;

/**
 * Competencies - The 21 competencies under the 5 GAs
 */
export const competencies = mysqlTable("competencies", {
  id: int("id").autoincrement().primaryKey(),
  gaid: int("gaid").notNull().references(() => graduateattributes.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 10 }).notNull().unique(), // C1-1, C1-2, etc.
  nameen: varchar("nameen", { length: 255 }).notNull(),
  namear: varchar("namear", { length: 255 }).notNull(),
  sortorder: int("sortorder").notNull(),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
});

export type Competency = typeof competencies.$inferSelect;
export type InsertCompetency = typeof competencies.$inferInsert;

/**
 * Program Learning Outcomes (PLOs)
 */
export const plos = mysqlTable("plos", {
  id: int("id").autoincrement().primaryKey(),
  programid: int("programid").notNull().references(() => programs.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }).notNull(), // PLO1, PLO2, etc.
  descriptionen: text("descriptionen"),
  descriptionar: text("descriptionar"),
  sortorder: int("sortorder").notNull(),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueCode: unique().on(table.programid, table.code),
}));

export type PLO = typeof plos.$inferSelect;
export type InsertPLO = typeof plos.$inferInsert;

/**
 * Mappings - PLO to Competency mappings with weights
 */
export const mappings = mysqlTable("mappings", {
  id: int("id").autoincrement().primaryKey(),
  ploid: int("ploid").notNull().references(() => plos.id, { onDelete: "cascade" }),
  competencyid: int("competencyid").notNull().references(() => competencies.id, { onDelete: "cascade" }),
  weight: decimal("weight", { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueMapping: unique().on(table.ploid, table.competencyid),
}));

export type Mapping = typeof mappings.$inferSelect;
export type InsertMapping = typeof mappings.$inferInsert;

/**
 * Justifications - One justification per program/GA/competency explaining the mapping
 */
export const justifications = mysqlTable("justifications", {
  id: int("id").autoincrement().primaryKey(),
  programid: int("programid").notNull().references(() => programs.id, { onDelete: "cascade" }),
  gaid: int("gaid").notNull().references(() => graduateattributes.id, { onDelete: "cascade" }),
  competencyid: int("competencyid").notNull().references(() => competencies.id, { onDelete: "cascade" }),
  texten: text("texten"),
  textar: text("textar"),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueJustification: unique().on(table.programid, table.gaid, table.competencyid),
}));

export type Justification = typeof justifications.$inferSelect;
export type InsertJustification = typeof justifications.$inferInsert;

/**
 * Audit Log - Track all changes to mappings
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  userid: int("userid").references(() => users.id, { onDelete: "set null" }),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  entitytype: varchar("entitytype", { length: 50 }).notNull(), // program, plo, mapping, etc.
  entityid: int("entityid").notNull(),
  details: text("details"), // JSON string with change details
  createdat: timestamp("createdat").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

/**
 * Report Templates - Custom export configurations
 */
export const reportTemplates = mysqlTable("reportTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userid: int("userid").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  format: mysqlEnum("format", ["pdf", "excel", "word", "csv"]).notNull(),
  // JSON configuration for metrics, charts, branding
  config: text("config").notNull(), // JSON string
  isPublic: int("isPublic").notNull().default(0), // 0 = private, 1 = public
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().onUpdateNow().notNull(),
});

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = typeof reportTemplates.$inferInsert;
