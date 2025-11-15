# Frontend Testing Guide - StockSync

A comprehensive manual testing guide to validate all features of the StockSync website **through the browser UI** (not curl).

---

## Prerequisites
- Backend running: `cd backend && npm run dev`
- Frontend running: `cd my-react-app && npm run dev`
- Browser: open http://localhost:5173 (or the Vite URL shown)
- Test accounts ready:
  - **Admin (seeded):** admin@stocksync.local / admin123
  - **Manager (seeded):** sophie.martin@stocksync.local / manager123
  - **Test user (created):** tester@stocksync.local / test123

---

## 1. Authentication & Login Flow

### 1.1 Login Page Display
- **Action:** Open http://localhost:5173 (you should land on /login)
- **Expectations:**
  - ✓ Page shows "StockSync" header with logo
  - ✓ Form has "Email ou Identifiant" and "Mot de passe" fields
  - ✓ "Se souvenir de moi" checkbox visible
  - ✓ "Mot de passe oublié ?" link present
  - ✓ "Se Connecter" button visible
- **Record:** Screenshot or note: PASS / FAIL

### 1.2 Invalid Login
- **Action:** Enter bogus email (test@test.com) and password (wrong), click "Se Connecter"
- **Expectations:**
  - ✓ Error message appears: "Identifiant ou mot de passe incorrect."
  - ✓ User stays on /login page
  - ✓ Fields retain values (or clear, depending on design)
- **Record:** PASS / FAIL + screenshot of error

### 1.3 Valid Login (Tester User)
- **Action:** Enter tester@stocksync.local / test123 and click "Se Connecter"
- **Expectations:**
  - ✓ Success message appears (brief "Connexion réussie" or similar)
  - ✓ Redirected to dashboard (homepage / /)
  - ✓ No console errors (check DevTools)
  - ✓ User stays logged in on page reload
- **Record:** PASS / FAIL + timestamp

### 1.4 Remember Me
- **Action:** Check "Se souvenir de moi", then login
- **Expectations:**
  - ✓ localStorage shows rememberMe flag set
  - ✓ On return visit, login is auto-filled (optional UX)
- **Record:** PASS / FAIL

### 1.5 Logout / Session End
- **Action:** (After logging in) Look for a logout button / menu option
- **Expectations:**
  - ✓ Logout clears localStorage
  - ✓ Redirects back to /login
  - ✓ Cannot access other pages without re-login
- **Record:** PASS / FAIL + note if logout button location

---

## 2. Dashboard / Home Page

### 2.1 Dashboard Loads
- **Action:** After login, view the home page
- **Expectations:**
  - ✓ Page displays (no 500 error)
  - ✓ Shows user's name/email somewhere (top-right or welcome message)
  - ✓ Navigation menu visible (if applicable)
- **Record:** PASS / FAIL

### 2.2 Quick Stats / Summary Cards
- **Action:** Look for summary boxes (warehouses count, transfers, alerts, etc.)
- **Expectations:**
  - ✓ Stats display without errors
  - ✓ Numbers are reasonable (not showing all system data if user is restricted)
  - ✓ For tester user: should only show data for "Entrepôt Paris Nord"
- **Record:** PASS / FAIL + screenshot

---

## 3. Warehouses Page

### 3.1 List Warehouses (Non-Admin User)
- **Action:** Login as tester, navigate to Warehouses page
- **Expectations:**
  - ✓ Page loads
  - ✓ Shows only warehouses assigned to tester: "Entrepôt Paris Nord"
  - ✓ Does **NOT** show other warehouses (e.g., "Entrepôt Lyon")
  - ✓ Each warehouse shows: name, capacity, used space, available
- **Record:** PASS / FAIL + screenshot + list of visible warehouses

### 3.2 Warehouse Details
- **Action:** Click on "Entrepôt Paris Nord"
- **Expectations:**
  - ✓ Detail page or modal opens
  - ✓ Shows full info: name, capacity, current stock, available space
  - ✓ Shows recent transfers (if applicable)
- **Record:** PASS / FAIL

### 3.3 Warehouse Operations (if visible to user)
- **Action:** Try to edit warehouse (if "Edit" button present) or create new warehouse (if permissions allow)
- **Expectations:**
  - ✓ Form shows (or modal)
  - ✓ Can submit changes
  - ✓ Validation works (e.g., capacity must be > 0)
  - ✓ Changes reflected on list after save
- **Record:** PASS / FAIL + note on which operations are available

### 3.4 List Warehouses (Admin User)
- **Action:** Logout, login as admin@stocksync.local / admin123
- **Navigate to Warehouses**
- **Expectations:**
  - ✓ Admin sees **ALL** warehouses (typically 4: Paris Nord, Lyon, Marseille, Bordeaux or similar)
  - ✓ Admin has create/edit/delete buttons visible for all
  - ✓ Number of warehouses differs from tester's view
- **Record:** PASS / FAIL + list of visible warehouses + comparison note

### 3.5 Create Warehouse (Admin Only)
- **Action:** Admin clicks "Create" or "+ New Warehouse" button
- **Expectations:**
  - ✓ Form opens (modal or new page)
  - ✓ Fields: name, capacity (and others as designed)
  - ✓ Submit creates warehouse
  - ✓ New warehouse appears in list
- **Record:** PASS / FAIL + new warehouse name

### 3.6 Edit Warehouse (Admin)
- **Action:** Admin clicks "Edit" on a warehouse, change a field (e.g., capacity), save
- **Expectations:**
  - ✓ Form pre-fills current data
  - ✓ Change is saved
  - ✓ List reflects update
- **Record:** PASS / FAIL + change made

### 3.7 Delete Warehouse (Admin)
- **Action:** Admin clicks "Delete" on a warehouse
- **Expectations:**
  - ✓ Confirmation modal appears
  - ✓ Confirm delete removes warehouse
  - ✓ Cannot delete if transfers/stock exist (if business rule enforced)
- **Record:** PASS / FAIL + note on confirmation behavior

---

## 4. Transfers Page

### 4.1 List Transfers (Non-Admin User)
- **Action:** Login as tester, navigate to Transfers page
- **Expectations:**
  - ✓ Page loads
  - ✓ Shows only transfers involving tester's warehouses (from or to "Entrepôt Paris Nord")
  - ✓ Does NOT show transfers between warehouses tester cannot access
  - ✓ Each transfer shows: source, destination, items, status (pending/in-transit/received), date
- **Record:** PASS / FAIL + screenshot + visible transfers count

### 4.2 Create Transfer (Non-Admin)
- **Action:** Click "Create Transfer" or "+ New Transfer"
- **Expectations:**
  - ✓ Form opens
  - ✓ Source warehouse dropdown shows only allowed warehouses for tester
  - ✓ Destination dropdown shows allowed destination (typically same or accessible ones)
  - ✓ Can add items (SKU, quantity)
  - ✓ Submit creates transfer
- **Record:** PASS / FAIL + transfer created

### 4.3 Create Transfer with Forbidden Source (Negative Test)
- **Action:** Try to manually modify/select a warehouse tester cannot access as source
- **Expectations:**
  - ✓ Form should not allow this (dropdown limited)
  - ✓ OR if user tries to bypass (e.g., via dev tools), server returns 403
- **Record:** PASS / FAIL + security behavior noted

### 4.4 Transfer Status Transitions
- **Action:** View a transfer, check if status can be changed (pending → in-transit → received)
- **Expectations:**
  - ✓ Status transitions are available (buttons or dropdown)
  - ✓ Clicking "Receive" updates status and reflects in item counts
  - ✓ Warehouse inventory updates appropriately
- **Record:** PASS / FAIL + workflow note

### 4.5 View Transfer Details
- **Action:** Click on a transfer to see details
- **Expectations:**
  - ✓ Full transfer info displayed: source, destination, items list, timeline/status
  - ✓ Can take actions (receive, edit, delete if permissions allow)
- **Record:** PASS / FAIL

### 4.6 List Transfers (Admin)
- **Action:** Logout, login as admin, navigate to Transfers
- **Expectations:**
  - ✓ Admin sees **ALL** transfers in system
  - ✓ Significantly more transfers visible than non-admin view
- **Record:** PASS / FAIL + count comparison

---

## 5. Users / Administration Page

### 5.1 List Users (Admin Only)
- **Action:** Admin navigates to Users or Administration page
- **Expectations:**
  - ✓ Page shows all users: name, email, roles, assigned warehouses
  - ✓ Includes seeded users (admin, sophie) and any created (tester)
- **Record:** PASS / FAIL + user count

### 5.2 Create User (Admin)
- **Action:** Admin clicks "Create User" or "+ New User"
- **Expectations:**
  - ✓ Form opens
  - ✓ Fields: name, email, password (or auto-gen), roles (checkboxes for admin/gestionnaire/agent/etc.), warehouse assignments (multi-select)
  - ✓ Submit creates user
  - ✓ New user appears in list
- **Record:** PASS / FAIL + new user email

### 5.3 Edit User (Admin)
- **Action:** Admin edits an existing user (change password, roles, warehouse assignment)
- **Expectations:**
  - ✓ Form pre-fills
  - ✓ Can save changes
  - ✓ If password changed, next login uses new password
- **Record:** PASS / FAIL

### 5.4 Delete User (Admin)
- **Action:** Admin deletes a user (preferably one without active transfers)
- **Expectations:**
  - ✓ Confirmation dialog
  - ✓ User removed from list
  - ✓ Deleted user cannot login afterward
- **Record:** PASS / FAIL

### 5.5 Role-Based Visibility (if applicable)
- **Action:** Non-admin users try to access Users/Admin page
- **Expectations:**
  - ✓ Page not accessible (403 or redirect to dashboard)
  - ✓ OR if visible, read-only with no edit/create buttons
- **Record:** PASS / FAIL + access control note

---

## 6. Analytics / Dashboard Page

### 6.1 Analytics for Non-Admin User
- **Action:** Login as tester, navigate to Analytics or Dashboard
- **Expectations:**
  - ✓ Page loads
  - ✓ Shows only metrics for "Entrepôt Paris Nord" (tester's warehouse)
  - ✓ Charts/graphs reflect only that warehouse's data
  - ✓ No leakage of other warehouses' data
- **Record:** PASS / FAIL + screenshot

### 6.2 Analytics for Admin User
- **Action:** Admin views Analytics
- **Expectations:**
  - ✓ Shows system-wide metrics (all warehouses combined or individual)
  - ✓ Numbers are significantly larger than non-admin view
  - ✓ Option to drill-down by warehouse (if feature exists)
- **Record:** PASS / FAIL + screenshot + data scope note

### 6.3 Key Metrics Displayed
- **Action:** Check for the following metrics on analytics:
  - Total warehouses, total capacity, utilization %
  - Total transfers, pending, in-transit, completed
  - Stock levels by warehouse
  - Alerts count
- **Expectations:**
  - ✓ All relevant metrics are shown
  - ✓ Numbers are logical and match data
  - ✓ Charts/visualizations are readable
- **Record:** PASS / FAIL + metrics visible + any missing noted

---

## 7. Alerts Page (if implemented)

### 7.1 List Alerts
- **Action:** Navigate to Alerts page
- **Expectations:**
  - ✓ Page loads
  - ✓ Shows alerts for user's warehouses only (non-admin)
  - ✓ Each alert shows: message, warehouse, severity (high/medium/low), status (new/acknowledged)
- **Record:** PASS / FAIL

### 7.2 Create Alert (if admin-only feature)
- **Action:** Admin creates an alert (e.g., "Low stock warning")
- **Expectations:**
  - ✓ Form shows: message, warehouse(s), severity, recipients
  - ✓ Alert appears in list for affected users
- **Record:** PASS / FAIL

### 7.3 Acknowledge Alert
- **Action:** Click "Acknowledge" or similar on an alert
- **Expectations:**
  - ✓ Status changes to "Acknowledged"
  - ✓ Alert may still be visible but marked as read
- **Record:** PASS / FAIL

---

## 8. Settings / Configuration Page

### 8.1 Settings Page (if available)
- **Action:** Navigate to Settings (often in header or user menu)
- **Expectations:**
  - ✓ Page loads
  - ✓ Shows user profile info: name, email, role(s), assigned warehouses
  - ✓ Option to change password
- **Record:** PASS / FAIL

### 8.2 Change Password
- **Action:** Enter old password, new password (twice), submit
- **Expectations:**
  - ✓ Success message
  - ✓ On re-login, old password fails, new password works
- **Record:** PASS / FAIL + password changed note

---

## 9. UI / UX & Cross-Browser Tests

### 9.1 Form Validation
- **Action:** Try to submit forms with missing/invalid fields
- **Expectations:**
  - ✓ Client-side validation prevents submission
  - ✓ Error messages shown in French (if applicable): "Veuillez entrer..."
  - ✓ Fields highlighted in red or marked with asterisks
- **Record:** PASS / FAIL + validation examples

### 9.2 Responsive Design
- **Action:** Open DevTools, test on mobile (375px), tablet (768px), desktop (1920px)
- **Expectations:**
  - ✓ Layout adapts (no horizontal scroll, readable text)
  - ✓ Navigation accessible on mobile (hamburger menu or similar)
  - ✓ Forms stack vertically on mobile
- **Record:** PASS / FAIL for each breakpoint + screenshot

### 9.3 Loading States
- **Action:** Navigate between pages, create/delete items, watch for loading spinners
- **Expectations:**
  - ✓ Spinner or "Loading..." message appears during fetch
  - ✓ Buttons disabled while saving
  - ✓ Data appears once loaded
- **Record:** PASS / FAIL

### 9.4 Error Handling
- **Action:** Simulate error by stopping backend, then try to fetch data in UI
- **Expectations:**
  - ✓ Error message shown (not a blank page or console error)
  - ✓ Message is user-friendly: "Impossible de joindre le serveur."
  - ✓ User can retry or navigate elsewhere
- **Record:** PASS / FAIL + error message text

### 9.5 Tooltips / Help
- **Action:** Hover over info icons (?) or help buttons
- **Expectations:**
  - ✓ Tooltips appear explaining fields/actions
  - ✓ Tooltips disappear on mouseleave
- **Record:** PASS / FAIL + tooltip examples

### 9.6 Accessibility (Bonus)
- **Action:** Tab through forms, check label associations, test with screen reader if available
- **Expectations:**
  - ✓ Tab order is logical
  - ✓ Form labels associated with inputs (<label htmlFor>)
  - ✓ Color contrast sufficient (WCAG AA)
- **Record:** PASS / FAIL + accessibility notes

---

## 10. Navigation & Menu

### 10.1 Main Navigation
- **Action:** Check the main navigation menu/sidebar
- **Expectations:**
  - ✓ Menu shows relevant pages:
    - Dashboard (always)
    - Warehouses
    - Transfers
    - Analytics
    - Users (admin only)
    - Settings
    - Alerts
  - ✓ Non-admin users don't see admin-only pages
  - ✓ Current page highlighted/active
- **Record:** PASS / FAIL + menu structure note

### 10.2 Breadcrumbs (if present)
- **Action:** Navigate to nested pages (e.g., Warehouses > Detail)
- **Expectations:**
  - ✓ Breadcrumbs show current path
  - ✓ Can click to go back
- **Record:** PASS / FAIL

### 10.3 Back / Forward Navigation
- **Action:** Use browser back/forward buttons
- **Expectations:**
  - ✓ Navigation works as expected
  - ✓ Page state preserved (e.g., scroll position, filters)
- **Record:** PASS / FAIL

---

## 11. RBAC / Permission Tests

### 11.1 Unauthorized Page Access
- **Action:** Non-admin user tries to access /admin or /users by typing URL
- **Expectations:**
  - ✓ Redirected to /login or dashboard
  - ✓ No error in console
- **Record:** PASS / FAIL

### 11.2 Edit Warehouse (Non-Owner)
- **Action:** Tester tries to edit a warehouse they don't have in their assignments (if such a page exists)
- **Expectations:**
  - ✓ Edit button not visible
  - ✓ OR if URL accessed directly, server returns 403 / forbidden
- **Record:** PASS / FAIL

### 11.3 Delete Warehouse (Non-Admin)
- **Action:** Non-admin tries to delete a warehouse
- **Expectations:**
  - ✓ Delete button not visible or disabled
  - ✓ If attempted via API, 403 returned
- **Record:** PASS / FAIL

### 11.4 Create Transfer Between Unauthorized Warehouses
- **Action:** Non-admin tries to create transfer from warehouse they don't have access to
- **Expectations:**
  - ✓ Source warehouse not in dropdown
  - ✓ Cannot manually select (form validation or disabled)
- **Record:** PASS / FAIL

---

## 12. Performance & Load Times

### 12.1 Page Load Time
- **Action:** Open DevTools > Performance, load each page, record time
- **Expectations:**
  - ✓ First paint < 1s (ideally)
  - ✓ Full page interactive < 3s
- **Record:** PASS / FAIL + times for dashboard, warehouses, transfers, analytics

### 12.2 Large Data Sets
- **Action:** If DB has many transfers/warehouses, list page should handle it
- **Expectations:**
  - ✓ Page doesn't freeze or crash
  - ✓ Pagination or virtualization (if implemented) works
  - ✓ Search/filter functionality responsive
- **Record:** PASS / FAIL + data volume + performance note

---

## 13. Data Integrity & Consistency

### 13.1 Data Reflects Backend
- **Action:** Create a warehouse/transfer via UI, then refresh the page
- **Expectations:**
  - ✓ Data persists
  - ✓ Reflects in lists after refresh
  - ✓ No stale cache issues
- **Record:** PASS / FAIL

### 13.2 Concurrent Updates
- **Action:** Open the same page in two browser tabs, make a change in one tab, check if the other auto-updates (optional)
- **Expectations:**
  - ✓ Second tab should refresh or show notification
  - ✓ OR user manually refreshes and sees new data
- **Record:** PASS / FAIL + behavior note

---

## 14. Multi-User Scenarios

### 14.1 Two Users Editing Same Resource
- **Action:** In one tab, tester edits a transfer. In another tab (with admin logged in), check if changes are visible
- **Expectations:**
  - ✓ Admin sees the updated transfer
  - ✓ No conflicts or errors
- **Record:** PASS / FAIL

### 14.2 User Permissions Change While Logged In
- **Action:** (Advanced) Admin edits tester's warehouse assignment while tester is logged in. Tester refreshes page.
- **Expectations:**
  - ✓ Tester's visible warehouses update
  - ✓ Tester no longer sees/can edit removed warehouses
- **Record:** PASS / FAIL

---

## Test Results Summary

Use this table to track results:

| Test ID | Category | Test Name | Steps | Expected | Actual | Status | Notes |
|---------|----------|-----------|-------|----------|--------|--------|-------|
| 1.1 | Auth | Login Page Display | Open /login | Form visible | ... | PASS/FAIL | ... |
| 1.2 | Auth | Invalid Login | Wrong creds | Error shown | ... | PASS/FAIL | ... |
| 1.3 | Auth | Valid Login | tester@... | Redirected | ... | PASS/FAIL | ... |
| 2.1 | Dashboard | Dashboard Loads | After login | Page loads | ... | PASS/FAIL | ... |
| 3.1 | Warehouses | List (Non-Admin) | Navigate to page | Only Paris Nord | ... | PASS/FAIL | ... |
| 3.4 | Warehouses | List (Admin) | Admin login | All 4 | ... | PASS/FAIL | ... |
| 4.1 | Transfers | List (Non-Admin) | View transfers | Only allowed | ... | PASS/FAIL | ... |
| 5.1 | Users | List Users (Admin) | Navigate to page | All users | ... | PASS/FAIL | ... |
| 6.1 | Analytics | Non-Admin View | View analytics | Only user data | ... | PASS/FAIL | ... |
| 9.1 | UX | Form Validation | Submit empty form | Error shown | ... | PASS/FAIL | ... |
| 11.1 | RBAC | Unauthorized Access | Try /admin | Redirected | ... | PASS/FAIL | ... |

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Page won't load (blank screen) | Check DevTools Console for errors. Verify backend is running. Clear browser cache. |
| Login fails with "Identifiant ou mot de passe incorrect" | Verify credentials (check seed.ts for seeded accounts). Check localStorage doesn't have stale user id. |
| Can see data you shouldn't (RBAC fail) | Logout, login as different user, compare visible data. Check X-User-ID header in Network tab. |
| Form won't submit | Check for validation errors (red highlights). Verify all required fields filled. Check DevTools console for JavaScript errors. |
| Warehouse/transfer not appearing after create | Refresh page. Check Network tab for successful POST. Verify user has permission to see it. |
| Performance degraded | Check if many items in list. Look for N+1 queries in backend logs. Consider pagination/lazy loading. |

---

## Next Steps
After completing these tests:
1. Compile a pass/fail summary
2. Note any failures with exact steps to reproduce
3. Post failures here with screenshots/console logs
4. I can then create targeted fixes or add missing features
5. Once all manual tests pass, move to automated testing (E2E with Cypress)

---

## Document Version
- **Version:** 1.0
- **Date:** Nov 15, 2025
- **App:** StockSync v1.0

Good luck! 🧪
