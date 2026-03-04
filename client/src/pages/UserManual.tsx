import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Breadcrumb from "@/components/Breadcrumb";
import PageFooter from "@/components/PageFooter";
import { BookOpen, Download, ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

// Inline the manual content so it works in production without a file server
const MANUAL_CONTENT = `# PLO-GA Mapping Management System — User Manual

**Qatar University | Academic Planning & Quality Assurance**
Version 1.0 — February 2026

---

## 1. Introduction

The **PLO-GA Mapping Management System** is a web-based platform developed for Qatar University to support the systematic mapping of Program Learning Outcomes (PLOs) to the five Graduate Attributes (GAs) and their associated competencies, as defined by the Qatar University Academic Planning & Quality Assurance framework.

The system enables academic departments and colleges to:

- Define and manage PLOs for each bachelor's and graduate program.
- Map each PLO to one or more GAs and competencies using a weighted scoring approach.
- Provide written justifications for every mapping decision to support accreditation evidence.
- Track mapping completeness across all programs in real time.
- Analyse alignment scores at the program, department, college, and university levels.
- Maintain a full audit trail of all changes for quality assurance purposes.

The system is designed for three user roles — **Admin**, **Editor**, and **Viewer** — each with distinct access rights as described in Section 14.

---

## 2. Getting Started

### 2.1 Logging In

Navigate to the system URL in any modern web browser. Enter your **username** and **password** on the login screen and click **Sign In**. After a successful login, you will be redirected to the dashboard corresponding to your role.

### 2.2 Recovering Your Username or Password

If you have forgotten your username, click **Forgot Username?** on the login page. Enter the email address associated with your account and the system will send your username by email.

If you have forgotten your password, click **Forgot Password?**, enter your email address, and follow the link in the reset email to set a new password.

> **Note:** These features require that your account has a valid email address on file. Contact your system administrator if you do not receive the email within a few minutes.

### 2.3 Role-Based Access

| Role | Description |
|------|-------------|
| **Admin** | Full access to all programs, users, analytics, and administrative tools. |
| **Editor** | Can add and edit PLOs and mappings for programs they are explicitly assigned to. |
| **Viewer** | Read-only access to programs and analytics. Cannot make any changes. |

---

## 3. Dashboards

### 3.1 Admin Dashboard

The Admin Dashboard is the central control panel for system administrators. It displays system statistics, the Mapping Completeness Tracker widget, quick action links to admin tools, and a summary of recent activity.

### 3.2 Editor Dashboard

The Editor Dashboard shows the editor's assigned programs and a Mapping Completeness Tracker filtered to those programs, helping them prioritise which programs need attention.

### 3.3 Viewer Dashboard

The Viewer Dashboard provides read-only users with a summary of the system's current state and links to the analytics dashboards and the program browser.

---

## 4. Programs Management

### 4.1 Programs Directory

The Programs Directory (/programs) lists all academic programs. Use the search bar to filter by program name or code, and use the college and department dropdowns to narrow the list.

### 4.2 Adding a Program

Administrators can add a new program by clicking **Add New Program**. The form requires the program code, name (English and Arabic), college, department, level, credit hours, and duration.

### 4.3 Program Detail Page

The Program Detail page is the primary workspace. It has three sections:

**PLO List** — all PLOs for the program. Editors can add, edit, or bulk-import PLOs.

**Mapping Matrix** — a grid where each row is a PLO and each column is a GA or competency. Enter a weighting factor (0–100) in each cell. Click any non-zero cell to add a justification.

**Change History (Audit Log)** — a collapsible panel at the bottom recording every change, who made it, and when.

### 4.4 Deleting a Program

Only administrators can delete programs. Deletion is permanent and removes all associated PLOs, mappings, and justifications.

---

## 5. PLO Management

### 5.1 Adding PLOs Manually

Click **Add New PLO** on the Program Detail page. Enter the PLO code, English description, and optionally the Arabic description.

### 5.2 Bulk CSV Import

Click **Bulk Import PLOs (CSV)** to open the import panel. Download the CSV template, fill it in (columns: code, description_en, description_ar), upload the file, review the preview, and click **Import**. Duplicate codes are automatically skipped.

### 5.3 Importing from a Document

Upload a Word or PDF program specification file. The system will attempt to extract PLO statements automatically. Review the extracted PLOs before confirming the import.

---

## 6. PLO-to-GA Mapping

### 6.1 Mapping Matrix

Rows = PLOs, Columns = GAs and their competencies. Enter a weighting factor (0–100) in each cell to indicate the degree of alignment.

### 6.2 Weighting Factors

| Weight Range | Interpretation |
|---|---|
| 0 | No alignment |
| 1–25 | Marginal or indirect alignment |
| 26–50 | Partial alignment |
| 51–75 | Substantial alignment |
| 76–99 | Strong alignment |
| 100 | Full and direct alignment |

### 6.3 Justifications

Click any non-zero cell to open the justification editor. Write a clear explanation of why the PLO is aligned to that competency at the assigned weight. Justifications are included in exported reports and are critical for accreditation evidence.

### 6.4 Help Tooltips

Small **?** icons appear next to column headers in the mapping matrix. Clicking or hovering over these icons displays a brief explanation of the GA or competency.

---

## 7. Mapping Completeness Tracker

The Mapping Completeness Tracker widget appears on the Admin and Editor dashboards. It shows per-program mapping progress, sorted from least to most complete.

**Configuring alert thresholds:** Click the ⚙ settings icon to set warning and danger thresholds. Programs below the warning threshold are highlighted in yellow; those below the danger threshold are highlighted in red. Defaults are 50% (warning) and 25% (danger).

---

## 8. Mapping Audit Log (Change History)

Located at the bottom of every Program Detail page. Collapsed by default — click the header to expand. Records every change to PLOs, mapping weights, and justifications, including the user's name and the timestamp. Read-only and cannot be edited.

---

## 9. Analytics Dashboards

All analytics dashboards are accessible from the **Analytics** menu and are available to all authenticated users. Charts can be exported as PNG, PDF, Word, or Excel.

| Dashboard | URL | Description |
|---|---|---|
| University-Level | /analytics | Overall alignment across all colleges |
| GA-Level | /analytics/ga | How well each GA is addressed university-wide |
| Competency-Level | /analytics/competencies | Per-competency average weights and coverage |
| College-Level | /analytics/college/:id | Department comparisons within a college |
| Department-Level | /analytics/department/:id | Program comparisons within a department |
| Unified Analytics | /analytics/unified | Combined GA and competency heatmaps |

Each dashboard has a companion **Guide** page explaining how to interpret the charts and use the data for accreditation reporting.

---

## 10. Admin Tools

All admin tools are restricted to the Admin role.

| Tool | URL | Purpose |
|---|---|---|
| User Management | /admin/users | Manage users, roles, and program assignments |
| Organizational Structure | /admin/structure | Manage colleges and departments |
| Cluster Management | /admin/clusters | Group programs into custom reporting clusters |
| Data Completeness | /admin/completeness | Identify programs with incomplete mappings |
| Data Validation | /admin/validation | Find quality issues (missing justifications, etc.) |
| Report Templates | /templates | Download Word/Excel report templates |
| Login Tracking | /login-tracking | Audit log of all user login events |

---

## 11. User Profile

Every user can access their profile from the navigation bar to update their name, email, and password, and to view their assigned programs.

---

## 12. Email Notifications

| Trigger | Recipient | Content |
|---|---|---|
| Program assigned to editor | Editor | Notification with a direct link to the program |
| Forgot password | Requesting user | Password reset link (valid 1 hour) |
| Forgot username | Requesting user | Username associated with the email address |

---

## 13. Database Backup

The system includes a backup script (scripts/backup-db.sh) that creates a compressed MySQL dump. It reads credentials from the DATABASE_URL environment variable, saves backups to /var/backups/plo-ga/, and retains the 7 most recent backups.

To set up the nightly cron job on the VPS:

\`\`\`bash
crontab -e
# Add this line (runs at 2:00 AM every night):
0 2 * * * /home/agastli/htdocs/plo-ga.gastli.org/scripts/backup-db.sh >> /var/log/plo-ga-backup.log 2>&1
\`\`\`

---

## 14. Roles and Permissions Reference

| Feature | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|
| View programs and PLOs | ✓ | ✓ | ✓ |
| View analytics dashboards | ✓ | ✓ | ✓ |
| View mapping matrix | ✓ | ✓ | ✓ |
| View audit log | ✓ | ✓ | ✗ |
| Add / edit PLOs | ✓ | Assigned only | ✗ |
| Bulk import PLOs (CSV) | ✓ | Assigned only | ✗ |
| Edit mapping weights | ✓ | Assigned only | ✗ |
| Edit justifications | ✓ | Assigned only | ✗ |
| Add / edit programs | ✓ | ✗ | ✗ |
| Delete programs | ✓ | ✗ | ✗ |
| Manage users | ✓ | ✗ | ✗ |
| Assign programs to editors | ✓ | ✗ | ✗ |
| Manage organizational structure | ✓ | ✗ | ✗ |
| Manage clusters | ✓ | ✗ | ✗ |
| View data completeness dashboard | ✓ | ✗ | ✗ |
| Run data validation | ✓ | ✗ | ✗ |
| View login tracking | ✓ | ✗ | ✗ |
| Export reports | ✓ | ✓ | ✓ |

---

## 15. Glossary

| Term | Definition |
|---|---|
| **PLO** | Program Learning Outcome — a statement describing what students are expected to know, be able to do, or value upon completing a program. |
| **GA** | Graduate Attribute — one of five broad qualities that Qatar University expects all graduates to demonstrate. |
| **Competency** | A specific, measurable sub-skill or disposition that falls under a Graduate Attribute. |
| **Weighting Factor** | A numeric value (0–100) indicating the degree to which a PLO addresses a specific competency. |
| **Mapping** | The association between a PLO and a competency, characterised by a weighting factor and a written justification. |
| **Alignment Score** | An aggregated metric calculated from the weighting factors, used to compare programs, departments, and colleges. |
| **Completeness Rate** | The percentage of a program's PLOs that have at least one non-zero mapping to a GA/competency. |
| **APQA** | Academic Planning & Quality Assurance — the Qatar University office responsible for accreditation and quality assurance. |
| **Audit Log** | A tamper-evident record of all changes made to PLOs, mappings, and justifications. |

---

*For technical support or system access issues, contact the system administrator or submit a request to the APQA office.*`;

const sections = [
  { id: "1-introduction", label: "1. Introduction" },
  { id: "2-getting-started", label: "2. Getting Started" },
  { id: "3-dashboards", label: "3. Dashboards" },
  { id: "4-programs-management", label: "4. Programs Management" },
  { id: "5-plo-management", label: "5. PLO Management" },
  { id: "6-plo-to-ga-mapping", label: "6. PLO-to-GA Mapping" },
  { id: "7-mapping-completeness-tracker", label: "7. Completeness Tracker" },
  { id: "8-mapping-audit-log-change-history", label: "8. Audit Log" },
  { id: "9-analytics-dashboards", label: "9. Analytics" },
  { id: "10-admin-tools", label: "10. Admin Tools" },
  { id: "11-user-profile", label: "11. User Profile" },
  { id: "12-email-notifications", label: "12. Email Notifications" },
  { id: "13-database-backup", label: "13. Database Backup" },
  { id: "14-roles-and-permissions-reference", label: "14. Roles & Permissions" },
  { id: "15-glossary", label: "15. Glossary" },
];

export default function UserManual() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const downloadManual = () => {
    const contentEl = document.getElementById('manual-content');
    const printWindow = window.open('', '_blank');
    if (!printWindow || !contentEl) return;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PLO-GA Mapping System \u2014 User Manual</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; font-size: 11pt; line-height: 1.65; color: #1a1a1a; background: #fff; }
    .cover { background: #8B1538; color: #fff; padding: 56px 48px 48px; }
    .cover .org { font-size: 12pt; opacity: 0.85; margin-bottom: 10px; letter-spacing: 0.03em; }
    .cover h1 { font-size: 26pt; font-weight: 700; margin-bottom: 8px; }
    .cover .meta { font-size: 10pt; opacity: 0.7; margin-top: 18px; }
    .content { padding: 36px 48px 56px; max-width: 860px; margin: 0 auto; }
    h1 { font-size: 18pt; font-weight: 700; color: #8B1538; margin: 36px 0 12px; border-bottom: 2px solid #8B1538; padding-bottom: 6px; }
    h2 { font-size: 14pt; font-weight: 700; color: #8B1538; margin: 28px 0 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    h3 { font-size: 11.5pt; font-weight: 600; color: #374151; margin: 18px 0 7px; }
    p { margin: 8px 0; text-align: justify; }
    ul, ol { margin: 8px 0 8px 26px; }
    li { margin: 4px 0; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt; }
    th { background: #8B1538; color: #fff; padding: 8px 12px; text-align: left; font-weight: 600; border: 1px solid #6B1028; }
    td { padding: 7px 12px; border: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #fdf8f8; }
    blockquote { border-left: 4px solid #8B1538; background: #fef9f0; padding: 10px 16px; margin: 14px 0; border-radius: 0 4px 4px 0; }
    code { background: #f3f4f6; padding: 2px 5px; border-radius: 3px; font-size: 9pt; font-family: 'Courier New', monospace; }
    pre { background: #1e293b; color: #e2e8f0; padding: 14px 18px; border-radius: 6px; overflow-x: auto; margin: 14px 0; }
    pre code { background: none; padding: 0; font-size: 9pt; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .footer { background: #f9fafb; border-top: 2px solid #8B1538; padding: 14px 48px; text-align: center; font-size: 9pt; color: #6b7280; margin-top: 40px; }
    @media print {
      body { font-size: 10pt; }
      .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tr:nth-child(even) td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      blockquote { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      h1, h2, h3 { page-break-after: avoid; }
      table, blockquote, pre { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <div class="org">Qatar University | Academic Planning &amp; Quality Assurance</div>
    <h1>PLO-GA Mapping System<br/>User Manual</h1>
    <div class="meta">Version 1.0 \u2014 February 2026</div>
  </div>
  <div class="content">${contentEl.innerHTML}</div>
  <div class="footer">PLO-GA Mapping Management System \u2014 Qatar University \u2014 Academic Planning &amp; Quality Assurance Office</div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const { user } = useAuth();
  const role = user?.role ?? "viewer";
  const dashboardPath = role === "admin" ? "/admin" : role === "editor" ? "/editor" : "/viewer";

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Standard QU Header */}
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
        <header className="bg-white rounded-lg shadow-md mb-4">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src="/qu-logo.png" alt="Qatar University" className="h-16 w-auto" />
                <div className="border-l-2 border-[#8B1538] pl-4">
                  <h1 className="text-2xl font-bold text-[#8B1538]">PLO-GA Mapping System</h1>
                  <p className="text-sm text-slate-600">Academic Planning & Quality Assurance Office</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild className="border-gray-400 text-gray-600 hover:bg-gray-50">
                  <Link href={dashboardPath}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Link>
                </Button>
                <Button variant="outline" asChild className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
                <Button
                  onClick={downloadManual}
                  className="bg-[#8B1538] hover:bg-[#6B1028] text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Manual
                </Button>
              </div>
            </div>
          </div>
        </header>
      </div>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pb-2 max-w-7xl">
        <Breadcrumb items={[{ label: "User Manual" }]} />
      </div>
      {/* Page title card */}
      <div className="container mx-auto px-4 pb-4 max-w-7xl">
        <div className="bg-white border-l-4 border-[#8B1538] rounded-lg shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 rounded-full bg-[#8B1538]/10">
              <BookOpen className="h-7 w-7 text-[#8B1538]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#8B1538]">User Manual</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Complete guide to all features of the PLO-GA Mapping Management System.
                Use the table of contents on the left to jump to any section, or scroll through the full document.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-7xl flex-grow">
        <div className="flex gap-8">
          {/* Sticky sidebar TOC */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contents</p>
              <nav className="space-y-1">
                {sections.map(s => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`flex items-center gap-1 text-xs py-1 px-2 rounded transition-colors ${
                      activeSection === s.id
                        ? "bg-[#8B1538]/10 text-[#8B1538] font-semibold"
                        : "text-gray-600 hover:text-[#8B1538] hover:bg-gray-50"
                    }`}
                  >
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Manual content */}
          <main className="flex-1 min-w-0">
            <div id="manual-content" className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-10 prose prose-sm max-w-none
              prose-headings:text-[#8B1538] prose-headings:font-bold
              prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mt-8
              prose-h3:text-base prose-h3:text-gray-800
              prose-a:text-[#8B1538] prose-a:no-underline hover:prose-a:underline
              prose-table:text-sm prose-th:bg-[#8B1538] prose-th:text-white prose-th:font-semibold
              prose-td:border prose-td:border-gray-200 prose-th:border prose-th:border-[#6B1028]
              prose-blockquote:border-l-[#8B1538] prose-blockquote:bg-amber-50 prose-blockquote:py-1 prose-blockquote:rounded-r
              prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-1 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Add id anchors to headings for TOC navigation
                  h2: ({ children, ...props }) => {
                    const text = String(children);
                    const id = text
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/\s+/g, "-")
                      .replace(/-+/g, "-");
                    return <h2 id={id} {...props}>{children}</h2>;
                  },
                }}
              >
                {MANUAL_CONTENT}
              </ReactMarkdown>
            </div>
          </main>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4">
        <PageFooter />
      </div>
    </div>
  );
}
