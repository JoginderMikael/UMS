/**
 * @fileoverview Presentation layer for University Courses.
 * Manages complex curriculum management UI, including course definitions,
 * organizational filtering, and program mapping workflows.
 * @module admin/views/courseView
 */
const COURSE_DETAIL_FIELDS = [
  { label: "Course Title", key: "title" },
  { label: "Course Code", key: "code" },
  { label: "Credit Units", key: "creditUnits" },
  { label: "School", key: "schoolName" },
  { label: "School Code", key: "schoolCode" },
  { label: "Department", key: "departmentName" },
  { label: "Department Code", key: "departmentCode" }
];

/**
 * Binds DOM triggers that initiate the course registration/creation screen.
 * @param {Function} onCreateCourseRequest - Initialization callback.
 */
export function bindCreateCourseTriggers(onCreateCourseRequest) {
  const links = document.querySelectorAll(".js-create-course");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onCreateCourseRequest();
    });
  });
}

/**
 * Binds triggers that navigate to the course-specific profile and search interface.
 * @param {Function} onCourseDetailsRequest - Initialization callback.
 */
export function bindCourseDetailsTrigger(onCourseDetailsRequest) {
  const links = document.querySelectorAll(".js-course-details");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onCourseDetailsRequest();
    });
  });
}

/**
 * Binds triggers that load the exhaustive active course catalog.
 * @param {Function} onViewAllCoursesRequest - Initialization callback.
 */
export function bindViewAllCoursesTrigger(onViewAllCoursesRequest) {
  const links = document.querySelectorAll(".js-view-all-courses");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onViewAllCoursesRequest();
    });
  });
}

/**
 * Renders render create course form.
 * @returns {void}
 */
export function renderCreateCourseForm({
  schools = [],
  departments = [],
  selectedSchoolId = "",
  selectedDepartmentId = ""
} = {}) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <section class="panel create-user-panel">
      <h2><i class="fas fa-book"></i> Create Course</h2>
      <form class="create-user-form" id="create-course-form">
        <label for="course-school-id">
          <i class="fas fa-building"></i> School
          <select id="course-school-id" name="schoolId" class="js-course-school-select" required>
            ${renderSchoolOptions(schools, selectedSchoolId)}
          </select>
        </label>
        <label for="course-department-id">
          <i class="fas fa-sitemap"></i> Department
          <select id="course-department-id" name="departmentId" class="js-course-department-select" required>
            ${renderDepartmentOptions(departments, selectedDepartmentId)}
          </select>
        </label>
        <label for="course-title">
          <i class="fas fa-heading"></i> Course Title
          <input type="text" id="course-title" name="title" required>
        </label>
        <label for="course-code">
          <i class="fas fa-barcode"></i> Course Code
          <input type="text" id="course-code" name="code" required>
        </label>
        <label for="course-credit-units">
          <i class="fas fa-cubes"></i> Credit Units
          <input type="number" id="course-credit-units" name="creditUnits" min="0" step="1" required>
        </label>
        <button type="submit"><i class="fas fa-plus-circle"></i> Create Course</button>
        <p class="form-message" id="create-course-message" role="status" aria-live="polite"></p>
      </form>
      <div class="created-user-result" id="created-course-result" hidden></div>
    </section>`;
}

/**
 * Binds bind create course submit.
 * @param {*} onSubmit
 * @returns {void}
 */
export function bindCreateCourseSubmit(onSubmit) {
  const form = document.querySelector("#create-course-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    onSubmit({
      title: (formData.get("title") || "").toString().trim(),
      code: (formData.get("code") || "").toString().trim(),
      creditUnits: Number((formData.get("creditUnits") || "0").toString()),
      schoolId: (formData.get("schoolId") || "").toString().trim(),
      departmentId: (formData.get("departmentId") || "").toString().trim()
    });
  });
}

/**
 * Binds bind course school change.
 * @param {object} onSchoolChange
 * @returns {void}
 */
export function bindCourseSchoolChange(onSchoolChange) {
  const schoolSelect = document.querySelector(".js-course-school-select");
  if (!(schoolSelect instanceof HTMLSelectElement)) {
    return;
  }

  schoolSelect.addEventListener("change", () => onSchoolChange(schoolSelect.value));
}

/**
 * Sets set course department options.
 * @param {Array<*>} departments
 * @param {string|number} selectedDepartmentId
 * @returns {void}
 */
export function setCourseDepartmentOptions(departments, selectedDepartmentId = "") {
  const departmentSelect = document.querySelector(".js-course-department-select");
  if (!(departmentSelect instanceof HTMLSelectElement)) {
    return;
  }

  departmentSelect.innerHTML = renderDepartmentOptions(departments, selectedDepartmentId);
}

/**
 * Sets set create course message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setCreateCourseMessage(message, type = "") {
  setMessage("#create-course-message", message, type);
}

/**
 * Sets set create course submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setCreateCourseSubmitting(isSubmitting) {
  const submitButton = document.querySelector("#create-course-form button[type='submit']");
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Creating..." : "Create Course";
}

/**
 * Renders render created course details.
 * @param {object} course
 * @returns {void}
 */
export function renderCreatedCourseDetails(course) {
  const resultContainer = document.querySelector("#created-course-result");
  if (!resultContainer) {
    return;
  }

  if (!course || typeof course !== "object") {
    resultContainer.hidden = true;
    resultContainer.innerHTML = "";
    return;
  }

  const courseId = formatIdentifier(course.id);
  resultContainer.innerHTML = `
    ${renderDetailsHtml(course, "Created Course Details")}
    <div class="user-modal-actions">
      <button type="button" class="js-add-course-to-program" data-course-id="${escapeHtml(
    courseId
  )}" ${courseId ? "" : "disabled"}>Add Course To Program</button>
      <button type="button" class="ghost js-open-course-details-from-created" data-course-id="${escapeHtml(
    courseId
  )}" ${courseId ? "" : "disabled"}>Open Course Details</button>
    </div>`;
  resultContainer.hidden = false;
}

/**
 * Binds bind created course actions.
 * @param {object} params
 * @param {*} params.onAddToProgram
 * @param {*} params.onOpenDetails
 * @returns {void}
 */
export function bindCreatedCourseActions({ onAddToProgram, onOpenDetails }) {
  const addButton = document.querySelector(".js-add-course-to-program");
  const detailsButton = document.querySelector(".js-open-course-details-from-created");

  if (addButton instanceof HTMLButtonElement) {
    addButton.addEventListener("click", () => {
      const courseId = addButton.dataset.courseId || "";
      if (courseId) {
        onAddToProgram(courseId);
      }
    });
  }

  if (detailsButton instanceof HTMLButtonElement) {
    detailsButton.addEventListener("click", () => {
      const courseId = detailsButton.dataset.courseId || "";
      if (courseId) {
        onOpenDetails(courseId);
      }
    });
  }
}

/**
 * Renders render course details lookup screen.
 * @returns {void}
 */
export function renderCourseDetailsLookupScreen({
  schools = [],
  departments = [],
  programs = [],
  courses = [],
  selectedSchoolId = "",
  selectedDepartmentId = "",
  selectedProgramId = "",
  selectedYear = 1
} = {}) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = courses
    .map((course) => {
      const courseId = formatIdentifier(course.id || course.courseId);
      return `
        <tr>
          <td>${escapeHtml(formatFieldValue(course.title || course.courseTitle))}</td>
          <td>${escapeHtml(formatFieldValue(course.code || course.courseCode))}</td>
          <td>${escapeHtml(formatFieldValue(course.creditUnits))}</td>
          <td>${escapeHtml(formatFieldValue(course.courseType))}</td>
          <td>${escapeHtml(formatFieldValue(course.yearOfStudy))}</td>
          <td>
            <button type="button" class="row-action js-select-course" data-course-id="${escapeHtml(
        courseId
      )}" ${courseId ? "" : "disabled"}>Select</button>
          </td>
        </tr>`;
    })
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-book"></i> Course Details</h2>
      <div class="users-search">
        <label for="course-lookup-school">
          School
          <select id="course-lookup-school" class="js-course-lookup-school">
            ${renderSchoolOptions(schools, selectedSchoolId)}
          </select>
        </label>
        <label for="course-lookup-department">
          Department
          <select id="course-lookup-department" class="js-course-lookup-department">
            ${renderDepartmentOptionsWithAll(departments, selectedDepartmentId)}
          </select>
        </label>
        <label for="course-lookup-program">
          Program
          <select id="course-lookup-program" class="js-course-lookup-program">
            ${renderProgramOptionsWithAll(programs, selectedProgramId)}
          </select>
        </label>
        <label for="course-lookup-year">
          Year
          <select id="course-lookup-year" class="js-course-lookup-year">
            ${renderYearOptions(1, 6, selectedYear, true)}
          </select>
        </label>
        <label for="course-lookup-course">
          Course
          <select id="course-lookup-course" class="js-course-lookup-course">
            ${renderCourseOptions(courses)}
          </select>
        </label>
      </div>
      <p class="form-message" id="course-lookup-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Code</th>
              <th>Credit Units</th>
              <th>Type</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-courses-table-body">
            ${rows || '<tr><td colspan="6">No courses found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Binds bind course lookup filters.
 * @returns {void}
 */
export function bindCourseLookupFilters({
  onSchoolChange,
  onDepartmentChange,
  onProgramChange,
  onYearChange,
  onCourseChange
}) {
  const school = document.querySelector(".js-course-lookup-school");
  const department = document.querySelector(".js-course-lookup-department");
  const program = document.querySelector(".js-course-lookup-program");
  const year = document.querySelector(".js-course-lookup-year");
  const course = document.querySelector(".js-course-lookup-course");

  if (school instanceof HTMLSelectElement) {
    school.addEventListener("change", () => onSchoolChange(school.value));
  }
  if (department instanceof HTMLSelectElement) {
    department.addEventListener("change", () => onDepartmentChange(department.value));
  }
  if (program instanceof HTMLSelectElement) {
    program.addEventListener("change", () => onProgramChange(program.value));
  }
  if (year instanceof HTMLSelectElement) {
    year.addEventListener("change", () => onYearChange(Number(year.value || "0")));
  }
  if (course instanceof HTMLSelectElement) {
    course.addEventListener("change", () => onCourseChange(course.value));
  }
}

/**
 * Binds bind course select.
 * @param {*} onSelect
 * @returns {void}
 */
export function bindCourseSelect(onSelect) {
  const tableBody = document.querySelector(".js-courses-table-body");
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".js-select-course");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const courseId = button.dataset.courseId || "";
    if (courseId) {
      onSelect(courseId);
    }
  });
}

/**
 * Sets set course lookup message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setCourseLookupMessage(message, type = "") {
  setMessage("#course-lookup-message", message, type);
}

/**
 * Renders render all courses screen.
 * @param {Array<*>} courses
 * @param {string} searchQuery
 * @returns {void}
 */
export function renderAllCoursesScreen(courses = [], searchQuery = "") {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const rows = courses
    .map((course) => {
      const courseId = formatIdentifier(course.id || course.courseId);
      return `
        <tr>
          <td>${escapeHtml(formatFieldValue(course.title || course.courseTitle))}</td>
          <td>${escapeHtml(formatFieldValue(course.code || course.courseCode))}</td>
          <td>${escapeHtml(formatFieldValue(course.creditUnits))}</td>
          <td>${escapeHtml(formatFieldValue(course.schoolName || course.SchoolName || course.schoolCode))}</td>
          <td>${escapeHtml(
        formatFieldValue(course.departmentName || course.DepartmentName || course.departmentCode)
      )}</td>
          <td>
            <button type="button" class="row-action js-select-course" data-course-id="${escapeHtml(
        courseId
      )}" ${courseId ? "" : "disabled"}>Select</button>
          </td>
        </tr>`;
    })
    .join("");

  content.innerHTML = `
    <section class="panel users-panel">
      <h2><i class="fas fa-list"></i> All Courses</h2>
      <div class="users-search">
        <input type="text" class="js-all-courses-search-input" placeholder="Search by title or code" value="${escapeHtml(
    searchQuery
  )}">
        <button type="button" class="js-all-courses-search-btn">Search</button>
      </div>
      <p class="form-message" id="all-courses-message" role="status" aria-live="polite"></p>
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Code</th>
              <th>Credit Units</th>
              <th>School</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody class="js-courses-table-body">
            ${rows || '<tr><td colspan="6">No courses found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
}

/**
 * Binds bind all courses search.
 * @param {*} onSearch
 * @returns {void}
 */
export function bindAllCoursesSearch(onSearch) {
  const input = document.querySelector(".js-all-courses-search-input");
  const button = document.querySelector(".js-all-courses-search-btn");
  if (!(input instanceof HTMLInputElement) || !(button instanceof HTMLButtonElement)) {
    return;
  }

  const submit = () => onSearch(input.value.trim());
  button.addEventListener("click", submit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  });
}

/**
 * Sets set all courses message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setAllCoursesMessage(message, type = "") {
  setMessage("#all-courses-message", message, type);
}

/**
 * Renders render course details screen.
 * @param {object} course
 * @returns {void}
 */
export function renderCourseDetailsScreen(course) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const courseId = formatIdentifier(course.id || course.courseId);
  content.innerHTML = `
    <section class="panel users-panel js-course-details-panel" data-course-id="${escapeHtml(courseId)}">
      ${renderDetailsHtml(course, "Course Details")}
      <p class="form-message" id="course-details-message" role="status" aria-live="polite"></p>
      <div class="user-modal-actions">
        <button type="button" class="js-course-update-btn">Update Details</button>
        <button type="button" class="js-course-add-to-program-btn">Add Course To Program</button>
        <button type="button" class="danger js-course-delete-btn">Delete Course</button>
        <button type="button" class="ghost js-course-close-btn">Close</button>
      </div>
    </section>`;
}

/**
 * Binds bind course details actions.
 * @param {object} params
 * @param {*} params.onUpdate
 * @param {*} params.onAddToProgram
 * @param {*} params.onDelete
 * @param {*} params.onClose
 * @returns {void}
 */
export function bindCourseDetailsActions({ onUpdate, onAddToProgram, onDelete, onClose }) {
  const panel = document.querySelector(".js-course-details-panel");
  if (!panel) {
    return;
  }

  const invoke = (callback) => {
    const courseId = panel.getAttribute("data-course-id") || "";
    if (courseId && callback) {
      callback(courseId);
    }
  };

  const update = panel.querySelector(".js-course-update-btn");
  const add = panel.querySelector(".js-course-add-to-program-btn");
  const del = panel.querySelector(".js-course-delete-btn");
  const close = panel.querySelector(".js-course-close-btn");

  if (update instanceof HTMLButtonElement) {
    update.addEventListener("click", () => invoke(onUpdate));
  }
  if (add instanceof HTMLButtonElement) {
    add.addEventListener("click", () => invoke(onAddToProgram));
  }
  if (del instanceof HTMLButtonElement) {
    del.addEventListener("click", () => invoke(onDelete));
  }
  if (close instanceof HTMLButtonElement) {
    close.addEventListener("click", () => onClose());
  }
}

/**
 * Sets set course details message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setCourseDetailsMessage(message, type = "") {
  setMessage("#course-details-message", message, type);
}

/**
 * Renders render course update form.
 * @param {object} course
 * @returns {void}
 */
export function renderCourseUpdateForm(course) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const courseId = formatIdentifier(course.id || course.courseId);
  content.innerHTML = `
    <section class="panel users-panel js-course-update-panel" data-course-id="${escapeHtml(courseId)}">
      <h2>Update Course Details</h2>
      <p><strong>Course:</strong> ${escapeHtml(formatFieldValue(course.title))} (${escapeHtml(
    formatFieldValue(course.code)
  )})</p>
      <form class="create-user-form" id="update-course-form">
        <label for="update-course-title">
          Course Title
          <input type="text" id="update-course-title" name="title" value="${escapeHtml(
    formatInputValue(course.title)
  )}" required>
        </label>
        <label for="update-course-credit-units">
          Credit Units
          <input type="number" id="update-course-credit-units" name="creditUnits" min="0" step="1" value="${escapeHtml(
    formatInputValue(course.creditUnits)
  )}" required>
        </label>
        <div class="user-modal-actions">
          <button type="submit">Save Changes</button>
          <button type="button" class="ghost js-close-course-update">Close</button>
        </div>
        <p class="form-message" id="update-course-message" role="status" aria-live="polite"></p>
      </form>
    </section>`;
}

/**
 * Binds bind course update form.
 * @param {*} onSubmit
 * @param {*} onClose
 * @returns {void}
 */
export function bindCourseUpdateForm(onSubmit, onClose) {
  const panel = document.querySelector(".js-course-update-panel");
  const form = document.querySelector("#update-course-form");
  const close = document.querySelector(".js-close-course-update");

  if (panel && form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      onSubmit({
        courseId: panel.getAttribute("data-course-id") || "",
        title: (formData.get("title") || "").toString().trim(),
        creditUnits: Number((formData.get("creditUnits") || "0").toString())
      });
    });
  }

  if (close instanceof HTMLButtonElement) {
    close.addEventListener("click", () => onClose());
  }
}

/**
 * Sets set update course message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setUpdateCourseMessage(message, type = "") {
  setMessage("#update-course-message", message, type);
}

/**
 * Sets set update course submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setUpdateCourseSubmitting(isSubmitting) {
  const submit = document.querySelector("#update-course-form button[type='submit']");
  if (!(submit instanceof HTMLButtonElement)) {
    return;
  }

  submit.disabled = isSubmitting;
  submit.textContent = isSubmitting ? "Saving..." : "Save Changes";
}

/**
 * Renders render course program form.
 * @returns {void}
 */
export function renderCourseProgramForm({
  course = {},
  schools = [],
  departments = [],
  programs = [],
  selectedSchoolId = "",
  selectedDepartmentId = "",
  selectedProgramId = ""
} = {}) {
  setHeroVisibility(false);
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  const courseId = formatIdentifier(course.id || course.courseId);
  content.innerHTML = `
    <section class="panel users-panel js-course-program-panel" data-course-id="${escapeHtml(courseId)}">
      <h2>Add Course To Program</h2>
      <p><strong>Course:</strong> ${escapeHtml(formatFieldValue(course.title))} (${escapeHtml(
    formatFieldValue(course.code)
  )})</p>
      <form class="create-user-form" id="course-program-form">
        <label for="course-program-school-id">
          School
          <select id="course-program-school-id" name="schoolId" class="js-course-program-school" required>
            ${renderSchoolOptions(schools, selectedSchoolId)}
          </select>
        </label>
        <label for="course-program-department-id">
          Department
          <select id="course-program-department-id" name="departmentId" class="js-course-program-department">
            ${renderDepartmentOptionsWithAll(departments, selectedDepartmentId)}
          </select>
        </label>
        <label for="course-program-id">
          Program
          <select id="course-program-id" name="programId" class="js-course-program-select" required>
            ${renderProgramOptions(programs, selectedProgramId)}
          </select>
        </label>
        <label for="course-program-type">
          Course Type
          <select id="course-program-type" name="courseType" required>
            <option value="ELECTIVE">ELECTIVE</option>
            <option value="CORE">CORE</option>
          </select>
        </label>
        <label for="course-program-year">
          Year Of Study
          <select id="course-program-year" name="yearOfStudy" required>
            ${renderYearOptions(1, 6, 1)}
          </select>
        </label>
        <div class="user-modal-actions">
          <button type="submit">Add Course</button>
          <button type="button" class="ghost js-close-course-program">Close</button>
        </div>
        <p class="form-message" id="course-program-message" role="status" aria-live="polite"></p>
      </form>
    </section>`;
}

/**
 * Binds bind course program school change.
 * @param {object} onSchoolChange
 * @returns {void}
 */
export function bindCourseProgramSchoolChange(onSchoolChange) {
  const school = document.querySelector(".js-course-program-school");
  if (!(school instanceof HTMLSelectElement)) {
    return;
  }

  school.addEventListener("change", () => onSchoolChange(school.value));
}

/**
 * Binds bind course program department change.
 * @param {object} onDepartmentChange
 * @returns {void}
 */
export function bindCourseProgramDepartmentChange(onDepartmentChange) {
  const department = document.querySelector(".js-course-program-department");
  if (!(department instanceof HTMLSelectElement)) {
    return;
  }

  department.addEventListener("change", () => onDepartmentChange(department.value));
}

/**
 * Binds bind course program form.
 * @param {*} onSubmit
 * @param {*} onClose
 * @returns {void}
 */
export function bindCourseProgramForm(onSubmit, onClose) {
  const panel = document.querySelector(".js-course-program-panel");
  const form = document.querySelector("#course-program-form");
  const close = document.querySelector(".js-close-course-program");

  if (panel && form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      onSubmit({
        courseId: panel.getAttribute("data-course-id") || "",
        schoolId: (formData.get("schoolId") || "").toString().trim(),
        departmentId: (formData.get("departmentId") || "").toString().trim(),
        programId: (formData.get("programId") || "").toString().trim(),
        courseType: (formData.get("courseType") || "").toString().trim(),
        yearOfStudy: Number((formData.get("yearOfStudy") || "1").toString())
      });
    });
  }

  if (close instanceof HTMLButtonElement) {
    close.addEventListener("click", () => onClose());
  }
}

/**
 * Sets set course program department options.
 * @param {Array<*>} departments
 * @param {string|number} selectedDepartmentId
 * @returns {void}
 */
export function setCourseProgramDepartmentOptions(departments, selectedDepartmentId = "") {
  const select = document.querySelector(".js-course-program-department");
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  select.innerHTML = renderDepartmentOptionsWithAll(departments, selectedDepartmentId);
}

/**
 * Sets set course program options.
 * @param {Array<*>} programs
 * @param {string|number} selectedProgramId
 * @returns {void}
 */
export function setCourseProgramOptions(programs, selectedProgramId = "") {
  const select = document.querySelector(".js-course-program-select");
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  select.innerHTML = renderProgramOptions(programs, selectedProgramId);
}

/**
 * Sets set course program message.
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
export function setCourseProgramMessage(message, type = "") {
  setMessage("#course-program-message", message, type);
}

/**
 * Sets set course program submitting.
 * @param {boolean} isSubmitting
 * @returns {void}
 */
export function setCourseProgramSubmitting(isSubmitting) {
  const submit = document.querySelector("#course-program-form button[type='submit']");
  if (!(submit instanceof HTMLButtonElement)) {
    return;
  }

  submit.disabled = isSubmitting;
  submit.textContent = isSubmitting ? "Adding..." : "Add Course";
}

/**
 * Renders render school options.
 * @param {Array<*>} schools
 * @param {string|number} selectedSchoolId
 * @returns {void}
 */
function renderSchoolOptions(schools, selectedSchoolId = "") {
  if (!Array.isArray(schools) || schools.length === 0) {
    return `<option value="">No schools available</option>`;
  }

  const options = schools
    .map((school) => {
      const id = formatIdentifier(school.id || school.schoolId);
      const name = formatFieldValue(school.name || school.schoolName);
      const code = formatFieldValue(school.code || school.schoolCode);
      const selected = id && String(id) === String(selectedSchoolId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">Select School</option>${options}`;
}

/**
 * Renders render department options.
 * @param {Array<*>} departments
 * @param {string|number} selectedDepartmentId
 * @returns {void}
 */
function renderDepartmentOptions(departments, selectedDepartmentId = "") {
  if (!Array.isArray(departments) || departments.length === 0) {
    return `<option value="">No departments available</option>`;
  }

  const options = departments
    .map((department) => {
      const id = formatIdentifier(department.id || department.departmentId);
      const name = formatFieldValue(department.name || department.departmentName);
      const code = formatFieldValue(department.code || department.departmentCode);
      const selected = id && String(id) === String(selectedDepartmentId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">Select Department</option>${options}`;
}

/**
 * Renders render department options with all.
 * @param {Array<*>} departments
 * @param {string|number} selectedDepartmentId
 * @returns {void}
 */
function renderDepartmentOptionsWithAll(departments, selectedDepartmentId = "") {
  if (!Array.isArray(departments) || departments.length === 0) {
    return `<option value="">All Departments</option>`;
  }

  const options = departments
    .map((department) => {
      const id = formatIdentifier(department.id || department.departmentId);
      const name = formatFieldValue(department.name || department.departmentName);
      const code = formatFieldValue(department.code || department.departmentCode);
      const selected = id && String(id) === String(selectedDepartmentId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">All Departments</option>${options}`;
}

/**
 * Renders render program options.
 * @param {Array<*>} programs
 * @param {string|number} selectedProgramId
 * @returns {void}
 */
function renderProgramOptions(programs, selectedProgramId = "") {
  if (!Array.isArray(programs) || programs.length === 0) {
    return `<option value="">No programs found</option>`;
  }

  const options = programs
    .map((program) => {
      const id = formatIdentifier(program.id || program.programId);
      const name = formatFieldValue(program.name || program.programName);
      const code = formatFieldValue(program.code || program.programCode);
      const selected = id && String(id) === String(selectedProgramId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">Select Program</option>${options}`;
}

/**
 * Renders render program options with all.
 * @param {Array<*>} programs
 * @param {string|number} selectedProgramId
 * @returns {void}
 */
function renderProgramOptionsWithAll(programs, selectedProgramId = "") {
  if (!Array.isArray(programs) || programs.length === 0) {
    return `<option value="">All Programs</option>`;
  }

  const options = programs
    .map((program) => {
      const id = formatIdentifier(program.id || program.programId);
      const name = formatFieldValue(program.name || program.programName);
      const code = formatFieldValue(program.code || program.programCode);
      const selected = id && String(id) === String(selectedProgramId) ? "selected" : "";
      return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(`${name} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">All Programs</option>${options}`;
}

/**
 * Renders render course options.
 * @param {Array<*>} courses
 * @returns {void}
 */
function renderCourseOptions(courses) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return `<option value="">No courses found</option>`;
  }

  const options = courses
    .map((course) => {
      const id = formatIdentifier(course.id || course.courseId);
      const title = formatFieldValue(course.title || course.courseTitle);
      const code = formatFieldValue(course.code || course.courseCode);
      return `<option value="${escapeHtml(id)}">${escapeHtml(`${title} (${code})`)}</option>`;
    })
    .join("");

  return `<option value="">Select Course</option>${options}`;
}

/**
 * Renders render year options.
 * @param {*} startYear
 * @param {*} endYear
 * @param {*} selectedYear
 * @param {*} withAll
 * @returns {void}
 */
function renderYearOptions(startYear, endYear, selectedYear, withAll = false) {
  const options = [];
  if (withAll) {
    options.push(`<option value="0" ${Number(selectedYear) === 0 ? "selected" : ""}>All Years</option>`);
  }

  for (let year = startYear; year <= endYear; year += 1) {
    options.push(
      `<option value="${year}" ${Number(selectedYear) === year ? "selected" : ""}>Year ${year}</option>`
    );
  }
  return options.join("");
}

/**
 * Renders render details html.
 * @param {object} course
 * @param {*} title
 * @returns {void}
 */
function renderDetailsHtml(course, title) {
  return `
    <h3>${escapeHtml(title)}</h3>
    <dl class="created-user-grid">
      ${COURSE_DETAIL_FIELDS.map(
    ({ label, key }) =>
      `<div class="created-user-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(formatFieldValue(course[key]))}</dd></div>`
  ).join("")}
    </dl>`;
}

/**
 * Sets set message.
 * @param {*} selector
 * @param {string} message
 * @param {*} type
 * @returns {void}
 */
function setMessage(selector, message, type = "") {
  const messageElement = document.querySelector(selector);
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
 * Formats format field value.
 * @param {*} value
 * @returns {string}
 */
function formatFieldValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
}

/**
 * Formats format identifier.
 * @param {*} value
 * @returns {string}
 */
function formatIdentifier(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

/**
 * Formats format input value.
 * @param {*} value
 * @returns {string}
 */
function formatInputValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
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
