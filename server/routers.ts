import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, editorProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Use 'python' command (works on both Windows and Unix with proper PATH setup)
const PYTHON_CMD = 'python';

export const appRouter = router({
  system: systemRouter,
  
  // Health check endpoint
  health: router({
    check: publicProcedure.query(async () => {
      const checks = {
        timestamp: new Date().toISOString(),
        status: 'healthy' as 'healthy' | 'unhealthy',
        checks: {
          database: { status: 'unknown' as 'ok' | 'error' | 'unknown', message: '' },
          python: { status: 'unknown' as 'ok' | 'error' | 'unknown', message: '', version: '' },
          filesystem: { status: 'unknown' as 'ok' | 'error' | 'unknown', message: '' },
        },
      };

      // Check database connectivity
      try {
        await db.getAllColleges();
        checks.checks.database.status = 'ok';
        checks.checks.database.message = 'Database connection successful';
      } catch (error) {
        checks.checks.database.status = 'error';
        checks.checks.database.message = error instanceof Error ? error.message : 'Database connection failed';
        checks.status = 'unhealthy';
      }

      // Check Python availability and dependencies
      try {
        const { stdout } = await execAsync(`${PYTHON_CMD} --version`);
        checks.checks.python.status = 'ok';
        checks.checks.python.version = stdout.trim();
        
        // Check Python packages
        try {
          await execAsync(`${PYTHON_CMD} -c "import docx, openpyxl, reportlab"`);
          checks.checks.python.message = 'Python and required packages available';
        } catch (pkgError) {
          checks.checks.python.status = 'error';
          checks.checks.python.message = 'Python available but missing required packages (python-docx, openpyxl, reportlab)';
          checks.status = 'unhealthy';
        }
      } catch (error) {
        checks.checks.python.status = 'error';
        checks.checks.python.message = 'Python not available or not in PATH';
        checks.status = 'unhealthy';
      }

      // Check filesystem permissions
      try {
        const testFile = path.join(tmpdir(), `health-check-${Date.now()}.txt`);
        await writeFile(testFile, 'test');
        await unlink(testFile);
        checks.checks.filesystem.status = 'ok';
        checks.checks.filesystem.message = 'Filesystem read/write permissions OK';
      } catch (error) {
        checks.checks.filesystem.status = 'error';
        checks.checks.filesystem.message = 'Filesystem permission error';
        checks.status = 'unhealthy';
      }

      return checks;
    }),
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { authenticateUser } = await import('./auth.js');
        const user = await authenticateUser(input.username, input.password);
        
        if (!user) {
          throw new Error('Invalid username or password');
        }
        
        // Create session token (simplified - using JWT or session ID)
        const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { 
          ...cookieOptions, 
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        return { success: true, user };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User Management (Admin only)
  users: router({
    list: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),
    
    updateRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "viewer", "editor"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUserRole(input.userId, input.role);
        await db.logAudit({
          userId: ctx.user.id,
          action: "update",
          entityType: "user",
          entityId: input.userId,
          details: JSON.stringify({ role: input.role }),
        });
        return { success: true };
      }),
    
    createAssignment: adminProcedure
      .input(z.object({
        userId: z.number(),
        assignmentType: z.enum(["university", "college", "cluster", "department"]),
        collegeId: z.number().optional(),
        clusterId: z.number().optional(),
        departmentId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createUserAssignment(input);
        await db.logAudit({
          userId: ctx.user.id,
          action: "create",
          entityType: "userAssignment",
          entityId: id,
          details: JSON.stringify(input),
        });
        return { id };
      }),
    
    deleteAssignment: adminProcedure
      .input(z.object({ assignmentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteUserAssignment(input.assignmentId);
        await db.logAudit({
          userId: ctx.user.id,
          action: "delete",
          entityType: "userAssignment",
          entityId: input.assignmentId,
          details: JSON.stringify(input),
        });
        return { success: true };
      }),
    
    deleteAllAssignments: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteUserAssignments(input.userId);
        await db.logAudit({
          userId: ctx.user.id,
          action: "delete",
          entityType: "userAssignment",
          entityId: input.userId,
          details: JSON.stringify({ action: "deleteAll", targetUserId: input.userId }),
        });
        return { success: true };
      }),
    
    getAccessiblePrograms: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAccessiblePrograms(ctx.user.id);
    }),
  }),

  // Organizational structure
  colleges: router({
    list: publicProcedure.query(async () => {
      return await db.getAllColleges();
    }),
    create: publicProcedure
      .input(z.object({
        nameEn: z.string(),
        nameAr: z.string().optional(),
        code: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createCollege(input);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "create",
            entityType: "college",
            entityId: id,
            details: JSON.stringify(input),
          });
        }
        return { id };
      }),
  }),

  departments: router({
    list: publicProcedure.query(async () => {
      return await db.getAllDepartments();
    }),
    listByCollege: publicProcedure
      .input(z.object({ collegeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDepartmentsByCollege(input.collegeId);
      }),
    create: publicProcedure
      .input(z.object({
        collegeId: z.number(),
        nameEn: z.string(),
        nameAr: z.string().optional(),
        code: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createDepartment(input);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "create",
            entityType: "department",
            entityId: id,
            details: JSON.stringify(input),
          });
        }
        return { id };
      }),
  }),

  clusters: router({
    list: publicProcedure.query(async () => {
      return await db.getAllClusters();
    }),
    listByCollege: publicProcedure
      .input(z.object({ collegeId: z.number() }))
      .query(async ({ input }) => {
        try {
          console.log('[clusters.listByCollege] Fetching clusters for collegeId:', input.collegeId);
          const clusters = await db.getClustersByCollege(input.collegeId);
          console.log('[clusters.listByCollege] Found clusters:', clusters);
          return clusters;
        } catch (error) {
          console.error('[clusters.listByCollege] Error:', error);
          throw error;
        }
      }),
    create: publicProcedure
      .input(z.object({
        collegeId: z.number(),
        nameEn: z.string(),
        nameAr: z.string().optional(),
        code: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createCluster(input);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "create",
            entityType: "cluster",
            entityId: id,
            details: JSON.stringify(input),
          });
        }
        return { id };
      }),
  }),

  programs: router({
    list: publicProcedure.query(async () => {
      return await db.getAllPrograms();
    }),
    listByDepartment: publicProcedure
      .input(z.object({ departmentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProgramsByDepartment(input.departmentId);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProgramById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        departmentId: z.number(),
        nameEn: z.string(),
        nameAr: z.string().optional(),
        code: z.string(),
        language: z.enum(["en", "ar", "both"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createProgram(input);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "create",
            entityType: "program",
            entityId: id,
            details: JSON.stringify(input),
          });
        }
        return { id };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        departmentId: z.number().optional(),
        nameEn: z.string().optional(),
        nameAr: z.string().optional(),
        code: z.string().optional(),
        language: z.enum(["en", "ar", "both"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await db.updateProgram(id, data);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "update",
            entityType: "program",
            entityId: id,
            details: JSON.stringify(data),
          });
        }
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Delete program and all related data (cascading delete)
        await db.deleteProgram(input.id);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "delete",
            entityType: "program",
            entityId: input.id,
            details: JSON.stringify({ programId: input.id }),
          });
        }
        return { success: true };
      }),
  }),

  // Graduate Attributes & Competencies
  graduateAttributes: router({
    list: publicProcedure.query(async () => {
      return await db.getAllGraduateAttributes();
    }),
  }),

  competencies: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCompetencies();
    }),
    listByGA: publicProcedure
      .input(z.object({ gaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCompetenciesByGA(input.gaId);
      }),
  }),

  // PLOs
  plos: router({
    listByProgram: publicProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPLOsByProgram(input.programId);
      }),
    create: publicProcedure
      .input(z.object({
        programId: z.number(),
        code: z.string(),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        sortOrder: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createPLO(input);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "create",
            entityType: "plo",
            entityId: id,
            details: JSON.stringify(input),
          });
        }
        return { id };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await db.updatePLO(id, data);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "update",
            entityType: "plo",
            entityId: id,
            details: JSON.stringify(data),
          });
        }
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deletePLO(input.id);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "delete",
            entityType: "plo",
            entityId: input.id,
            details: null,
          });
        }
        return { success: true };
      }),
  }),

  // Mappings
  mappings: router({
    listByProgram: publicProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMappingsByProgram(input.programId);
      }),
    getMatrix: publicProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        // Get program details
        const program = await db.getProgramById(input.programId);
        if (!program) throw new Error("Program not found");
        
        // Get department, cluster, and college information
        const department = await db.getDepartmentById(program.departmentId);
        const college = department ? await db.getCollegeById(department.collegeId) : null;
        const cluster = department?.clusterId ? await db.getClusterById(department.clusterId) : null;
        
        // Get all PLOs for the program
        const plosData = await db.getPLOsByProgram(input.programId);
        
        // Get all competencies grouped by GA
        const allCompetencies = await db.getAllCompetencies();
        const allGAs = await db.getAllGraduateAttributes();

        
        // Get all mappings
        const mappingsData = await db.getMappingsByProgram(input.programId);

        
        // Get all justifications
        const justificationsData = await db.getJustificationsByProgram(input.programId);

        
        return {
          program,
          department,
          college,
          cluster,
          plos: plosData,
          competencies: allCompetencies,
          graduateAttributes: allGAs,
          mappings: mappingsData,
          justifications: justificationsData,
        };
      }),
    upsert: publicProcedure
      .input(z.object({
        ploId: z.number(),
        competencyId: z.number(),
        weight: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.upsertMapping(input.ploId, input.competencyId, input.weight);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "update",
            entityType: "mapping",
            entityId: input.ploId,
            details: JSON.stringify(input),
          });
        }
        return { success: true };
      }),
  }),

  // Justifications
  justifications: router({
    listByProgram: publicProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        return await db.getJustificationsByProgram(input.programId);
      }),
    upsert: publicProcedure
      .input(z.object({
        programId: z.number(),
        gaId: z.number(),
        competencyId: z.number(),
        textEn: z.string().optional(),
        textAr: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.upsertJustification(input);
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "update",
            entityType: "justification",
            entityId: input.programId,
            details: JSON.stringify(input),
          });
        }
        return { success: true };
      }),
  }),

  // Document parsing
  document: router({
    parse: publicProcedure
      .input(z.object({
        fileContent: z.string(), // Base64 encoded file content
        fileName: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Save file to temp location
        const tempPath = path.join(tmpdir(), `upload-${Date.now()}-${input.fileName}`);
        const buffer = Buffer.from(input.fileContent, 'base64');
        await writeFile(tempPath, buffer);

        try {
          // Call Python Excel parser
          const scriptPath = path.join(__dirname, '../scripts/parse_excel_plo_ga.py');
          const { stdout } = await execAsync(`${PYTHON_CMD} "${scriptPath}" "${tempPath}"`);
          const result = JSON.parse(stdout);
          // Clean up temp file
          await unlink(tempPath);
          return result;
        } catch (error) {
          // Clean up temp file on error
          try {
            await unlink(tempPath);
          } catch {}
          
          throw new Error(`Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
    
    import: publicProcedure
      .input(z.object({
        programId: z.number(),
        plos: z.array(z.object({
          code: z.string(),
          descriptionEn: z.string().nullable().optional(),
          descriptionAr: z.string().nullable().optional(),
          sortOrder: z.number(),
        })),
        mappings: z.array(z.object({
          ploCode: z.string(),
          competencyCode: z.string(),
          weight: z.number(),
        })),
        justifications: z.array(z.object({
          gaCode: z.string(),
          competencyCode: z.string(),
          textEn: z.string().nullable().optional(),
          textAr: z.string().nullable().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get existing PLOs for this program
        const existingPLOs = await db.getPLOsByProgram(input.programId);
        const existingPLOCodes = new Set(existingPLOs.map(p => p.code));
        const newPLOCodes = new Set(input.plos.map(p => p.code));
        
        // Delete PLOs that are no longer in the document
        for (const existingPLO of existingPLOs) {
          if (!newPLOCodes.has(existingPLO.code)) {
            await db.deletePLO(existingPLO.id);
          }
        }
        
        // Upsert PLOs (update existing or create new)
        const ploMap = new Map<string, number>();
        for (const ploData of input.plos) {
          const id = await db.upsertPLO({
            programId: input.programId,
            code: ploData.code,
            descriptionEn: ploData.descriptionEn ?? '',
            descriptionAr: ploData.descriptionAr ?? '',
            sortOrder: ploData.sortOrder,
          });
          ploMap.set(ploData.code, id);
        }

        // Get competency IDs
        const allCompetencies = await db.getAllCompetencies();
        const competencyMap = new Map(allCompetencies.map(c => [c.code, c.id]));

        // Create a map of parsed mappings for quick lookup
        const parsedMappingsMap = new Map<string, number>();
        for (const mapping of input.mappings) {
          const key = `${mapping.ploCode}-${mapping.competencyCode}`;
          parsedMappingsMap.set(key, mapping.weight);
        }

        // Generate full mapping matrix (all PLOs × all 21 competencies)
        const ploEntries = Array.from(ploMap.entries());
        const compEntries = Array.from(competencyMap.entries());
        
        for (let i = 0; i < ploEntries.length; i++) {
          const [ploCode, ploId] = ploEntries[i];
          for (let j = 0; j < compEntries.length; j++) {
            const [compCode, competencyId] = compEntries[j];
            const key = `${ploCode}-${compCode}`;
            // Use parsed weight if exists, otherwise default to 0.0
            const weight = parsedMappingsMap.get(key) ?? 0.0;
            await db.upsertMapping(ploId, competencyId, weight.toString());
          }
        }

        // Get GA IDs
        const allGAs = await db.getAllGraduateAttributes();
        const gaMap = new Map(allGAs.map(ga => [ga.code, ga.id]));

        // Create justifications (competency-based)
        for (const justification of input.justifications) {
          const gaId = gaMap.get(justification.gaCode);
          const competencyId = competencyMap.get(justification.competencyCode);
          
          if (gaId && competencyId) {
            await db.upsertJustification({
              programId: input.programId,
              gaId,
              competencyId,
              textEn: justification.textEn ?? '',
              textAr: justification.textAr ?? '',
            });
          }
        }

        // Log audit if user is authenticated
        if (ctx.user) {
          await db.logAudit({
            userId: ctx.user.id,
            action: "create",
            entityType: "program_import",
            entityId: input.programId,
            details: JSON.stringify({ ploCount: input.plos.length, mappingCount: input.mappings.length }),
          });
        }

        return { success: true };
      }),
  }),

  // Export
  export: router({  
    generate: publicProcedure
      .input(z.object({ 
        programId: z.number(),
        format: z.enum(['word', 'excel', 'pdf'])
      }))
      .mutation(async ({ input }) => {
        // Helper function to abbreviate program name for filename
        const abbreviateProgramName = (name: string): string => {
          // Remove common words and create abbreviation
          const cleaned = name
            .replace(/Bachelor of Science in /gi, 'BS-')
            .replace(/Bachelor of Arts in /gi, 'BA-')
            .replace(/Master of Science in /gi, 'MS-')
            .replace(/Master of Arts in /gi, 'MA-')
            .replace(/Doctor of Philosophy in /gi, 'PhD-')
            .replace(/[^a-zA-Z0-9\s-]/g, '')  // Remove special characters
            .replace(/\s+/g, '-')  // Replace spaces with hyphens
            .substring(0, 50);  // Limit length
          return cleaned || 'program';
        };
        
        // Helper function to get college abbreviation
        const getCollegeAbbreviation = (collegeName: string): string => {
          // Extract abbreviation from college name
          // Examples: "College of Engineering" -> "CENG", "College of Education" -> "CEDU"
          const match = collegeName.match(/College of (\w+)/);
          if (match) {
            const word = match[1];
            return 'C' + word.substring(0, 3).toUpperCase();
          }
          // Fallback: take first 4 letters
          return collegeName.substring(0, 4).toUpperCase();
        };
        
        // Get all data for the program
        const program = await db.getProgramById(input.programId);
        if (!program) throw new Error("Program not found");
        
        const department = await db.getDepartmentById(program.departmentId);
        const college = department ? await db.getCollegeById(department.collegeId) : null;
        
        const plos = await db.getPLOsByProgram(input.programId);
        const allCompetencies = await db.getAllCompetencies();
        const allGAs = await db.getAllGraduateAttributes();
        const mappings = await db.getMappingsByProgram(input.programId);
        const justifications = await db.getJustificationsByProgram(input.programId);
        
        // Organize data for export
        const exportData = {
          program_name: program.nameEn || program.nameAr,
          college_name: college?.nameEn || 'Unknown College',
          department_name: department?.nameEn || 'Unknown Department',
          language: program.language === 'en' ? 'English' : program.language === 'ar' ? 'Arabic' : 'Both',
          last_updated: program.updatedAt ? new Date(program.updatedAt).toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : 'N/A',
          logo_path: path.join(__dirname, '../client/public/qu-logo.png'),  // QU logo from project root
          plos: plos.map(plo => ({
            code: plo.code,
            description: plo.descriptionEn || plo.descriptionAr || '',
            mappings: Object.fromEntries(
              mappings
                .filter(m => m.mapping.ploId === plo.id)
                .map(m => [m.competency.code, m.mapping.weight])
            )
          })),
          gas: allGAs.map(ga => ({
            code: ga.code,
            name: ga.nameEn,
            competencies: allCompetencies
              .filter(c => c.gaId === ga.id)
              .map(c => ({ code: c.code, name: c.nameEn }))
          })),
          total_mappings: mappings.length,
          justifications: justifications.map(j => ({
            ga_code: j.ga.code,
            competency_code: j.competency.code,
            competency_name: j.competency.nameEn || j.competency.nameAr || '',
            text: j.justification.textEn || j.justification.textAr || ''
          })),
          output_path: path.join(__dirname, '../temp', `plo-ga-mapping-${getCollegeAbbreviation(college?.nameEn || college?.nameAr || 'College')}-${abbreviateProgramName(program.nameEn || program.nameAr || 'program')}-${Date.now()}.${input.format === 'word' ? 'docx' : input.format === 'excel' ? 'xlsx' : 'pdf'}`)
        };
        
        // Call Python script to generate document
        const scriptName = input.format === 'word' ? 'export-to-word.py' : 
                          input.format === 'excel' ? 'export-to-excel.py' : 
                          'export-to-pdf.py';
        const scriptPath = path.join(__dirname, '../scripts', scriptName);
        
        // Write data to temp file to avoid command line length limits
        const tempDataPath = path.join(tmpdir(), `export-data-${Date.now()}.json`);
        await writeFile(tempDataPath, JSON.stringify(exportData));
        
        try {
          console.log('=== Export Debug Info ===');
          console.log('Script path:', scriptPath);
          console.log('Temp data path:', tempDataPath);
          console.log('Python command:', `python "${scriptPath}" "${tempDataPath}"`);
          
          // Call Python script with temp file path (same approach as upload/parse)
          const { stdout, stderr } = await execAsync(`python "${scriptPath}" "${tempDataPath}"`);
          
          console.log('Python stdout:', stdout);
          console.log('Python stderr:', stderr);
          
          const result = JSON.parse(stdout);
          
          // Clean up temp file
          await unlink(tempDataPath);
          
          if (result.error) {
            console.error('Python script returned error:', result.error);
            throw new Error(result.error);
          }
          
          console.log('Export successful, output path:', result.output_path);
          return { filePath: result.output_path };
        } catch (error) {
          console.error('=== Export Error ===');
          console.error('Error details:', error);
          console.error('Error message:', error instanceof Error ? error.message : String(error));
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          
          // Clean up temp file on error
          await unlink(tempDataPath).catch(() => {});
          throw error;
        }
      }),
  }),

  // Analytics
  analytics: router({
    universityOverview: publicProcedure.query(async () => {
      return await db.getUniversityAnalytics();
    }),
    
    collegeAnalytics: publicProcedure
      .input(z.object({ collegeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCollegeAnalytics(input.collegeId);
      }),
    
    departmentAnalytics: publicProcedure
      .input(z.object({ departmentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDepartmentAnalytics(input.departmentId);
      }),
    
    clusterAnalytics: publicProcedure
      .input(z.object({ clusterId: z.number() }))
      .query(async ({ input }) => {
        return await db.getClusterAnalytics(input.clusterId);
      }),
    
    programAnalytics: publicProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProgramAnalytics(input.programId);
      }),
    
    // Graduate Attribute Analytics
    gaAnalytics: publicProcedure
      .input(z.object({
        collegeId: z.number().optional(),
        clusterId: z.number().optional(),
        programId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        if (!input || (!input.collegeId && !input.clusterId && !input.programId)) {
          return await db.getGAAnalytics();
        }
        return await db.getFilteredGAAnalytics(input);
      }),
    
    gaByCollegeAnalytics: publicProcedure.query(async () => {
      return await db.getGAByCollegeAnalytics();
    }),
    
    gaByProgramAnalytics: publicProcedure
      .input(z.object({ collegeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getGAByProgramAnalytics(input.collegeId);
      }),
    
    // Competency Analytics
    competencyAnalytics: publicProcedure
      .input(z.object({
        collegeId: z.number().optional(),
        clusterId: z.number().optional(),
        programId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        if (!input || (!input.collegeId && !input.clusterId && !input.programId)) {
          return await db.getCompetencyAnalytics();
        }
        return await db.getFilteredCompetencyAnalytics(input);
      }),
    
    competencyByDepartmentAnalytics: publicProcedure.query(async () => {
      return await db.getCompetencyByDepartmentAnalytics();
    }),
    
    // Data Completeness
    completenessStats: publicProcedure.query(async () => {
      return await db.getDataCompletenessStats();
    }),
    
    validateData: publicProcedure.query(async () => {
      return await db.validateAllProgramsData();
    }),
    
    // Export endpoints
    exportToPDF: publicProcedure
      .input(z.object({
        data: z.object({
          title: z.string(),
          metrics: z.array(z.object({ label: z.string(), value: z.any() })),
          table_data: z.array(z.array(z.string())),
          chart_images: z.array(z.object({ title: z.string(), imageData: z.string() })).optional(),
          timestamp: z.string().optional(),
          filter_context: z.object({
            level: z.string(),
            college_name: z.string().optional(),
            program_name: z.string().optional(),
          }).optional(),
          color_legend: z.object({
            green: z.string(),
            yellow: z.string(),
            red: z.string(),
          }).optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const tempInputFile = path.join(tmpdir(), `analytics-export-${Date.now()}.json`);
        const outputPath = path.join(tmpdir(), `analytics-report-${Date.now()}.pdf`);
        const logoPath = path.join(__dirname, '../client/public/qu-logo.png');
        
        // Save chart images if provided
        const chartImagePaths: Array<{ title: string; path: string }> = [];
        if (input.data.chart_images && input.data.chart_images.length > 0) {
          for (let i = 0; i < input.data.chart_images.length; i++) {
            const chart = input.data.chart_images[i];
            const chartImagePath = path.join(tmpdir(), `chart-${Date.now()}-${i}.png`);
            const base64Data = chart.imageData.split(',')[1];
            await writeFile(chartImagePath, Buffer.from(base64Data, 'base64'));
            chartImagePaths.push({ title: chart.title, path: chartImagePath });
          }
        }
        
        const exportData = {
          data: {
            ...input.data,
            chart_images: chartImagePaths, // Array of {title, path}
          },
          output_path: outputPath,
          logo_path: logoPath,
        };
        
        await writeFile(tempInputFile, JSON.stringify(exportData));
        
        try {
          const scriptPath = path.join(__dirname, '../scripts/export-analytics-to-pdf.py');
          const { stdout, stderr } = await execAsync(`${PYTHON_CMD} "${scriptPath}" "${tempInputFile}"`);
          
          if (stderr) {
            console.error('Python stderr:', stderr);
          }
          
          const result = JSON.parse(stdout.trim());
          
          if (!result.success) {
            throw new Error(result.error || 'Export failed');
          }
          
          // Cleanup temp files (but keep the output PDF for download)
          await unlink(tempInputFile).catch(() => {});
          for (const chart of chartImagePaths) {
            await unlink(chart.path).catch(() => {});
          }
          
          // Return file path for frontend to download
          return { filePath: outputPath };
        } catch (error) {
          await unlink(tempInputFile).catch(() => {});
          throw error;
        }
      }),
    
    exportToExcel: publicProcedure
      .input(z.object({
        data: z.object({
          title: z.string(),
          metrics: z.array(z.object({ label: z.string(), value: z.any() })),
          table_data: z.array(z.array(z.string())),
          timestamp: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const tempInputFile = path.join(tmpdir(), `analytics-export-${Date.now()}.json`);
        const outputPath = path.join(tmpdir(), `analytics-report-${Date.now()}.xlsx`);
        const logoPath = path.join(__dirname, '../client/public/qu-logo.png');
        
        const exportData = {
          data: input.data,
          output_path: outputPath,
          logo_path: logoPath,
        };
        
        await writeFile(tempInputFile, JSON.stringify(exportData));
        
        try {
          const scriptPath = path.join(__dirname, '../scripts/export-analytics-to-excel.py');
          const { stdout, stderr } = await execAsync(`${PYTHON_CMD} "${scriptPath}" "${tempInputFile}"`);
          
          if (stderr) {
            console.error('Python stderr:', stderr);
          }
          
          const result = JSON.parse(stdout.trim());
          
          if (!result.success) {
            throw new Error(result.error || 'Export failed');
          }
          
          // Cleanup temp files (but keep the output Excel for download)
          await unlink(tempInputFile).catch(() => {});
          
          // Return file path for frontend to download
          return { filePath: outputPath };
        } catch (error) {
          await unlink(tempInputFile).catch(() => {});
          throw error;
        }
      }),
    
    exportToWord: publicProcedure
      .input(z.object({
        data: z.object({
          title: z.string(),
          metrics: z.array(z.object({ label: z.string(), value: z.any() })),
          table_data: z.array(z.array(z.string())),
          chart_images: z.array(z.object({ title: z.string(), imageData: z.string() })).optional(),
          timestamp: z.string().optional(),
          filter_context: z.object({
            level: z.string(),
            college_name: z.string().optional(),
            program_name: z.string().optional(),
          }).optional(),
          color_legend: z.object({
            green: z.string(),
            yellow: z.string(),
            red: z.string(),
          }).optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const tempInputFile = path.join(tmpdir(), `analytics-export-${Date.now()}.json`);
        const outputPath = path.join(tmpdir(), `analytics-report-${Date.now()}.docx`);
        const logoPath = path.join(__dirname, '../client/public/qu-logo.png');
        
        // Save chart images if provided
        const chartImagePaths: Array<{ title: string; path: string }> = [];
        if (input.data.chart_images && input.data.chart_images.length > 0) {
          for (let i = 0; i < input.data.chart_images.length; i++) {
            const chart = input.data.chart_images[i];
            const chartImagePath = path.join(tmpdir(), `chart-${Date.now()}-${i}.png`);
            const base64Data = chart.imageData.split(',')[1];
            await writeFile(chartImagePath, Buffer.from(base64Data, 'base64'));
            chartImagePaths.push({ title: chart.title, path: chartImagePath });
          }
        }
        
        const exportData = {
          data: {
            ...input.data,
            chart_images: chartImagePaths, // Array of {title, path}
          },
          output_path: outputPath,
          logo_path: logoPath,
        };
        
        await writeFile(tempInputFile, JSON.stringify(exportData));
        
        try {
          const scriptPath = path.join(__dirname, '../scripts/export-analytics-to-word.py');
          const { stdout, stderr } = await execAsync(`${PYTHON_CMD} "${scriptPath}" "${tempInputFile}"`);
          
          if (stderr) {
            console.error('Python stderr:', stderr);
          }
          
           const result = JSON.parse(stdout.trim());
          
          if (!result.success) {
            throw new Error(result.error || 'Export failed');
          }
          
          // Cleanup temp files (but keep the output Word doc for download)
          await unlink(tempInputFile).catch(() => {});
          for (const chart of chartImagePaths) {
            await unlink(chart.path).catch(() => {});
          }
          
          // Return file path for frontend to download
          return { filePath: outputPath };
        } catch (error) {
          await unlink(tempInputFile).catch(() => {});
          throw error;
        }
      }),
    
    exportToCSV: publicProcedure
      .input(z.object({
        data: z.object({
          title: z.string(),
          metrics: z.array(z.object({ label: z.string(), value: z.any() })),
          table_data: z.array(z.array(z.string())),
          timestamp: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const tempInputFile = path.join(tmpdir(), `analytics-export-${Date.now()}.json`);
        const outputPath = path.join(tmpdir(), `analytics-report-${Date.now()}.csv`);
        
        const exportData = {
          data: input.data,
          output_path: outputPath,
        };
        
        await writeFile(tempInputFile, JSON.stringify(exportData));
        
        try {
          const scriptPath = path.join(__dirname, '../scripts/export-analytics-to-csv.py');
          const { stdout, stderr } = await execAsync(`${PYTHON_CMD} "${scriptPath}" "${tempInputFile}"`);
          
          if (stderr) {
            console.error('Python stderr:', stderr);
          }
          
          const result = JSON.parse(stdout.trim());
          
          if (!result.success) {
            throw new Error(result.error || 'Export failed');
          }
          
          // Cleanup temp files (but keep the output CSV for download)
          await unlink(tempInputFile).catch(() => {});
          
          // Return file path for frontend to download
          return { filePath: outputPath };
        } catch (error) {
          await unlink(tempInputFile).catch(() => {});
          throw error;
        }
      }),
    
    exportAnalyticsPNG: publicProcedure
      .input(z.object({
        chartImages: z.array(z.object({
          title: z.string(),
          imageData: z.string(), // base64 encoded PNG
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const timestamp = Date.now();
        const outputFiles: Array<{ name: string; path: string }> = [];
        
        try {
          // Save each chart image to temp directory
          for (const chart of input.chartImages) {
            const filename = `${chart.title}_${timestamp}.png`;
            const outputPath = path.join(process.cwd(), 'temp', filename);
            const base64Data = chart.imageData.split(',')[1]; // Remove data:image/png;base64, prefix
            await writeFile(outputPath, Buffer.from(base64Data, 'base64'));
            outputFiles.push({
              name: filename,
              path: outputPath,
            });
          }
          
          // Return file paths for frontend to download
          return { files: outputFiles };
        } catch (error) {
          // Cleanup on error
          for (const file of outputFiles) {
            await unlink(file.path).catch(() => {});
          }
          throw error;
        }
      }),

    exportAnalyticsPDF: publicProcedure
      .input(z.object({
        title: z.string(),
        filterContext: z.object({
          collegeName: z.string().optional(),
          programName: z.string().optional(),
        }).optional(),
        metrics: z.array(z.object({
          label: z.string(),
          value: z.any(),
        })),
        chartImages: z.array(z.object({
          title: z.string(),
          imageData: z.string(),
        })),
        tableData: z.array(z.array(z.string())).optional(),
        competencyTableData: z.array(z.array(z.string())).optional(),
        colorLegend: z.object({
          green: z.string(),
          yellow: z.string(),
          red: z.string(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const timestamp = Date.now();
        const tempChartPaths: string[] = [];
        
        try {
          // Save chart images to temp files
          const chartImagePaths = [];
          for (const chart of input.chartImages) {
            const chartPath = path.join(process.cwd(), 'temp', `chart_${timestamp}_${chartImagePaths.length}.png`);
            const base64Data = chart.imageData.split(',')[1];
            await writeFile(chartPath, Buffer.from(base64Data, 'base64'));
            tempChartPaths.push(chartPath);
            chartImagePaths.push({
              title: chart.title,
              path: chartPath,
            });
          }
          
          const exportData = {
            title: input.title,
            timestamp: new Date().toLocaleString(),
            filter_context: input.filterContext ? {
              college_name: input.filterContext.collegeName || 'All',
              program_name: input.filterContext.programName || 'All',
            } : undefined,
            metrics: input.metrics,
            chart_images: chartImagePaths,
            table_data: input.tableData,
            competency_table_data: input.competencyTableData,
            color_legend: input.colorLegend,
          };
          
          const outputPath = path.join(process.cwd(), 'temp', `analytics_${timestamp}.pdf`);
          const logoPath = path.join(__dirname, '../client/public/qu-logo.png');
          const tempInputFile = path.join(tmpdir(), `analytics-pdf-${timestamp}.json`);
          
          await writeFile(tempInputFile, JSON.stringify({
            data: exportData,
            output_path: outputPath,
            logo_path: logoPath,
          }));
          
          const scriptPath = path.join(__dirname, '../scripts/export-analytics-to-pdf.py');
          const { stdout, stderr } = await execAsync(`${PYTHON_CMD} "${scriptPath}" "${tempInputFile}"`);
          
          await unlink(tempInputFile).catch(() => {});
          for (const chartPath of tempChartPaths) {
            await unlink(chartPath).catch(() => {});
          }
          
          const result = JSON.parse(stdout.trim());
          if (!result.success) {
            throw new Error(result.error || 'PDF generation failed');
          }
          
          return {
            success: true,
            filename: `analytics_${timestamp}.pdf`,
            path: outputPath,
          };
        } catch (error) {
          for (const chartPath of tempChartPaths) {
            await unlink(chartPath).catch(() => {});
          }
          throw error;
        }
      }),

    exportAnalyticsWord: publicProcedure
      .input(z.object({
        title: z.string(),
        filterContext: z.object({
          collegeName: z.string().optional(),
          programName: z.string().optional(),
        }).optional(),
        metrics: z.array(z.object({
          label: z.string(),
          value: z.any(),
        })),
        chartImages: z.array(z.object({
          title: z.string(),
          imageData: z.string(),
        })),
        tableData: z.array(z.array(z.string())).optional(),
        competencyTableData: z.array(z.array(z.string())).optional(),
        colorLegend: z.object({
          green: z.string(),
          yellow: z.string(),
          red: z.string(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const timestamp = Date.now();
        const tempChartPaths: string[] = [];
        
        try {
          const chartImagePaths = [];
          for (const chart of input.chartImages) {
            const chartPath = path.join(process.cwd(), 'temp', `chart_${timestamp}_${chartImagePaths.length}.png`);
            const base64Data = chart.imageData.split(',')[1];
            await writeFile(chartPath, Buffer.from(base64Data, 'base64'));
            tempChartPaths.push(chartPath);
            chartImagePaths.push({
              title: chart.title,
              path: chartPath,
            });
          }
          
          const exportData = {
            title: input.title,
            timestamp: new Date().toLocaleString(),
            filter_context: input.filterContext ? {
              college_name: input.filterContext.collegeName || 'All',
              program_name: input.filterContext.programName || 'All',
            } : undefined,
            metrics: input.metrics,
            chart_images: chartImagePaths,
            table_data: input.tableData,
            competency_table_data: input.competencyTableData,
            color_legend: input.colorLegend,
          };
          
          const outputPath = path.join(process.cwd(), 'temp', `analytics_${timestamp}.docx`);
          const logoPath = path.join(__dirname, '../client/public/qu-logo.png');
          const tempInputFile = path.join(tmpdir(), `analytics-word-${timestamp}.json`);
          
          await writeFile(tempInputFile, JSON.stringify({
            data: exportData,
            output_path: outputPath,
            logo_path: logoPath,
          }));
          
          const scriptPath = path.join(__dirname, '../scripts/export-analytics-to-word.py');
          const { stdout, stderr } = await execAsync(`${PYTHON_CMD} "${scriptPath}" "${tempInputFile}"`);
          
          await unlink(tempInputFile).catch(() => {});
          for (const chartPath of tempChartPaths) {
            await unlink(chartPath).catch(() => {});
          }
          
          const result = JSON.parse(stdout.trim());
          if (!result.success) {
            throw new Error(result.error || 'Word generation failed');
          }
          
          return {
            success: true,
            filename: `analytics_${timestamp}.docx`,
            path: outputPath,
          };
        } catch (error) {
          for (const chartPath of tempChartPaths) {
            await unlink(chartPath).catch(() => {});
          }
          throw error;
        }
      }),

    exportAnalyticsExcel: publicProcedure
      .input(z.object({
        title: z.string(),
        filterContext: z.object({
          collegeName: z.string().optional(),
          programName: z.string().optional(),
        }).optional(),
        metrics: z.array(z.object({
          label: z.string(),
          value: z.any(),
        })),
        tableData: z.array(z.array(z.string())),
        competencyTableData: z.array(z.array(z.string())).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const timestamp = Date.now();
        
        try {
          const exportData = {
            title: input.title,
            timestamp: new Date().toLocaleString(),
            filter_context: input.filterContext ? {
              college_name: input.filterContext.collegeName || 'All',
              program_name: input.filterContext.programName || 'All',
            } : undefined,
            metrics: input.metrics,
            table_data: input.tableData,
            competency_table_data: input.competencyTableData,
          };
          
          const outputPath = path.join(process.cwd(), 'temp', `analytics_${timestamp}.xlsx`);
          const tempInputFile = path.join(tmpdir(), `analytics-excel-${timestamp}.json`);
          
          await writeFile(tempInputFile, JSON.stringify({
            data: exportData,
            output_path: outputPath,
          }));
          
          const scriptPath = path.join(__dirname, '../scripts/export-analytics-to-excel.py');
          const { stdout, stderr } = await execAsync(`${PYTHON_CMD} "${scriptPath}" "${tempInputFile}"`);
          
          await unlink(tempInputFile).catch(() => {});
          
          const result = JSON.parse(stdout.trim());
          if (!result.success) {
            throw new Error(result.error || 'Excel generation failed');
          }
          
          return {
            success: true,
            filename: `analytics_${timestamp}.xlsx`,
            path: outputPath,
          };
        } catch (error) {
          throw error;
        }
      }),
    
    batchExport: publicProcedure
      .input(z.object({
        entities: z.array(z.object({
          title: z.string(),
          data: z.object({
            title: z.string(),
            metrics: z.array(z.object({ label: z.string(), value: z.any() })),
            table_data: z.array(z.array(z.string())),
            chart_image_data: z.string().optional(),
            timestamp: z.string().optional(),
          }),
        })),
        format: z.enum(['pdf', 'excel', 'word', 'csv']),
      }))
      .mutation(async ({ input, ctx }) => {
        const tempInputFile = path.join(tmpdir(), `analytics-batch-${Date.now()}.json`);
        const outputPath = path.join(tmpdir(), `analytics-batch-${Date.now()}.zip`);
        const logoPath = path.join(__dirname, '../client/public/qu-logo.png');
        
        const exportData = {
          entities: input.entities,
          format: input.format,
          output_path: outputPath,
          logo_path: logoPath,
        };
        
        await writeFile(tempInputFile, JSON.stringify(exportData));
        
        try {
          const scriptPath = path.join(__dirname, '../scripts/export-analytics-batch.py');
          const { stdout, stderr } = await execAsync(`${PYTHON_CMD} "${scriptPath}" "${tempInputFile}"`);
          
          if (stderr) {
            console.error('Python stderr:', stderr);
          }
          
          const result = JSON.parse(stdout.trim());
          
          if (!result.success) {
            throw new Error(result.error || 'Batch export failed');
          }
          
          // Cleanup temp files (but keep the output ZIP for download)
          await unlink(tempInputFile).catch(() => {});
          
          // Return file path for frontend to download
          return { 
            filePath: outputPath,
            filesExported: result.files_exported 
          };
        } catch (error) {
          await unlink(tempInputFile).catch(() => {});
          throw error;
        }
      }),
  }),

  // Report Templates
  templates: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const userTemplates = await db.getReportTemplatesByUser(ctx.user.id);
      const publicTemplates = await db.getPublicReportTemplates();
      
      return {
        userTemplates: userTemplates.map(t => ({
          ...t,
          config: JSON.parse(t.config),
        })),
        publicTemplates: publicTemplates.map(t => ({
          ...t,
          config: JSON.parse(t.config),
        })),
      };
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const template = await db.getReportTemplateById(input.id);
        if (!template) throw new Error("Template not found");
        
        return {
          ...template,
          config: JSON.parse(template.config),
        };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        format: z.enum(["pdf", "excel", "word", "csv"]),
        config: z.object({
          includeCharts: z.boolean(),
          includeMetrics: z.boolean(),
          includeTables: z.boolean(),
          includeTimestamp: z.boolean(),
          customBranding: z.object({
            headerText: z.string().optional(),
            footerText: z.string().optional(),
          }).optional(),
        }),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createReportTemplate({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          format: input.format,
          config: JSON.stringify(input.config),
          isPublic: input.isPublic ? 1 : 0,
        });
        
        return { id: result.insertId };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        format: z.enum(["pdf", "excel", "word", "csv"]).optional(),
        config: z.object({
          includeCharts: z.boolean(),
          includeMetrics: z.boolean(),
          includeTables: z.boolean(),
          includeTimestamp: z.boolean(),
          customBranding: z.object({
            headerText: z.string().optional(),
            footerText: z.string().optional(),
          }).optional(),
        }).optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const template = await db.getReportTemplateById(input.id);
        if (!template) throw new Error("Template not found");
        if (template.userId !== ctx.user.id) throw new Error("Unauthorized");
        
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.format) updateData.format = input.format;
        if (input.config) updateData.config = JSON.stringify(input.config);
        if (input.isPublic !== undefined) updateData.isPublic = input.isPublic ? 1 : 0;
        
        await db.updateReportTemplate(input.id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const template = await db.getReportTemplateById(input.id);
        if (!template) throw new Error("Template not found");
        if (template.userId !== ctx.user.id) throw new Error("Unauthorized");
        
        await db.deleteReportTemplate(input.id);
        return { success: true };
      }),
  }),

});

export type AppRouter = typeof appRouter;
