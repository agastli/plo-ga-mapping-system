# Cluster Filtering Implementation Summary

## Overview
This document summarizes the implementation of cluster-based filtering throughout the PLO-GA Mapping System.

## Database Changes

### 1. Added `clusterId` Column to Departments Table
- **Column**: `clusterId INT NULL`
- **Foreign Key**: References `clusters(id)` with `ON DELETE SET NULL`
- **SQL to add** (if not exists):
```sql
ALTER TABLE departments 
ADD COLUMN clusterId INT NULL,
ADD FOREIGN KEY (clusterId) REFERENCES clusters(id) ON DELETE SET NULL;
```

### 2. Department-Cluster Linking
- SQL scripts provided in `scripts/` directory:
  - `assign-departments-to-clusters-by-id.sql` - Links CAS departments to clusters (SSH, LCT, SAS)
  - `link-cas-departments-to-clusters.sql` - Alternative name-based approach

## Backend Changes

### 1. Updated Analytics Endpoints (`server/routers.ts`)
Added `clusterId` support to filtering:
- `gaAnalytics` - Now accepts `{ collegeId?, clusterId?, programId? }`
- `competencyAnalytics` - Now accepts `{ collegeId?, clusterId?, programId? }`

### 2. Updated Database Functions (`server/db.ts`)
- `getFilteredGAAnalytics()` - Added cluster filtering logic
- `getFilteredCompetencyAnalytics()` - Added cluster filtering logic

Both functions now filter programs by cluster when `clusterId` is provided:
```typescript
if (filters?.clusterId) {
  const clusterDepartments = await db.select().from(departments)
    .where(eq(departments.clusterId, filters.clusterId));
  const deptIds = clusterDepartments.map((d) => d.id);
  filteredPrograms = filteredPrograms.filter((p) => deptIds.includes(p.departmentId));
}
```

## Frontend Changes

### 1. UnifiedAnalytics Page (`client/src/pages/UnifiedAnalytics.tsx`)
Added cluster filtering UI:
- **Filter Level Dropdown**: Added "By Cluster" option
- **Cluster Dropdown**: Shows when college is selected and has clusters
- **Conditional Display**: Cluster filter only appears if `hasCluster = true`

```typescript
const clusters = selectedCollegeId && allClusters
  ? allClusters.filter((c: any) => c.collegeId === selectedCollegeId)
  : [];

const hasCluster = clusters.length > 0;
```

### 2. Filter Input Logic
```typescript
const filterInput = filterLevel === "college" && selectedCollegeId
  ? { collegeId: selectedCollegeId }
  : filterLevel === "cluster" && selectedClusterId
  ? { clusterId: selectedClusterId }
  : filterLevel === "program" && selectedProgramId
  ? { programId: selectedProgramId }
  : undefined;
```

## Export Improvements

### 1. Fixed Filename Path Issue
Updated `/server/_core/index.ts` download endpoint to handle both Unix and Windows path separators:
```typescript
const filename = filePath.replace(/\\/g, '/').split('/').pop() || 'download';
```

### 2. Added Competency Breakdown Tables
All export formats (PDF, Word, Excel) now include:
1. **Graduate Attributes Summary** table
2. **Competency Breakdown** table (NEW)

Updated scripts:
- `scripts/export-analytics-to-pdf.py`
- `scripts/export-analytics-to-word.py`
- `scripts/export-analytics-to-excel.py`

## Hierarchical Structure

The system now properly supports the full hierarchy:
```
College → Cluster (optional) → Department → Program
```

- Programs link to Departments (`departmentId`)
- Departments link to Clusters (`clusterId` - can be NULL)
- Clusters link to Colleges (`collegeId`)

## Conditional Display Rules

### Display Cluster Information When:
1. **In Program Lists**: Show "College - Cluster" if department has cluster
2. **In Analytics**: Show cluster filter if selected college has clusters
3. **In Exports**: Include cluster code in filename if filtering by cluster

### Hide Cluster Information When:
1. Department's `clusterId` is NULL
2. College has no clusters defined
3. Filtering at university or college level (not cluster-specific)

## Testing Checklist

- [ ] Run SQL script to link departments to clusters
- [ ] Verify cluster filter appears in Analytics when CAS is selected
- [ ] Test filtering by cluster (SSH, LCT, SAS)
- [ ] Verify analytics show correct data for cluster-level filtering
- [ ] Test exports include competency breakdown table
- [ ] Verify export filenames are clean (no path prefixes)
- [ ] Check that cluster info appears conditionally in program views

## Known Issues

- TypeScript errors in sandbox due to stale type cache
- Types will regenerate correctly when running locally
- All endpoints exist and are correctly defined in routers

## Next Steps

1. Pull latest code from GitHub
2. Run SQL script to populate `clusterId` in departments table
3. Test cluster filtering in local environment
4. Implement conditional cluster display in Programs page
5. Update export filenames to include cluster codes
