import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
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
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
        
        // Get department and college information
        const department = await db.getDepartmentById(program.departmentId);
        const college = department ? await db.getCollegeById(department.collegeId) : null;
        
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
          // Call Python parser
          const scriptPath = path.join(__dirname, '../scripts/parse-docx.py');
          const { stdout } = await execAsync(`python "${scriptPath}" "${tempPath}"`);
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
          descriptionEn: z.string().optional(),
          descriptionAr: z.string().optional(),
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
          textEn: z.string().optional(),
          textAr: z.string().optional(),
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
            ...ploData,
          });
          ploMap.set(ploData.code, id);
        }

        // Get competency IDs
        const allCompetencies = await db.getAllCompetencies();
        const competencyMap = new Map(allCompetencies.map(c => [c.code, c.id]));

        // Create mappings
        for (const mapping of input.mappings) {
          const ploId = ploMap.get(mapping.ploCode);
          const competencyId = competencyMap.get(mapping.competencyCode);
          
          if (ploId && competencyId) {
            await db.upsertMapping(ploId, competencyId, mapping.weight.toString());
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
              textEn: justification.textEn,
              textAr: justification.textAr,
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
          output_path: `/tmp/plo-ga-mapping-${getCollegeAbbreviation(college?.nameEn || college?.nameAr || 'College')}-${abbreviateProgramName(program.nameEn || program.nameAr || 'program')}-${Date.now()}.${input.format === 'word' ? 'docx' : input.format === 'excel' ? 'xlsx' : 'pdf'}`
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
    
    programAnalytics: publicProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProgramAnalytics(input.programId);
      }),
    
    // Export endpoints
    exportToPDF: publicProcedure
      .input(z.object({
        data: z.object({
          title: z.string(),
          metrics: z.array(z.object({ label: z.string(), value: z.any() })),
          table_data: z.array(z.array(z.string())),
          chart_image_data: z.string().optional(),
          timestamp: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const tempInputFile = path.join(tmpdir(), `analytics-export-${Date.now()}.json`);
        const outputPath = path.join(tmpdir(), `analytics-report-${Date.now()}.pdf`);
        const logoPath = path.join(__dirname, '../client/public/qu-logo.png');
        
        // Save chart image if provided
        let chartImagePath = null;
        if (input.data.chart_image_data) {
          chartImagePath = path.join(tmpdir(), `chart-${Date.now()}.png`);
          const base64Data = input.data.chart_image_data.split(',')[1];
          await writeFile(chartImagePath, Buffer.from(base64Data, 'base64'));
        }
        
        const exportData = {
          data: {
            ...input.data,
            chart_image: chartImagePath,
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
          if (chartImagePath) await unlink(chartImagePath).catch(() => {});
          
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
          chart_image_data: z.string().optional(),
          timestamp: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const tempInputFile = path.join(tmpdir(), `analytics-export-${Date.now()}.json`);
        const outputPath = path.join(tmpdir(), `analytics-report-${Date.now()}.docx`);
        const logoPath = path.join(__dirname, '../client/public/qu-logo.png');
        
        const exportData = {
          data: input.data,
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
