# Visual Step-by-Step Guide: Update Database with SQL Queries

This guide shows you **exactly** what you'll see on your screen and what to do at each step.

---

## 🎯 What We're Going to Do

We need to link your CAS departments to their clusters (SSH, LCT, SAS) by running SQL UPDATE statements in phpMyAdmin.

---

## 📋 STEP 1: Start WAMP Server

**What to do:**
1. Look for the WAMP icon in your Windows system tray (bottom-right corner)
2. If it's **green** ✅ - WAMP is running, proceed to Step 2
3. If it's **orange** or **red** ⚠️ - Click on it and select "Start All Services"
4. Wait until the icon turns **green**

**What you'll see:**
- WAMP icon in system tray will be green when ready

---

## 📋 STEP 2: Open phpMyAdmin

**What to do:**
1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. In the address bar, type: `http://localhost/phpmyadmin`
3. Press Enter

**What you'll see:**
- phpMyAdmin welcome page will load
- Left sidebar shows list of databases
- Main area shows phpMyAdmin interface

**Screenshot description:**
```
┌─────────────────────────────────────────────────────┐
│ phpMyAdmin                                          │
├───────────────┬─────────────────────────────────────┤
│ Databases:    │ Welcome to phpMyAdmin              │
│ ├─ information│                                     │
│ ├─ mysql      │ [Database selection area]          │
│ ├─ performance│                                     │
│ └─ plo_ga_... │ [Your database here]               │
│               │                                     │
└───────────────┴─────────────────────────────────────┘
```

---

## 📋 STEP 3: Select Your Database

**What to do:**
1. In the **left sidebar**, look for your database name
   - It might be called: `plo_ga_mapping` or similar
2. **Click on your database name**
3. The database will expand showing tables

**What you'll see after clicking:**
- Your database name will be highlighted
- Tables list appears below it (colleges, departments, programs, etc.)
- Main area shows database overview

**Screenshot description:**
```
┌─────────────────────────────────────────────────────┐
│ phpMyAdmin                                          │
├───────────────┬─────────────────────────────────────┤
│ Databases:    │ Database: plo_ga_mapping           │
│ ├─ mysql      │                                     │
│ └─►plo_ga_... │ [Tabs: Structure | SQL | Search...]│
│    ├─ colleges│                                     │
│    ├─ clusters│ Tables in database:                │
│    ├─ depart..│ - colleges (5 rows)                │
│    ├─ programs│ - clusters (3 rows)                │
│    └─ ...     │ - departments (18 rows)            │
└───────────────┴─────────────────────────────────────┘
```

---

## 📋 STEP 4: Open SQL Tab

**What to do:**
1. Look at the **top of the main area** (right side)
2. You'll see tabs: **Structure | SQL | Search | Query | ...**
3. **Click on the "SQL" tab**

**What you'll see:**
- A large text box appears with a white background
- This is where you'll paste SQL queries
- There's a "Go" button at the bottom

**Screenshot description:**
```
┌─────────────────────────────────────────────────────┐
│ Database: plo_ga_mapping                            │
├─────────────────────────────────────────────────────┤
│ [Structure] [►SQL◄] [Search] [Query] [Export]...   │
├─────────────────────────────────────────────────────┤
│ Run SQL query/queries on database plo_ga_mapping:  │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │                                             │   │
│ │  [Large text area for SQL queries]         │   │
│ │                                             │   │
│ │                                             │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [Go] button                                         │
└─────────────────────────────────────────────────────┘
```

---

## 📋 STEP 5: Verify Cluster IDs

**What to do:**
1. Copy this query:
   ```sql
   SELECT id, nameEn, code FROM clusters WHERE collegeId = 1 ORDER BY id;
   ```
2. **Paste it** in the SQL text box
3. Click the **"Go"** button

**What you'll see:**
- A results table appears below showing your clusters
- Should show 3 rows with cluster information

**Expected results:**
```
┌────┬──────────────────────────────────────────┬──────────┐
│ id │ nameEn                                   │ code     │
├────┼──────────────────────────────────────────┼──────────┤
│ 1  │ Social Sciences & Humanities             │ CAS-SSH  │
│ 2  │ Languages, Communication and Translation │ CAS-LCT  │
│ 3  │ Sciences and Applied Sciences            │ CAS-SAS  │
└────┴──────────────────────────────────────────┴──────────┘
```

**✅ Checkpoint:** Verify the IDs match (1=SSH, 2=LCT, 3=SAS)

---

## 📋 STEP 6: Check Department IDs

**What to do:**
1. **Clear the text box** (delete the previous query)
2. Copy this query:
   ```sql
   SELECT id, nameEn, clusterId FROM departments WHERE collegeId = 1 ORDER BY id;
   ```
3. **Paste it** in the SQL text box
4. Click **"Go"**

**What you'll see:**
- A table showing all CAS departments
- The `clusterId` column will show NULL (empty) for most departments
- This is what we're going to fix!

**Example results:**
```
┌────┬────────────────────────────────────────┬───────────┐
│ id │ nameEn                                 │ clusterId │
├────┼────────────────────────────────────────┼───────────┤
│ 1  │ Arabic Language Department             │ NULL      │
│ 2  │ Humanities Department                  │ NULL      │
│ 3  │ International Affairs Department       │ NULL      │
│ ...│ ...                                    │ ...       │
└────┴────────────────────────────────────────┴───────────┘
```

---

## 📋 STEP 7: Update LCT Departments

**What to do:**
1. **Clear the text box**
2. Copy this query:
   ```sql
   UPDATE departments 
   SET clusterId = (SELECT id FROM clusters WHERE code='CAS-LCT' AND collegeId=1)
   WHERE id IN (1,12,15);
   ```
3. **Paste it** in the text box
4. Click **"Go"**

**What you'll see:**
- A green success message: "3 rows affected"
- This means 3 departments were updated

**Success message example:**
```
┌─────────────────────────────────────────────────────┐
│ ✓ Your SQL query has been executed successfully     │
│   3 rows affected.                                  │
└─────────────────────────────────────────────────────┘
```

---

## 📋 STEP 8: Update SSH Departments

**What to do:**
1. **Clear the text box**
2. Copy this query:
   ```sql
   UPDATE departments 
   SET clusterId = (SELECT id FROM clusters WHERE code='CAS-SSH' AND collegeId=1)
   WHERE id IN (2,3,4,13,14,16,17,18);
   ```
3. **Paste it** in the text box
4. Click **"Go"**

**What you'll see:**
- Success message: "8 rows affected"

---

## 📋 STEP 9: Update SAS Departments

**What to do:**
1. **Clear the text box**
2. Copy this query:
   ```sql
   UPDATE departments 
   SET clusterId = (SELECT id FROM clusters WHERE code='CAS-SAS' AND collegeId=1)
   WHERE id IN (5,6,7,8,9,10,11);
   ```
3. **Paste it** in the text box
4. Click **"Go"**

**What you'll see:**
- Success message: "7 rows affected"

---

## 📋 STEP 10: Verify the Updates

**What to do:**
1. **Clear the text box**
2. Copy this query:
   ```sql
   SELECT 
     d.id,
     d.nameEn as department,
     c.nameEn as cluster,
     c.code as clusterCode
   FROM departments d
   LEFT JOIN clusters c ON d.clusterId = c.id
   WHERE d.collegeId = 1
   ORDER BY c.code, d.id;
   ```
3. **Paste it** and click **"Go"**

**What you'll see:**
- A table showing all departments WITH their clusters
- **NO NULL values** in the cluster column
- Departments grouped by cluster

**Expected results:**
```
┌────┬────────────────────────────┬──────────────────────┬─────────────┐
│ id │ department                 │ cluster              │ clusterCode │
├────┼────────────────────────────┼──────────────────────┼─────────────┤
│ 1  │ Arabic Language Dept       │ Languages, Comm...   │ CAS-LCT     │
│ 12 │ English Literature Dept    │ Languages, Comm...   │ CAS-LCT     │
│ 15 │ Mass Communication Dept    │ Languages, Comm...   │ CAS-LCT     │
├────┼────────────────────────────┼──────────────────────┼─────────────┤
│ 5  │ Biological Sciences Dept   │ Sciences and App...  │ CAS-SAS     │
│ 6  │ Chemistry and Earth Dept   │ Sciences and App...  │ CAS-SAS     │
│ 7  │ Mathematics & Statistics   │ Sciences and App...  │ CAS-SAS     │
│ ...│ ...                        │ ...                  │ ...         │
├────┼────────────────────────────┼──────────────────────┼─────────────┤
│ 2  │ Humanities Department      │ Social Sciences...   │ CAS-SSH     │
│ 3  │ International Affairs      │ Social Sciences...   │ CAS-SSH     │
│ ...│ ...                        │ ...                  │ ...         │
└────┴────────────────────────────┴──────────────────────┴─────────────┘
```

**✅ Success Criteria:**
- All departments show a cluster name (no NULL)
- LCT has 3-4 departments
- SAS has 6-7 departments
- SSH has 4-8 departments

---

## 🎉 You're Done!

### What Just Happened:
✅ You linked all CAS departments to their respective clusters
✅ The database now knows which departments belong to which cluster
✅ The PLO-GA Mapping System will automatically use this information

### What Works Now:
✅ AddProgram form will filter departments by cluster
✅ ClusterManagement page can assign/reassign departments
✅ Analytics will support cluster-level filtering (once UI is added)

---

## ⚠️ Troubleshooting

### Problem: "0 rows affected" when running UPDATE
**Solution:** 
- The department IDs in the query don't match your database
- Run the verification query (Step 6) to see your actual department IDs
- Adjust the numbers in the WHERE clause

### Problem: Can't find phpMyAdmin
**Solution:**
- Make sure WAMP is running (green icon)
- Try: `http://localhost:8080/phpmyadmin` (if port 80 is busy)
- Or click WAMP icon → phpMyAdmin

### Problem: "Access denied" error
**Solution:**
- You might need to login
- Default username: `root`
- Default password: (empty - just press Enter)

---

## 📞 Need Help?

If you see any error messages:
1. **Take a screenshot** of the error
2. **Copy the exact error message**
3. Share it so I can help troubleshoot

The most common issue is department IDs not matching - just run the verification query to see your actual IDs and adjust the UPDATE statements accordingly.
