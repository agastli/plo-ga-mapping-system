# PLO-GA Mapping System - Troubleshooting Guide

## Overview

This document provides a comprehensive reference for issues encountered during the deployment and operation of the PLO-GA Mapping System, particularly focusing on cross-platform compatibility between Windows (WAMP) development environment and Linux VPS production environment.

---

## Issue 1: Database Connectivity Failure on VPS

### Symptoms
- Application failed to connect to MySQL database on Linux VPS
- Error: `Cannot find module 'mysql2'`
- Application worked fine on Windows WAMP environment

### Root Cause
The `mysql2` package was not installed on the VPS, even though it was listed in `package.json`. The production environment had missing dependencies.

### Solution
```bash
cd /home/agastli/htdocs/plo-ga.gastli.org
npm install mysql2
pm2 restart plo-ga-mapping
```

### Prevention
- Always run `npm install` after deploying code to production
- Verify all dependencies are installed before starting the application
- Consider using `npm ci` for production deployments to ensure exact dependency versions

---

## Issue 2: Mapping Matrix Not Displaying (Critical)

### Symptoms
- Mapping matrix displayed correctly on Windows WAMP
- Mapping matrix showed empty on Linux VPS
- Database queries returned 147 mappings, but frontend showed nothing
- Console showed no errors

### Root Cause
**MySQL decimal type behavior differs between Windows and Linux:**
- **Windows MySQL**: Returns decimal fields as JavaScript numbers (e.g., `0.28`)
- **Linux MySQL**: Returns decimal fields as strings (e.g., `"0.28"`)

The frontend React component expected numeric values for the mapping weights, causing the display logic to fail silently when receiving strings.

### Technical Details
Database schema defined weights as:
```sql
weight DECIMAL(3,2)
```

Backend query in `server/db.ts` (line ~405):
```typescript
const mappings = await db
  .select({
    ploCode: ploGaMappings.ploCode,
    competencyCode: ploGaMappings.competencyCode,
    weight: ploGaMappings.weight,  // Returns string on Linux, number on Windows
  })
  .from(ploGaMappings)
  .where(eq(ploGaMappings.programId, programId));
```

### Solution
Added explicit type conversion in `server/db.ts` (lines 405-414):

```typescript
// Transform mappings to ensure weights are numbers (Linux MySQL returns strings)
const mappingsWithNumericWeights = mappings.map(m => ({
  ...m,
  weight: typeof m.weight === 'string' ? parseFloat(m.weight) : m.weight
}));

// Build the nested structure with numeric weights
const mappingsByPlo: Record<string, Record<string, number>> = {};
for (const mapping of mappingsWithNumericWeights) {
  if (!mappingsByPlo[mapping.ploCode]) {
    mappingsByPlo[mapping.ploCode] = {};
  }
  mappingsByPlo[mapping.ploCode][mapping.competencyCode] = mapping.weight;
}
```

### Key Insight
This is a **MySQL driver behavior difference** between operating systems, not a bug in the application code. Always handle type conversions explicitly when dealing with decimal types in cross-platform applications.

---

## Issue 3: Export File Download Failures

### Symptoms
- PDF and Excel export generation succeeded
- Download links returned 404 errors
- File paths in download URLs were malformed

### Root Cause
The download endpoint was stripping the leading slash from file paths during URL encoding, causing incorrect path resolution.

**Example:**
- Generated file path: `/home/agastli/htdocs/plo-ga.gastli.org/temp/mapping-123.pdf`
- Encoded URL: `home/agastli/htdocs/...` (missing leading slash)
- Server tried to resolve: `./home/agastli/...` (relative path, incorrect)

### Solution
Updated `server/index.ts` download endpoint (around line 50-60):

```typescript
app.get('/api/download/:filePath(*)', (req, res) => {
  try {
    const encodedPath = req.params.filePath;
    let filePath = decodeURIComponent(encodedPath);
    
    // Add leading slash if missing (URL encoding may strip it)
    if (!filePath.startsWith('/')) {
      filePath = '/' + filePath;
    }
    
    console.log('Download request - Encoded:', encodedPath);
    console.log('Download request - Decoded:', filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});
```

### Prevention
- Always validate absolute paths before file operations
- Test file download functionality on both development and production environments
- Add comprehensive logging for file path operations

---

## Issue 4: Word Export Failure (Type Mismatch)

### Symptoms
- PDF export: ✅ Working
- Excel export: ✅ Working
- Word export: ❌ Failed with error: `"float" object is not iterable`

### Root Cause
After fixing Issue 2 (MySQL decimal conversion), weight values were now correctly sent as floats instead of strings. However, the Word export Python script was trying to assign float values directly to `cell.text`, which expects strings.

**Error occurred at:** `scripts/export-to-word.py` line 284

```python
# This line failed when weight was a float
weight_cell.text = weight  # Error: float object is not iterable
```

### Technical Details
The `python-docx` library's `text` property expects string values. When a float is assigned, it attempts to iterate over it (expecting a string), causing the error.

### Solution
Updated `scripts/export-to-word.py` line 285:

```python
# Before:
weight_cell.text = weight

# After:
weight_cell.text = str(weight) if isinstance(weight, (int, float)) else weight
```

This ensures numeric weights are converted to strings before assignment, while preserving string values that may already exist.

### Key Insight
When fixing one issue (decimal type conversion), always check downstream code that depends on the data type. Type conversions can have cascading effects throughout the application.

---

## Issue 5: Python Environment Dependencies

### Symptoms
- Export scripts failed with import errors
- Missing Python libraries on VPS

### Root Cause
Python dependencies were not installed on the production VPS.

### Solution
```bash
# Install Python 3 and pip (if not already installed)
sudo apt-get update
sudo apt-get install python3 python3-pip

# Install required libraries
pip3 install reportlab pillow openpyxl python-docx
```

### Required Python Libraries
- **reportlab**: PDF generation
- **pillow**: Image processing for PDFs
- **openpyxl**: Excel file generation
- **python-docx**: Word document generation

### Prevention
- Document all Python dependencies in `requirements.txt`
- Include dependency installation in deployment scripts
- Test all export functionality after deployment

---

## Cross-Platform Compatibility Checklist

When deploying applications across Windows and Linux environments, verify:

### Database Layer
- [ ] Decimal/numeric field type handling
- [ ] Date/time format differences
- [ ] String encoding (UTF-8 vs. others)
- [ ] Case sensitivity in table/column names
- [ ] Path separators in stored paths

### File System
- [ ] Path separators (Windows: `\`, Linux: `/`)
- [ ] File permissions (Linux requires explicit permissions)
- [ ] Case sensitivity (Windows: case-insensitive, Linux: case-sensitive)
- [ ] Line endings (CRLF vs. LF)

### Node.js Dependencies
- [ ] All packages in `package.json` installed
- [ ] Native modules compiled for target platform
- [ ] File path handling uses `path.join()` or `path.resolve()`

### Python Dependencies
- [ ] All required libraries installed
- [ ] Python version compatibility
- [ ] Virtual environment setup (recommended)

### Process Management
- [ ] PM2 or equivalent process manager configured
- [ ] Environment variables set correctly
- [ ] Log file locations and permissions
- [ ] Auto-restart on failure enabled

---

## Debugging Techniques Used

### 1. Database Query Verification
```bash
# Check if data exists in database
mysql -u username -p database_name
SELECT COUNT(*) FROM plo_ga_mappings WHERE program_id = 1;
SELECT * FROM plo_ga_mappings LIMIT 5;
```

### 2. Backend Logging
Added console.log statements to trace data flow:
```typescript
console.log('Mappings retrieved:', mappings.length);
console.log('Sample mapping:', mappings[0]);
console.log('Weight type:', typeof mappings[0].weight);
```

### 3. Frontend Console Inspection
```javascript
console.log('Matrix data received:', matrixData);
console.log('PLOs:', matrixData?.plos);
console.log('Weight value:', weight, 'Type:', typeof weight);
```

### 4. Python Script Testing
```bash
# Test Python script directly with sample data
python3 scripts/export-to-word.py /tmp/test-data.json
```

### 5. PM2 Log Monitoring
```bash
# View real-time logs
pm2 logs plo-ga-mapping --lines 100

# Filter for specific errors
pm2 logs plo-ga-mapping | grep -i error
```

---

## Performance Considerations

### Database Queries
The mapping matrix query retrieves all PLOs, GAs, competencies, and mappings for a program. For large programs:
- Consider pagination for programs with 50+ PLOs
- Cache frequently accessed program data
- Use database indexes on foreign keys

### Export Generation
- Export files are generated synchronously, which can block the server
- Consider implementing a job queue for large exports
- Clean up temporary files regularly

### File Storage
- Temporary export files accumulate in `/temp` directory
- Implement automatic cleanup of files older than 24 hours
- Monitor disk space usage

---

## Deployment Workflow

### Recommended Steps for Future Deployments

1. **Pull Latest Code**
   ```bash
   cd /home/agastli/htdocs/plo-ga.gastli.org
   git pull origin main
   ```

2. **Install Dependencies**
   ```bash
   npm install
   pip3 install -r requirements.txt  # If requirements.txt exists
   ```

3. **Run Database Migrations** (if any)
   ```bash
   npm run db:push
   ```

4. **Test Locally** (if possible)
   ```bash
   npm run dev
   ```

5. **Restart Production Server**
   ```bash
   pm2 restart plo-ga-mapping
   ```

6. **Verify Functionality**
   - Test mapping matrix display
   - Test all three export formats (PDF, Word, Excel)
   - Check database connectivity
   - Monitor logs for errors

7. **Monitor Logs**
   ```bash
   pm2 logs plo-ga-mapping --lines 50
   ```

---

## Common Error Messages and Solutions

### Error: "Cannot find module 'mysql2'"
**Solution:** Run `npm install mysql2`

### Error: "float object is not iterable"
**Solution:** Convert numeric values to strings before assigning to text properties in Python scripts

### Error: "File not found" (404) on export download
**Solution:** Check file path encoding and ensure leading slash is preserved

### Error: "Connection refused" to database
**Solution:** 
- Verify MySQL service is running: `sudo systemctl status mysql`
- Check database credentials in environment variables
- Verify firewall rules allow database connections

### Mapping matrix shows empty
**Solution:** Check if weights are being converted to numbers in backend (see Issue 2)

---

## Testing Checklist

Before considering deployment complete, verify:

- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] Login/authentication works
- [ ] Program list displays correctly
- [ ] Mapping matrix displays with weights
- [ ] PDF export generates and downloads
- [ ] Word export generates and downloads
- [ ] Excel export generates and downloads
- [ ] Analytics dashboard loads
- [ ] All CRUD operations work (Create, Read, Update, Delete)

---

## Contact and Support

For issues not covered in this document:
1. Check PM2 logs: `pm2 logs plo-ga-mapping`
2. Check MySQL error logs: `/var/log/mysql/error.log`
3. Check Node.js application logs
4. Review recent code changes in Git history

---

## Document Version History

- **v1.0** (2026-02-24): Initial documentation covering all issues encountered during VPS deployment and cross-platform compatibility fixes

---

## Related Files

Key files involved in the fixes:
- `server/db.ts` - Database queries and type conversion (Issue 2)
- `server/index.ts` - Download endpoint (Issue 3)
- `scripts/export-to-word.py` - Word export script (Issue 4)
- `client/src/pages/ProgramDetail.tsx` - Mapping matrix display
- `package.json` - Node.js dependencies (Issue 1)

---

*This document should be updated whenever new issues are encountered and resolved.*
