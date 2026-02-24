Below is the extracted and properly structured **Markdown (.md)** version of your PDF content.

You can copy this into a file named:

```
Reporting-System-PRD.md
```

---

# Harvesters International Christian Center

# Central Reporting System Requirements Document

---

## 1. Introduction

### 1.1 Problem Statement

Harvesters International Christian Center currently uses a centralized reporting template for Campus Administrators across its branches. However, due to the complexity of the template, many Campus Administrators do not consistently use it. As a result, reports are collected and submitted in different formats such as Excel, WhatsApp, and Word documents across campuses.

This lack of standardization creates reporting bottlenecks, including difficulty in consolidating reports, delays in submission, and inconsistencies in data. In addition, report review and approval are handled manually, making the process time-consuming and prone to errors.

If this situation continues, the church may experience ongoing reporting inefficiencies, reduced data reliability, and challenges in maintaining centralized records across campuses. Therefore, there is a need for a simplified, standardized, and automated reporting system to improve report collection, review, approval, and storage.

---

### 1.2 Project Objective

The objective of this project is to design a standardized and user-friendly reporting system for Harvesters International Christian Center that enables structured report submission across all campuses.

The system will:

* Support hierarchical reporting from ministry leaders to Campus Administrators
* Streamline report review and approval
* Ensure centralized and consistent report storage
* Improve monitoring and decision-making

---

## 2. Stakeholders

The stakeholders for the Harvesters International Christian Center reporting system include all personnel involved in the collection, review, consolidation, and storage of reports across campuses and church groups.

| Stakeholder          | Roles / Responsibilities                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Campus Administrator | Collects reports from leaders within the campus, integrates them, and submits consolidated campus reports.        |
| Campus Pastor        | Oversees campus performance and reviews consolidated campus reports.                                              |
| Group Administrator  | Collects reports from all campuses within the group, consolidates them, reviews, and submits group-level reports. |
| Group Pastor         | Reviews all campus reports under their group.                                                                     |
| SPO                  | Reviews all group reports to ensure consistency and accuracy.                                                     |
| CEO                  | Reviews all group reports for final oversight and decision-making.                                                |
| Church Ministry      | Reviews and stores all reports for accessibility, record-keeping, and historical reference.                       |

---

## 3. Scope of the Reporting System

### 3.1 In Scope

* Standardizing the reporting process for all campuses
* Standardizing report collection and ensuring centralized storage
* Defining roles and responsibilities for submission, review, and approval
* Identifying report types required from each campus administrator
* Determining submission frequency and deadlines
* Covering reports from both functional and non-functional staff

---

### 3.2 Out of Scope

* Processing financial transactions (offerings, tithes, seed payments)
* Capturing testimonies
* Managing general church announcements or event details
* Streaming services or online worship

---

## 4. Reporting Workflow

### 4.1 Current Process (As-Is)

The current reporting process has multiple flows and bottlenecks, resulting in delays and inconsistencies.

#### Flow 1

* Campus Coordinators submit reports to Campus Administrator
* Campus Administrator sends report to Church Ministry at discretion
* Church Ministry forwards reports to SPO and CEO

**Issues:**

* Lack of accountability
* Delays in submission
* No enforcement mechanism

---

#### Flow 2

* Church Ministry consolidates, reviews, and stores reports
* Church Ministry collects reports manually from campuses
* Manual coordination required

**Issues:**

* Time-consuming
* Error-prone
* No standardized submission process
* Significant time spent collecting instead of reviewing

---

### 4.2 Future Process Flow (To-Be)

**Proposed Hierarchy:**

```
Start → Campus Departmental Leaders → Campus Admin → 
Campus Pastor → Group Admin → Group Pastor → 
Church Ministry → Senior Pastor (SPO) → CEO → End
```

---

### Campus Admin

* Compiles departmental reports
* Submits consolidated report
* Status automatically set to **Submitted**
* Campus Pastor notified via email
* Can edit until approval or deadline

---

### Campus Pastor

* Reviews submitted reports
* Can:

  * Approve (Status: Approved)
  * Request Edits (Status: Requires Edits)
* Adds notes/feedback
* Cannot modify after approval or deadline

---

### Group Admin / Group Pastor

* View submitted and approved campus reports
* Can mark reports as **Reviewed**

---

### Church Ministry / SPO / CEO

* Visibility across all stages
* Monitor status
* Access dashboards and analytics

---

### Key Improvements

* Standardized process
* Clear hierarchy
* Role-defined responsibilities
* Status tracking:

  * Submitted
  * Requires Edits
  * Approved
  * Reviewed
* Email notifications
* Centralized visibility
* Improved accountability

---

## 5. Functional Requirements

### 5.1 Dashboard Structure

* **FR1:** Dashboard organizes campuses by groups

---

### 5.2 Group Navigation

* **FR2:** Display all campus groups
* **FR3:** Click to view campuses under group
* **FR4:** Dropdown list for campuses

---

### 5.3 Role-Based Reporting Fields

* **FR5:** Display fields based on role
* **FR6:** Allow entry into assigned fields
* **FR7:** Restrict access to unassigned fields

---

### 5.4 Strategic Indicator & Key Metric Structure

* **FR8:** Strategic Indicator contains Key Metrics
* **FR9:** Key Metrics are numeric input fields
* **FR10:** Capture:

  * Monthly Goal
  * Monthly Achieved
  * Year-on-Year Goal
* **FR11:** Numeric validation
* **FR12:** Required fields mandatory
* **FR13:** Restrict to numeric input
* **FR14:** Range validation
* **FR15:** Auto-save
* **FR16:** Auto-calculate performance summaries
* **FR17:** Prevent submission if incomplete

---

### 5.5 Field Locking & Time-Based Controls

* **FR18:** Lock Monthly Goal after submission
* **FR19:** Lock Year-on-Year Goal after submission
* **FR20:** Allow editing Monthly Achieved until month end
* **FR21:** Lock Monthly Achieved at month end
* **FR22:** Prevent modification of locked fields
* **FR23:** Allow authorized override

---

### 5.6 Role Access & Permissions

* **FR24:** Group roles can mark as Reviewed
* **FR25:** Activity visibility based on access level
* **FR26:** Leadership access to analytics dashboards

---

### 5.7 Editing Control

* **FR27:** Allow editing within timeframe
* **FR28:** Prevent editing after approval or deadline
* **FR29:** Auto-approve if deadline passes without action

---

### 5.8 Notification Requirements

* **FR30:** Notify when:

  * Report submitted
  * Edits requested
  * Approved
  * Available for review

---

### 5.9 Reporting Schedule

* **FR44:** Support weekly submission
* **FR45:** Allow submission within defined weekly period
* **FR46:** Track by week, month, year

---

### 5.10 User Authentication

#### Referral Registration

* **FR47:** Developer creates Super-admin
* **FR48:** Super-admin generates referral links
* **FR49:** Users register via referral
* **FR50:** Auto-assign role based on link
* **FR51:** Group Admin generates links for lower roles

#### Classic Registration

* **FR52:** Register via email/password
* **FR53:** Default role = Member
* **FR54:** Super-admin can reassign role

#### Login

* **FR55:** Login via email/password
* **FR56:** Role-based access control
* **FR57:** Referral link valid until used
* **FR58:** Link invalid after use

---

## 6. Non-Functional Requirements

### 6.1 Performance

* Dashboard loads within 3 seconds
* Submissions processed within 5 seconds
* Support concurrent users

---

### 6.2 Availability

* 24/7 availability
* Scheduled maintenance communicated

---

### 6.3 Security

* Role-Based Access Control (RBAC)
* Secure authentication
* HTTPS encryption
* Audit trail for submissions and approvals

---

### 6.4 Usability

* User-friendly interface
* Navigation within 3 clicks
* Clear validation messages

---

### 6.5 Compatibility

* Desktop
* Tablet
* Mobile
* Modern browsers (Chrome, Edge, Safari, Firefox)

---

### 6.6 Data Storage & Retrieval

* Centralized database
* Historical data retrieval
* Data consistency

---

### 6.7 Data Integrity & Backup

* Auto-save
* Daily backups
* Data consistency across reporting levels

---

### 6.8 Scalability

* Support addition of new groups and campuses

---

### 6.9 Authentication Security

* Encrypted password storage
* Session timeout (e.g., 30 minutes)
* HTTPS transmission
* Support at least 200 simultaneous logins
* Audit trail for login and registration

---

## 7. Assumptions

* All campuses have internet access
* Users have login credentials
* Strategic indicators provided by leaders
* All stakeholders have internet-enabled devices

---

## 8. Constraints

### 8.1 Web Access Only

* Browser-based platform
* No mobile app

### 8.2 Existing Church IT Setup

* Use existing computers and network
* No new servers

### 8.3 Budget Limitations

* Some features may be phased

### 8.4 Reporting Schedule

* Weekly reporting cycle required

---

## 9. Risks

* User resistance
* Delayed submissions
* Data entry errors
* System downtime during peak periods

---

## 10. Approval

| Name                | Role | Signature | Date |
| ------------------- | ---- | --------- | ---- |
| Church Ministry     |      |           |      |
| Senior Pastor (SPO) |      |           |      |
| CEO                 |      |           |      |

---

