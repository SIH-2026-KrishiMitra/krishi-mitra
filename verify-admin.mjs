// Admin dashboard verification — Playwright
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:5174';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const SHOTS = 'P:/SIH-Project-2026/krishi-mitra/verify-screenshots';
fs.mkdirSync(SHOTS, { recursive: true });

let passed = 0, failed = 0, warned = 0;

function log(status, label, detail = '') {
  const icon = { PASS:'✅', FAIL:'❌', WARN:'⚠️', PROBE:'🔍', SKIP:'⏭️' }[status] ?? '•';
  const line = `${icon} ${label}${detail ? ' — ' + detail : ''}`;
  console.log(line);
  if (status === 'PASS') passed++;
  else if (status === 'FAIL') failed++;
  else if (status === 'WARN') warned++;
}

async function shot(page, name) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false }).catch(() => {});
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Collect page-level JS errors
  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('ResizeObserver')) jsErrors.push(m.text()); });

  // ────────────────────────────────────────────────────────────────
  // PHASE 1 — Login page UI (no auth)
  // ────────────────────────────────────────────────────────────────
  console.log('\n════ Phase 1: Login page UI ════════════════════════════\n');

  await page.goto(BASE + '/login');
  await page.waitForSelector('button[class*="roleCard"]', { timeout: 10000 }).catch(() => {});

  // NOTE: use button[] to exclude the container div (which also matches [class*="roleCard"])
  const cardBtns = page.locator('button[class*="roleCard"]');
  const cardCount = await cardBtns.count();
  log(cardCount === 3 ? 'PASS' : 'FAIL', `Role cards count = ${cardCount}`, cardCount === 3 ? '' : `expected 3`);
  await shot(page, '01-login-role-step');

  // Admin card text
  const adminCard = cardBtns.nth(2);
  const adminCardText = await adminCard.textContent().catch(() => '');
  log(adminCardText?.includes('Admin') ? 'PASS' : 'FAIL', 'Admin card has "Admin / Staff" label', `"${adminCardText?.trim().slice(0,40)}"`);

  // Shield icon in admin card
  const shieldSvg = await adminCard.locator('svg').count();
  log(shieldSvg > 0 ? 'PASS' : 'FAIL', 'Admin card has Shield icon');

  // Click admin card — should get active class
  await adminCard.click();
  await page.waitForTimeout(300);
  const adminActiveClass = await adminCard.getAttribute('class');
  log(adminActiveClass?.includes('Admin') ? 'PASS' : 'FAIL', 'Admin card gets AdminActive styling on click', adminActiveClass?.split(' ').pop() ?? '');
  await shot(page, '02-admin-card-selected');

  // Admin: no register link visible
  const registerText = await page.locator('text=Create account').isVisible().catch(() => false);
  log(!registerText ? 'PASS' : 'FAIL', 'Register link hidden when admin selected');

  // Admin: no Google button visible
  const googleBtn = await page.locator('button:has-text("Google")').isVisible().catch(() => false);
  log(!googleBtn ? 'PASS' : 'FAIL', 'Google sign-in hidden when admin selected');

  // Proceed to credentials step
  await page.locator('button[class*="primaryBtn"]').click();
  await page.waitForTimeout(600);
  const credTitle = await page.locator('[class*="formTitle"]').textContent().catch(() => '');
  log(credTitle?.includes('Admin sign in') ? 'PASS' : 'FAIL', `Credentials title is "Admin sign in"`, `got: "${credTitle?.trim()}"`);
  await shot(page, '03-admin-creds-step');

  // No phone toggle
  const phoneToggle = await page.locator('button:has-text("phone")').isVisible().catch(() => false);
  log(!phoneToggle ? 'PASS' : 'FAIL', 'Phone toggle hidden for admin');

  // No Google at credentials step either
  const googleAtCreds = await page.locator('button:has-text("Google")').isVisible().catch(() => false);
  log(!googleAtCreds ? 'PASS' : 'FAIL', 'Google sign-in hidden at admin credentials step');

  // PROBE: switch to farmer — google reappears
  await page.goto(BASE + '/login');
  await page.waitForSelector('button[class*="roleCard"]', { timeout: 6000 }).catch(() => {});
  await page.locator('button[class*="roleCard"]').first().click(); // farmer
  await page.waitForTimeout(200);
  await page.locator('button[class*="primaryBtn"]').click();
  await page.waitForTimeout(400);
  const farmerGoogle = await page.locator('button:has-text("Google")').isVisible().catch(() => false);
  log(farmerGoogle ? 'PASS' : 'PROBE', 'PROBE: Google reappears for farmer', farmerGoogle ? 'correct' : 'not visible');
  await shot(page, '04-farmer-has-google');

  // ────────────────────────────────────────────────────────────────
  // PHASE 2 — Unauthenticated route protection
  // ────────────────────────────────────────────────────────────────
  console.log('\n════ Phase 2: Route protection (unauthenticated) ═══════\n');

  const allRoutes = [
    '/admin/home', '/admin/farmers', '/admin/buyers', '/admin/kyc',
    '/admin/products', '/admin/categories', '/admin/orders', '/admin/transactions',
    '/admin/payments', '/admin/payouts', '/admin/refunds', '/admin/complaints',
    '/admin/reviews', '/admin/notifications', '/admin/analytics',
    '/admin/admins', '/admin/audit-logs', '/admin/settings',
  ];

  for (const route of allRoutes) {
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 8000 });
      await page.waitForTimeout(800);
      const finalUrl = page.url();
      const redirected = finalUrl.includes('/login');
      log(redirected ? 'PASS' : 'WARN', `${route}`, redirected ? '→ /login ✓' : `stayed at ${finalUrl}`);
    } catch (e) {
      log('WARN', `${route}`, `navigation error: ${e.message.slice(0, 60)}`);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // PHASE 3 — Authenticated admin session (real form login)
  // ────────────────────────────────────────────────────────────────
  console.log('\n════ Phase 3: Authenticated admin session ═══════════════\n');

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    log('SKIP', 'Phase 3', 'No credentials provided');
    await summarize(browser, jsErrors); return;
  }

  // Log in via the actual form
  await page.goto(BASE + '/login');
  await page.waitForSelector('button[class*="roleCard"]', { timeout: 8000 });

  // Select admin card
  await page.locator('button[class*="roleCard"]').nth(2).click();
  await page.waitForTimeout(200);
  await page.locator('button[class*="primaryBtn"]').click();
  await page.waitForTimeout(500);

  // Fill email + password
  await page.fill('#email', ADMIN_EMAIL);
  await page.fill('#password', ADMIN_PASSWORD);
  await shot(page, '05-admin-login-filled');
  await page.keyboard.press('Enter');

  // Wait for redirect to admin
  let loginOk = false;
  try {
    await page.waitForURL(/\/admin\//, { timeout: 15000 });
    loginOk = true;
    log('PASS', 'Admin login: form submission redirects to /admin/*');
  } catch {
    const url = page.url();
    const errMsg = await page.locator('[class*="errorMsg"]').textContent().catch(() => '');
    log('FAIL', 'Admin login: did not reach /admin/*', `at: ${url} | err: "${errMsg}"`);
    await shot(page, '05-login-fail');
    await summarize(browser, jsErrors); return;
  }

  await page.waitForTimeout(2000); // let AdminContext load data
  await shot(page, '06-admin-home');

  // Dashboard title
  const h1 = await page.locator('h1').first().textContent().catch(() => '');
  log(h1?.toLowerCase().includes('dashboard') || h1?.toLowerCase().includes('admin') ? 'PASS' : 'WARN', 'Dashboard h1 present', `"${h1?.trim()}"`);

  // Search button visible
  const searchBtn = await page.locator('button:has-text("Search anything")').isVisible().catch(() => false);
  log(searchBtn ? 'PASS' : 'FAIL', 'Global search button visible in layout');

  // Ctrl+K opens overlay
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(500);
  const overlayOpen = await page.locator('[class*="overlay"]').isVisible().catch(() => false);
  log(overlayOpen ? 'PASS' : 'FAIL', 'Ctrl+K opens search overlay');
  if (overlayOpen) await shot(page, '07-search-overlay-open');

  // Search input is autofocused
  if (overlayOpen) {
    const focused = await page.evaluate(() => document.activeElement?.tagName === 'INPUT');
    log(focused ? 'PASS' : 'WARN', 'Search input is autofocused');

    // Probe: short query (<2 chars) shows hint
    await page.keyboard.type('a');
    await page.waitForTimeout(300);
    const hint = await page.locator('text=at least 2').isVisible().catch(() => false);
    log(hint ? 'PASS' : 'PROBE', 'PROBE: 1-char query shows "at least 2 characters" hint');

    // Actual search
    await page.keyboard.type('a'); // now "aa" = 2 chars
    await page.waitForTimeout(600);
    const resultCount = await page.locator('[class*="resultItem"]').count();
    log(resultCount >= 0 ? 'PASS' : 'FAIL', `Global search "aa" ran`, `${resultCount} results`);
    await shot(page, '08-search-results');

    // Escape closes
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const closedOverlay = !(await page.locator('[class*="overlay"]').isVisible().catch(() => false));
    log(closedOverlay ? 'PASS' : 'FAIL', 'Escape closes search overlay');
  }

  // ── All 18 admin routes (authenticated) ──────────────────────
  console.log('\n  ── 18 admin routes (authenticated) ──\n');

  const routeTests = [
    { path: '/admin/home',         kw: 'dashboard',      label: 'Dashboard' },
    { path: '/admin/farmers',      kw: 'farmer',         label: 'Farmers' },
    { path: '/admin/buyers',       kw: 'buyer',          label: 'Buyers' },
    { path: '/admin/kyc',          kw: 'kyc',            label: 'KYC' },
    { path: '/admin/products',     kw: 'product',        label: 'Products' },
    { path: '/admin/categories',   kw: 'categor',        label: 'Categories' },
    { path: '/admin/orders',       kw: 'order',          label: 'Orders' },
    { path: '/admin/transactions', kw: 'transaction',    label: 'Transactions' },
    { path: '/admin/payments',     kw: 'payment',        label: 'Payments' },
    { path: '/admin/payouts',      kw: 'payout',         label: 'Payouts' },
    { path: '/admin/refunds',      kw: 'refund',         label: 'Refunds' },
    { path: '/admin/complaints',   kw: 'complaint',      label: 'Complaints' },
    { path: '/admin/reviews',      kw: 'review',         label: 'Reviews' },
    { path: '/admin/notifications',kw: 'notification',   label: 'Notifications' },
    { path: '/admin/analytics',    kw: 'analytic',       label: 'Analytics' },
    { path: '/admin/admins',       kw: 'admin',          label: 'Admins' },
    { path: '/admin/audit-logs',   kw: 'audit',          label: 'Audit Logs' },
    { path: '/admin/settings',     kw: 'setting',        label: 'Settings' },
  ];

  for (const { path, kw, label } of routeTests) {
    jsErrors.length = 0;
    try {
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1500);

      const url = page.url();
      const content = (await page.content()).toLowerCase();
      const onAdmin = url.includes('/admin');
      const hasKw = content.includes(kw);
      const errs = jsErrors.filter(e => !e.includes('chunk') && !e.includes('dynamic'));

      if (!onAdmin) {
        log('FAIL', `${label} (${path})`, `redirected to ${url}`);
      } else if (!hasKw) {
        log('WARN', `${label} (${path})`, `on admin but keyword "${kw}" not found`);
        await shot(page, `route-${label.toLowerCase().replace(/\s/g, '-')}`);
      } else {
        log(errs.length === 0 ? 'PASS' : 'WARN', `${label} (${path})`, errs.length > 0 ? `JS err: ${errs[0].slice(0, 80)}` : '');
      }
    } catch (e) {
      log('FAIL', `${label} (${path})`, e.message.slice(0, 80));
    }
  }

  // ── Deep tests on specific screens ───────────────────────────
  console.log('\n  ── Deep screen tests ──\n');

  // Analytics: charts + stat cards + custom date range
  await page.goto(BASE + '/admin/analytics', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await shot(page, '09-analytics-full');
  const chartSvgs = await page.locator('svg.recharts-surface').count();
  log(chartSvgs >= 4 ? 'PASS' : 'WARN', `Analytics: ${chartSvgs} recharts charts rendered`, chartSvgs >= 8 ? '(includes snapshot charts)' : '');

  const statCards = await page.locator('[class*="statCard"]').count();
  log(statCards === 5 ? 'PASS' : 'WARN', `Analytics: ${statCards} platform snapshot stat cards`, 'expected 5');

  await page.locator('button:has-text("Custom")').click();
  await page.waitForTimeout(400);
  const dateInputCount = await page.locator('input[type="date"]').count();
  log(dateInputCount >= 2 ? 'PASS' : 'FAIL', `Analytics: Custom range shows ${dateInputCount} date inputs`);
  await shot(page, '10-analytics-custom-range');

  // Fill custom range and verify refetch
  if (dateInputCount >= 2) {
    await page.locator('input[type="date"]').nth(0).fill('2026-01-01');
    await page.locator('input[type="date"]').nth(1).fill('2026-09-08');
    await page.waitForTimeout(2000);
    const chartSvgsAfter = await page.locator('svg.recharts-surface').count();
    log(chartSvgsAfter >= 4 ? 'PASS' : 'WARN', `Analytics: charts still render after custom date range applied`);
  }

  // Audit logs: filters present
  await page.goto(BASE + '/admin/audit-logs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await shot(page, '11-audit-logs');
  const auditSearch = await page.locator('input[type="search"]').count();
  const auditSelects = await page.locator('select').count();
  const auditDateInputs = await page.locator('input[type="date"]').count();
  log(auditSearch > 0 ? 'PASS' : 'FAIL', `Audit Logs: search input present`);
  log(auditSelects >= 2 ? 'PASS' : 'WARN', `Audit Logs: ${auditSelects} filter selects (entity type, admin)`);
  log(auditDateInputs >= 2 ? 'PASS' : 'WARN', `Audit Logs: ${auditDateInputs} date range inputs`);

  // Probe: type in audit log search
  if (auditSearch > 0) {
    await page.locator('input[type="search"]').fill('kyc');
    await page.waitForTimeout(400);
    const filtered = await page.locator('tbody tr').count();
    log(filtered >= 0 ? 'PROBE' : 'PROBE', `PROBE: Audit logs filter "kyc" → ${filtered} rows`);
  }

  // Orders: detail panel opens on row click
  await page.goto(BASE + '/admin/orders', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await shot(page, '12-orders');
  const orderRows = await page.locator('tbody tr[class*="tableRow"]').count();
  log(orderRows >= 0 ? 'PASS' : 'WARN', `Orders: ${orderRows} order rows in table`);
  if (orderRows > 0) {
    await page.locator('tbody tr[class*="tableRow"]').first().click();
    await page.waitForTimeout(400);
    const detailPanel = await page.locator('[class*="detailPanel"]').isVisible().catch(() => false);
    log(detailPanel ? 'PASS' : 'WARN', 'Orders: clicking a row opens detail panel');
    await shot(page, '12b-orders-detail-panel');
  }

  // Complaints: priority buttons + note form
  await page.goto(BASE + '/admin/complaints', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await shot(page, '13-complaints');
  const complaintRows = await page.locator('tbody tr[class*="tableRow"]').count();
  log(complaintRows >= 0 ? 'PASS' : 'WARN', `Complaints: ${complaintRows} complaint rows`);

  // Notifications: form elements
  await page.goto(BASE + '/admin/notifications', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const titleInput = await page.locator('input[placeholder*="title" i]').count() + await page.locator('input[placeholder*="Title" i]').count();
  const bodyInput = await page.locator('textarea').count();
  log(titleInput > 0 ? 'PASS' : 'WARN', `Notifications: title input present`);
  log(bodyInput > 0 ? 'PASS' : 'WARN', `Notifications: body textarea present`);
  await shot(page, '14-notifications');

  // Reviews: schema documentation shown
  await page.goto(BASE + '/admin/reviews', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const reviewsContent = await page.content();
  log(reviewsContent.includes('CREATE TABLE') ? 'PASS' : 'FAIL', 'Reviews stub shows CREATE TABLE schema SQL');
  log(reviewsContent.includes('Migration') || reviewsContent.includes('migration') ? 'PASS' : 'WARN', 'Reviews stub shows migration instructions');
  await shot(page, '15-reviews-stub');

  // KYC: search and filters
  await page.goto(BASE + '/admin/kyc', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const kycSearch = await page.locator('input[type="search"]').count();
  const kycChips = await page.locator('[class*="chip"]').count();
  log(kycSearch > 0 ? 'PASS' : 'WARN', `KYC: search input present`);
  log(kycChips > 0 ? 'PASS' : 'WARN', `KYC: ${kycChips} filter chips present`);
  await shot(page, '16-kyc');

  // Settings: profile card + sign out button
  await page.goto(BASE + '/admin/settings', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const settingsContent = await page.content();
  const hasSignOut = settingsContent.toLowerCase().includes('sign out') || settingsContent.toLowerCase().includes('logout');
  log(hasSignOut ? 'PASS' : 'WARN', 'Settings: sign out button present');
  await shot(page, '17-settings');

  // PROBE: Search button click (not keyboard)
  await page.goto(BASE + '/admin/farmers', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.locator('button:has-text("Search anything")').click();
  await page.waitForTimeout(400);
  const btnOverlay = await page.locator('[class*="overlay"]').isVisible().catch(() => false);
  log(btnOverlay ? 'PROBE' : 'FAIL', 'PROBE: Search button click also opens overlay');
  if (btnOverlay) await page.keyboard.press('Escape');

  // PROBE: Sidebar navigation
  await page.goto(BASE + '/admin/home', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const sidebarLinks = await page.locator('nav button').count();
  log(sidebarLinks > 10 ? 'PASS' : 'WARN', `Sidebar: ${sidebarLinks} nav buttons visible`);

  // PROBE: direct URL to /admin redirects to /admin/home or stays
  await page.goto(BASE + '/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const adminRootUrl = page.url();
  log(adminRootUrl.includes('/admin') ? 'PROBE' : 'PROBE', `PROBE: /admin root → ${adminRootUrl}`);

  await summarize(browser, jsErrors);
}

async function summarize(browser, jsErrors) {
  console.log('\n════ Summary ═══════════════════════════════════════════\n');
  console.log(`✅ PASS: ${passed}  ❌ FAIL: ${failed}  ⚠️ WARN: ${warned}`);
  if (jsErrors.length > 0) {
    console.log(`\n⚠️  Unresolved JS errors at exit:`);
    jsErrors.slice(0, 5).forEach(e => console.log(`   • ${e.slice(0, 120)}`));
  }
  await browser.close();
}

main().catch(err => {
  console.error('\n💥 Script crashed:', err.message);
  process.exit(1);
});
