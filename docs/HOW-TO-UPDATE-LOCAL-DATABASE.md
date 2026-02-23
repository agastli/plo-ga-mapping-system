# How to Update Your Local WAMP Database with SQL Queries

This guide will help you execute the SQL scripts to link departments to clusters in your local database.

---

## Method 1: Using phpMyAdmin (Easiest)

### Step 1: Open phpMyAdmin
1. Start your WAMP server (make sure it's running)
2. Open your web browser
3. Go to: `http://localhost/phpmyadmin`
4. You should see the phpMyAdmin interface

### Step 2: Select Your Database
1. In the left sidebar, click on your database name (e.g., `plo_ga_mapping`)
2. The database tables will appear in the left panel

### Step 3: Open SQL Tab
1. Click on the **SQL** tab at the top of the page
2. You'll see a large text area where you can paste SQL queries

### Step 4: Execute the SQL Script
1. Open the SQL script file:
   - `scripts/assign-departments-to-clusters-by-id.sql`
2. Copy the **verification query first** to check your cluster IDs:
   ```sql
   SELECT id, nameEn, code FROM clusters WHERE collegeId = 1 ORDER BY id;
   ```
3. Paste it in the SQL text area and click **Go**
4. Verify the cluster IDs match what's in the script (should be 1=SSH, 2=LCT, 3=SAS)

5. Copy the **department verification query**:
   ```sql
   SELECT id, nameEn, code, clusterId FROM departments WHERE collegeId = 1 ORDER BY id;
   ```
6. Paste and click **Go** to see your department IDs

7. Now copy and paste **each UPDATE statement one at a time**:
   
   **First - LCT departments:**
   ```sql
   UPDATE departments 
   SET clusterId = (SELECT id FROM clusters WHERE code='CAS-LCT' AND collegeId=1)
   WHERE id IN (1,12,15);
   ```
   Click **Go**
   
   **Second - SSH departments:**
   ```sql
   UPDATE departments 
   SET clusterId = (SELECT id FROM clusters WHERE code='CAS-SSH' AND collegeId=1)
   WHERE id IN (2,3,4,13,14,16,17,18);
   ```
   Click **Go**
   
   **Third - SAS departments:**
   ```sql
   UPDATE departments 
   SET clusterId = (SELECT id FROM clusters WHERE code='CAS-SAS' AND collegeId=1)
   WHERE id IN (5,6,7,8,9,10,11);
   ```
   Click **Go**

### Step 5: Verify the Results
1. Copy and paste the verification query:
   ```sql
   SELECT 
     d.id,
     d.nameEn as department,
     d.code as deptCode,
     c.nameEn as cluster,
     c.code as clusterCode
   FROM departments d
   LEFT JOIN clusters c ON d.clusterId = c.id
   WHERE d.collegeId = 1
   ORDER BY c.code, d.id;
   ```
2. Click **Go**
3. You should see all departments with their assigned clusters
4. Check that no department has `NULL` in the cluster column

---

## Method 2: Using MySQL Command Line

### Step 1: Open MySQL Command Line
1. Start WAMP server
2. Click on WAMP icon in system tray
3. Select **MySQL** → **MySQL Console**
4. Enter your MySQL root password (default is usually empty, just press Enter)

### Step 2: Select Database
```sql
USE plo_ga_mapping;
```

### Step 3: Execute Queries
Copy and paste each query from the SQL script file, one at a time, and press Enter after each one.

---

## Method 3: Using HeidiSQL (If Installed)

### Step 1: Open HeidiSQL
1. Start WAMP server
2. Open HeidiSQL
3. Connect to your local MySQL server (localhost, root, your password)

### Step 2: Select Database
1. In the left panel, click on your database name
2. Click on the **Query** tab at the top

### Step 3: Execute SQL
1. Paste the SQL queries in the query window
2. Select the query you want to run (or run all)
3. Click the **Execute** button (or press F9)

---

## Important Notes

### ⚠️ Before You Start
- **Backup your database first!** In phpMyAdmin, go to Export tab and download a backup
- Make sure WAMP server is running
- Verify you have the correct database selected

### ✅ After Running the Queries
1. Check that all departments have a cluster assigned (no NULL values)
2. Count departments per cluster:
   ```sql
   SELECT 
     c.code as clusterCode,
     c.nameEn as cluster,
     COUNT(d.id) as department_count
   FROM clusters c
   LEFT JOIN departments d ON c.id = d.clusterId
   WHERE c.collegeId = 1
   GROUP BY c.id, c.code, c.nameEn
   ORDER BY c.code;
   ```
   Expected results:
   - CAS-LCT: 3-4 departments
   - CAS-SAS: 6-7 departments  
   - CAS-SSH: 4-8 departments

### 🔍 Troubleshooting

**Problem: "Table 'departments' doesn't exist"**
- Solution: Make sure you selected the correct database first

**Problem: "No rows updated"**
- Solution: Check that the department IDs in the WHERE clause match your actual department IDs
- Run the verification query to see your department IDs first

**Problem: "Subquery returns more than 1 row"**
- Solution: Make sure cluster codes are unique. Run:
  ```sql
  SELECT code, COUNT(*) FROM clusters WHERE collegeId = 1 GROUP BY code;
  ```
  Each code should appear only once.

---

## Quick Reference: Department IDs by Cluster

Based on your organizational chart:

**LCT (Languages, Communication and Translation):**
- IDs: 1, 12, 15

**SSH (Social Sciences & Humanities):**
- IDs: 2, 3, 4, 13, 14, 16, 17, 18

**SAS (Sciences and Applied Sciences):**
- IDs: 5, 6, 7, 8, 9, 10, 11

---

## After Successful Update

Once you've successfully run the SQL queries and verified the results:

1. ✅ Departments are now linked to clusters
2. ✅ The PLO-GA Mapping System will automatically use cluster filtering
3. ✅ You can filter programs by cluster in the AddProgram form
4. ✅ You can assign departments to clusters in the ClusterManagement page
5. ✅ Analytics will support cluster-level filtering (once implemented in UI)

---

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Verify your database structure matches the expected schema
3. Make sure WAMP server is running
4. Try running queries one at a time instead of all at once
