/**
 * @fileoverview Presentation Layer for the Administrative Dashboard.
 * Orchestrates the "at-a-glance" institutional overview, including
 * high-level statistics and navigation shortcuts.
 * @module admin/views/dashboardView
 */

/**
 * Renders the primary administrative landing page ("Command Center").
 * Displays key metrics across schools, people, and academic cycles.
 * @param {object} options - Dashboard state properties.
 * @param {object} options.stats - Compiled metrics (totals for schools, students, etc.).
 * @param {Array<object>} options.quickLinkGroups - Grouped navigation shortcuts for the hero and panels.
 * @param {string} options.generatedAt - Timestamp of the data snapshot.
 */
export function renderAdminHome({
  stats = {},
  quickLinkGroups = [],
  generatedAt = ""
} = {}) {
  setHeroVisibility(false);

  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const structureCards = [
    { label: "Schools", value: stats.totalSchools },
    { label: "Departments", value: stats.totalDepartments },
    { label: "Programs", value: stats.totalPrograms },
    { label: "Courses", value: stats.totalCourses }
  ];

  const peopleCards = [
    { label: "Students", value: stats.totalStudents },
    { label: "Admins", value: stats.totalAdmins },
    { label: "Faculty", value: stats.totalFaculty }
  ];

  const cycleCards = [
    { label: "Active Academic Year", value: stats.activeAcademicYear || "N/A" },
    { label: "Active Semester", value: stats.activeSemester || "N/A" }
  ];

  content.innerHTML = `
    <section class="panel dashboard-panel dashboard-hero">
      <div class="hero-dashboard-copy">
        <h2><i class=\"fas fa-chart-line\"></i> Command Center for Academic Operations</h2>
        <p>Track institutional health at a glance, then jump directly to the most critical admin workflows.</p>
        <div class="dashboard-links-grid dashboard-links-grid-top">
          ${renderQuickLinks(quickLinkGroups.find((group) => group.key === "top")?.links || [])}
        </div>
      </div>
      <div class="hero-dashboard-highlights">
        <article class="hero-highlight">
          <p class="hero-highlight-label">Students</p>
          <h3>${escapeHtml(formatValue(stats.totalStudents))}</h3>
          <span>Active learner accounts in the system.</span>
        </article>
        <article class="hero-highlight">
          <p class="hero-highlight-label">Courses</p>
          <h3>${escapeHtml(formatValue(stats.totalCourses))}</h3>
          <span>Total courses configured for delivery.</span>
        </article>
        <article class="hero-highlight">
          <p class="hero-highlight-label">Active Semester</p>
          <h3>${escapeHtml(formatValue(stats.activeSemester || "N/A"))}</h3>
          <span>Current teaching and enrollment window.</span>
        </article>
      </div>
    </section>

    <section class="panel dashboard-panel">
      <div class="dashboard-header">
        <div>
          <h2><i class="fas fa-building"></i> Academic Structure</h2>
          <p class="dashboard-subtitle">Coverage of organizational units and learning offerings.</p>
        </div>
        <button type="button" class="js-dashboard-refresh">Refresh</button>
      </div>
      <p class="form-message" id="dashboard-message" role="status" aria-live="polite"></p>
      <div class="dashboard-grid dashboard-grid-large">
        ${renderCards(structureCards)}
      </div>
      <div class="dashboard-links-grid">
        ${renderQuickLinks(quickLinkGroups.find((group) => group.key === "structure")?.links || [])}
      </div>
    </section>

    <section class="panel dashboard-panel">
      <div class="dashboard-header">
        <div>
          <h2><i class="fas fa-users"></i> People and Access</h2>
          <p class="dashboard-subtitle">Current user population and administrative access footprint.</p>
        </div>
      </div>
      <div class="dashboard-grid">
        ${renderCards(peopleCards)}
      </div>
      <div class="dashboard-links-grid">
        ${renderQuickLinks(quickLinkGroups.find((group) => group.key === "people")?.links || [])}
      </div>
    </section>

    <section class="panel dashboard-panel">
      <div class="dashboard-header">
        <div>
          <h2><i class="fas fa-calendar-alt"></i> Academic Cycle</h2>
          <p class="dashboard-subtitle">Current delivery period that drives enrollment and coursework.</p>
        </div>
      </div>
      <div class="dashboard-grid">
        ${renderCards(cycleCards)}
      </div>
      <div class="dashboard-links-grid">
        ${renderQuickLinks(quickLinkGroups.find((group) => group.key === "cycle")?.links || [])}
      </div>
      <p class="dashboard-updated">Updated: ${escapeHtml(generatedAt || "N/A")}</p>
    </section>`;
}

/**
 * Binds global triggers (brand logo or user profile links) that navigate back to the Dashboard.
 * @param {Function} onOpenHome - Callback to initiate dashboard re-rendering.
 */
export function bindAdminHomeTriggers(onOpenHome) {
  const adminLinks = document.querySelectorAll(".js-active-user");
  adminLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onOpenHome();
    });
  });

  const brandHome = document.querySelector(".js-admin-home");
  if (brandHome) {
    brandHome.addEventListener("click", () => onOpenHome());
    brandHome.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpenHome();
      }
    });
  }
}

/**
 * Binds interactive actions within the dashboard panels (Refresh, Quick Links).
 * @param {object} actions - Action callbacks.
 * @param {Function} actions.onRefresh - Triggered by the refresh button.
 * @param {Function} actions.onQuickLink - Triggered by any dashboard navigation shortcut.
 */
export function bindDashboardActions({ onRefresh, onQuickLink }) {
  const refreshButton = document.querySelector(".js-dashboard-refresh");
  if (refreshButton instanceof HTMLButtonElement && onRefresh) {
    refreshButton.addEventListener("click", onRefresh);
  }

  const quickLinks = document.querySelectorAll(".js-dashboard-link");
  quickLinks.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-target") || "";
      if (target && onQuickLink) {
        onQuickLink(target);
      }
    });
  });
}

/**
 * Updates the dashboard feedback message (e.g., "Refreshing data...").
 * @param {string} message - Feedback text.
 * @param {string} [type] - Contextual UI type ('success' or 'error').
 */
export function setDashboardMessage(message, type = "") {
  const messageElement = document.querySelector("#dashboard-message");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");
  if (type === "success") {
    messageElement.classList.add("is-success");
  }
  if (type === "error") {
    messageElement.classList.add("is-error");
  }
}

/**
 * Formats format value.
 * @param {*} value
 * @returns {string}
 */
function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }
  return String(value);
}

/**
 * Renders render cards.
 * @param {Array<*>} cards
 * @returns {void}
 */
function renderCards(cards) {
  return cards
    .map(
      (card) => `
      <article class="dashboard-card">
        <p class="dashboard-card-label">${escapeHtml(card.label)}</p>
        <p class="dashboard-card-value">${escapeHtml(formatValue(card.value))}</p>
      </article>`
    )
    .join("");
}

/**
 * Renders render quick links.
 * @param {Array<*>} links
 * @returns {void}
 */
function renderQuickLinks(links) {
  return links
    .map(
      (link) => `
      <button type="button" class="dashboard-link-btn js-dashboard-link" data-target="${escapeHtml(
        link.target
      )}">${escapeHtml(link.label)}</button>`
    )
    .join("");
}

/**
 * Executes escape html.
 * @param {*} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Sets set hero visibility.
 * @param {boolean} isVisible
 * @returns {void}
 */
function setHeroVisibility(isVisible) {
  const heroSection = document.querySelector(".hero");
  if (!heroSection) {
    return;
  }
  heroSection.hidden = !isVisible;
}
