// ======================================
// TASKFLOW MINI
// Task Management Application
// ======================================


// 1. SELECT HTML ELEMENTS

const taskInput = document.getElementById("task-input");
const taskDescription = document.getElementById("task-description");
const addButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const filters = document.querySelectorAll(".filter");
const dateElement = document.getElementById("current-date");

const taskDate = document.getElementById("task-date");
const taskTime = document.getElementById("task-time");

const taskCategory = document.getElementById("task-category");
const taskPriority = document.getElementById("task-priority");

const taskSearch = document.getElementById("task-search");
const taskSort = document.getElementById("task-sort");

const categoryFilter = document.getElementById("category-filter");
const priorityFilter = document.getElementById("priority-filter");
const dueFilter = document.getElementById("due-filter");


// DASHBOARD ELEMENTS

const totalTasksElement = document.getElementById("total-tasks");
const completedTasksElement = document.getElementById("completed-tasks");
const pendingTasksElement = document.getElementById("pending-tasks");
const overdueTasksElement = document.getElementById("overdue-tasks");

const progressPercentage = document.getElementById("progress-percentage");
const progressFraction = document.getElementById("progress-fraction");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const progressMessage = document.getElementById("progress-message");

const productivitySummary = document.getElementById("productivity-summary");

const categoryBreakdown = document.getElementById("category-breakdown");
const categoryBreakdownEmpty = document.getElementById("category-breakdown-empty");


// EDIT MODAL ELEMENTS

const editModal = document.getElementById("edit-modal");
const editTaskForm = document.getElementById("edit-task-form");
const editTaskInput = document.getElementById("edit-task-input");
const editTaskDescription = document.getElementById("edit-task-description");
const editTaskDate = document.getElementById("edit-task-date");
const editTaskTime = document.getElementById("edit-task-time");
const editTaskCategory = document.getElementById("edit-task-category");
const editTaskPriority = document.getElementById("edit-task-priority");

const closeModalButton = document.getElementById("close-modal");
const cancelModalButton = document.getElementById("cancel-modal");

let editingTaskId = null;


// PERSONALIZED WELCOME ELEMENTS

const welcomeModal = document.getElementById("welcome-modal");
const welcomeForm = document.getElementById("welcome-form");
const userNameInput = document.getElementById("user-name");

const personalGreeting = document.getElementById("personal-greeting");
const welcomeDescription = document.getElementById("welcome-description");


// SETTINGS ELEMENTS

const openSettingsButton = document.getElementById("open-settings");
const settingsModal = document.getElementById("settings-modal");
const settingsForm = document.getElementById("settings-form");
const settingsNameInput = document.getElementById("settings-name");

const closeSettingsButton = document.getElementById("close-settings");
const cancelSettingsButton = document.getElementById("cancel-settings");


// 2. DISPLAY TODAY'S DATE

const today = new Date();

dateElement.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
});


// 3. LOAD SAVED TASKS

let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [];

    if (!Array.isArray(tasks)) {
        tasks = [];
    }
} catch (error) {
    console.error("Could not load saved tasks:", error);
    tasks = [];
}

let currentFilter = "all";
let currentSearch = "";
let currentSort = "newest";

let currentCategory = "all";
let currentPriority = "all";
let currentDueFilter = "all";

const reminderTimers = new Map();


// MIGRATE OLDER TASKS WITHOUT LOSING SAVED DATA

tasks.forEach(task => {
    if (!task.category) task.category = "Personal";
    if (!task.priority) task.priority = "Medium";
    if (!task.description) task.description = "";

    if (task.reminderNotified === undefined) {
        task.reminderNotified = false;
    }
});


// 4. SAVE TASKS

function saveTasks() {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

saveTasks();


// 5. DATE HELPERS

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isOverdue(task) {
    return Boolean(
        task.dueDate &&
        task.dueDate < getLocalDateString() &&
        !task.completed
    );
}

function isDueToday(task) {
    return Boolean(
        task.dueDate &&
        task.dueDate === getLocalDateString() &&
        !task.completed
    );
}

function isUpcoming(task) {
    return Boolean(
        task.dueDate &&
        task.dueDate > getLocalDateString() &&
        !task.completed
    );
}

function formatDueDate(date) {
    if (!date) return "";

    const parsedDate = new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: parsedDate.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined
    });
}


// 6. PERSONALIZED GREETING

function displayPersonalGreeting(name, returning = false) {
    const cleanName = name.trim();

    personalGreeting.textContent = returning
        ? `WELCOME BACK, ${cleanName.toUpperCase()}.`
        : `HI, ${cleanName.toUpperCase()}.`;

    welcomeDescription.textContent = returning
        ? "Good to have you back. Let's make today count."
        : "Welcome to your personal workspace. Let's make progress, one task at a time.";
}

function initializeWelcome() {
    const savedName = localStorage.getItem("taskflow-user-name");

    if (savedName) {
        displayPersonalGreeting(savedName, true);
    } else {
        welcomeModal.classList.add("active");
        welcomeModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        userNameInput.focus();
    }
}

welcomeForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = userNameInput.value.trim();

    if (!name) {
        userNameInput.focus();
        return;
    }

    localStorage.setItem("taskflow-user-name", name);
    displayPersonalGreeting(name, false);

    welcomeModal.classList.remove("active");
    welcomeModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
});


// 7. SETTINGS

function openSettings() {
    settingsNameInput.value =
        localStorage.getItem("taskflow-user-name") || "";

    settingsModal.classList.add("active");
    settingsModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
    settingsNameInput.focus();
}

function closeSettings() {
    settingsModal.classList.remove("active");
    settingsModal.setAttribute("aria-hidden", "true");

    const anotherModalOpen =
        editModal.classList.contains("active") ||
        welcomeModal.classList.contains("active");

    if (!anotherModalOpen) {
        document.body.style.overflow = "";
    }
}

openSettingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
cancelSettingsButton.addEventListener("click", closeSettings);

settingsModal.addEventListener("click", event => {
    if (event.target === settingsModal) {
        closeSettings();
    }
});

settingsForm.addEventListener("submit", event => {
    event.preventDefault();

    const updatedName = settingsNameInput.value.trim();

    if (!updatedName) {
        settingsNameInput.focus();
        return;
    }

    localStorage.setItem("taskflow-user-name", updatedName);
    displayPersonalGreeting(updatedName, true);

    closeSettings();
});


// 8. TASK COUNTER

function updateTaskCount() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;

    taskCount.textContent = `${completed}/${total} completed`;
}


// 9. CATEGORY BREAKDOWN

function updateCategoryBreakdown() {
    const categories = [
        "Personal",
        "Work",
        "School",
        "Shopping",
        "Other"
    ];

    categoryBreakdown.innerHTML = "";

    if (tasks.length === 0) {
        categoryBreakdownEmpty.hidden = false;
        return;
    }

    categoryBreakdownEmpty.hidden = true;

    categories.forEach(category => {
        const count = tasks.filter(
            task => (task.category || "Personal") === category
        ).length;

        if (count === 0) return;

        const percentage = Math.round((count / tasks.length) * 100);

        const item = document.createElement("div");
        item.className = "category-breakdown-item";

        const info = document.createElement("div");
        info.className = "category-breakdown-info";

        const name = document.createElement("span");
        name.textContent = category;

        const value = document.createElement("strong");
        value.textContent = `${count} ${count === 1 ? "task" : "tasks"}`;

        info.append(name, value);

        const track = document.createElement("div");
        track.className = "category-breakdown-track";

        const fill = document.createElement("div");
        fill.className = "category-breakdown-fill";
        fill.style.width = `${percentage}%`;

        track.appendChild(fill);
        item.append(info, track);

        categoryBreakdown.appendChild(item);
    });
}


// 10. PRODUCTIVITY DASHBOARD

function updateDashboard() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(isOverdue).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalTasksElement.textContent = total;
    completedTasksElement.textContent = completed;
    pendingTasksElement.textContent = pending;
    overdueTasksElement.textContent = overdue;

    progressPercentage.textContent = `${percentage}%`;

    progressFraction.textContent =
        `${completed} of ${total} tasks completed`;

    progressFill.style.width = `${percentage}%`;

    progressBar.setAttribute("aria-valuenow", percentage);

    if (total === 0) {
        progressMessage.textContent =
            "Add your first task to start tracking your progress.";
    } else if (percentage === 100) {
        progressMessage.textContent =
            "Amazing! You've completed every task on your list.";
    } else if (percentage >= 70) {
        progressMessage.textContent =
            "You're almost there. Keep up the great work!";
    } else if (percentage >= 40) {
        progressMessage.textContent =
            "You're making good progress. Keep moving forward.";
    } else if (percentage > 0) {
        progressMessage.textContent =
            "Every completed task is a step forward. Keep going.";
    } else {
        progressMessage.textContent =
            "Your tasks are waiting. Let's get started.";
    }

    if (total === 0) {
        productivitySummary.textContent =
            "Every small step counts. Start by adding a task.";
    } else if (pending === 0) {
        productivitySummary.textContent =
            `You've completed all ${total} tasks. Excellent work!`;
    } else {
        productivitySummary.textContent =
            `You've completed ${completed} out of ${total} tasks. You have ${pending} ${pending === 1 ? "task" : "tasks"} left to tackle.`;
    }

    if (overdue > 0) {
        productivitySummary.textContent +=
            ` You also have ${overdue} overdue ${overdue === 1 ? "task" : "tasks"} to review.`;
    }

    updateCategoryBreakdown();
}


// 11. FORMAT REMINDER

function formatReminder(date, time) {
    if (!date || !time) return "";

    const reminderDate = new Date(`${date}T${time}`);

    return reminderDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}


// 12. OPEN EDIT MODAL

function openEditModal(task) {
    editingTaskId = task.id;

    editTaskInput.value = task.text;
    editTaskDescription.value = task.description || "";

    editTaskDate.value = task.dueDate || "";
    editTaskTime.value = task.reminderTime || "";

    editTaskCategory.value = task.category || "Personal";
    editTaskPriority.value = task.priority || "Medium";

    editModal.classList.add("active");
    editModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
    editTaskInput.focus();
}


// 13. CLOSE EDIT MODAL

function closeEditModal() {
    editModal.classList.remove("active");
    editModal.setAttribute("aria-hidden", "true");

    const anotherModalOpen =
        settingsModal.classList.contains("active") ||
        welcomeModal.classList.contains("active");

    if (!anotherModalOpen) {
        document.body.style.overflow = "";
    }

    editingTaskId = null;
    editTaskForm.reset();
}


// 14. SAVE EDITED TASK

editTaskForm.addEventListener("submit", async event => {
    event.preventDefault();

    const task = tasks.find(item => item.id === editingTaskId);

    if (!task) return;

    const updatedText = editTaskInput.value.trim();
    const updatedDescription = editTaskDescription.value.trim();

    const updatedDate = editTaskDate.value;
    const updatedTime = editTaskTime.value;

    const updatedCategory = editTaskCategory.value;
    const updatedPriority = editTaskPriority.value;

    if (!updatedText) {
        alert("Task name cannot be empty.");
        editTaskInput.focus();
        return;
    }

    if (updatedTime && !updatedDate) {
        alert("Please select a due date before setting a reminder time.");
        return;
    }

    let savedReminderTime = updatedTime || null;

    if (updatedDate && updatedTime) {
        const reminderDate = new Date(`${updatedDate}T${updatedTime}`);

        if (Number.isNaN(reminderDate.getTime())) {
            alert("Please enter a valid reminder date and time.");
            return;
        }

        // Past due dates are allowed.
        // A reminder, however, must be in the future.
        if (reminderDate.getTime() <= Date.now()) {
            const continueWithoutReminder = confirm(
                "This due date is in the past. The task will still be saved as overdue, but its reminder time will be removed. Continue?"
            );

            if (!continueWithoutReminder) return;

            savedReminderTime = null;
        }
    }

    task.text = updatedText;
    task.description = updatedDescription;

    task.dueDate = updatedDate || null;
    task.reminderTime = savedReminderTime;

    task.category = updatedCategory;
    task.priority = updatedPriority;

    task.reminderNotified = false;

    clearReminderTimer(task.id);

    saveTasks();
    closeEditModal();
    renderTasks();

    if (task.dueDate && task.reminderTime && !task.completed) {
        const permissionGranted = await enableNotifications();

        if (permissionGranted) {
            scheduleReminder(task);
        }
    }
});

closeModalButton.addEventListener("click", closeEditModal);
cancelModalButton.addEventListener("click", closeEditModal);

editModal.addEventListener("click", event => {
    if (event.target === editModal) {
        closeEditModal();
    }
});


// 15. CLOSE MODALS WITH ESCAPE

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (settingsModal.classList.contains("active")) {
        closeSettings();
    } else if (editModal.classList.contains("active")) {
        closeEditModal();
    }
});


// 16. ADVANCED FILTERS

categoryFilter.addEventListener("change", () => {
    currentCategory = categoryFilter.value;
    renderTasks();
});

priorityFilter.addEventListener("change", () => {
    currentPriority = priorityFilter.value;
    renderTasks();
});

dueFilter.addEventListener("change", () => {
    currentDueFilter = dueFilter.value;
    renderTasks();
});


// 17. SEARCH AND SORT

function getVisibleTasks() {
    let visibleTasks = tasks.filter(task => {
        if (currentFilter === "active" && task.completed) {
            return false;
        }

        if (currentFilter === "completed" && !task.completed) {
            return false;
        }

        return true;
    });


    // SEARCH TASK NAME AND DESCRIPTION

    if (currentSearch) {
        visibleTasks = visibleTasks.filter(task => {
            const searchableText =
                `${task.text} ${task.description || ""}`.toLowerCase();

            return searchableText.includes(currentSearch);
        });
    }


    // CATEGORY FILTER

    if (currentCategory !== "all") {
        visibleTasks = visibleTasks.filter(task => {
            return (task.category || "Personal") === currentCategory;
        });
    }


    // PRIORITY FILTER

    if (currentPriority !== "all") {
        visibleTasks = visibleTasks.filter(task => {
            return (task.priority || "Medium") === currentPriority;
        });
    }


    // DUE DATE FILTER

    if (currentDueFilter === "overdue") {
        visibleTasks = visibleTasks.filter(isOverdue);
    }

    if (currentDueFilter === "today") {
        visibleTasks = visibleTasks.filter(isDueToday);
    }

    if (currentDueFilter === "upcoming") {
        visibleTasks = visibleTasks.filter(isUpcoming);
    }

    if (currentDueFilter === "no-date") {
        visibleTasks = visibleTasks.filter(task => !task.dueDate);
    }


    // SORTING

    visibleTasks.sort((a, b) => {
        switch (currentSort) {
            case "newest":
                return Number(b.id) - Number(a.id);

            case "oldest":
                return Number(a.id) - Number(b.id);

            case "due-date":
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;

                return a.dueDate.localeCompare(b.dueDate);

            case "alphabetical":
                return a.text.localeCompare(b.text, undefined, {
                    sensitivity: "base"
                });

            default:
                return Number(b.id) - Number(a.id);
        }
    });

    return visibleTasks;
}


// LIVE SEARCH

taskSearch.addEventListener("input", () => {
    currentSearch = taskSearch.value.trim().toLowerCase();
    renderTasks();
});


// SORT TASKS

taskSort.addEventListener("change", () => {
    currentSort = taskSort.value;
    renderTasks();
});


// 18. CREATE TASK CARD

function createTaskCard(task) {
    const taskItem = document.createElement("div");

    taskItem.className = "task-item";

    if (isOverdue(task)) {
        taskItem.classList.add("overdue");
    }


    // COMPLETE BUTTON

    const completeButton = document.createElement("button");

    completeButton.className = "complete-button";
    completeButton.textContent = task.completed ? "✓" : "○";

    completeButton.setAttribute(
        "aria-label",
        task.completed ? "Mark task as incomplete" : "Complete task"
    );

    completeButton.addEventListener("click", () => {
        task.completed = !task.completed;

        if (task.completed) {
            clearReminderTimer(task.id);
        } else {
            task.reminderNotified = false;

            if (
                task.dueDate &&
                task.reminderTime &&
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                scheduleReminder(task);
            }
        }

        saveTasks();
        renderTasks();
    });


    // TASK DETAILS

    const taskDetails = document.createElement("div");
    taskDetails.className = "task-details";


    // TASK NAME

    const taskText = document.createElement("span");
    taskText.textContent = task.text;

    if (task.completed) {
        taskText.className = "completed-text";
    }

    taskDetails.appendChild(taskText);


    // DESCRIPTION

    if (task.description) {
        const description = document.createElement("p");

        description.className = "task-description";
        description.textContent = task.description;

        taskDetails.appendChild(description);
    }


    // CATEGORY AND PRIORITY BADGES

    const taskMeta = document.createElement("div");
    taskMeta.className = "task-meta";

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "task-category-badge";
    categoryBadge.textContent = task.category || "Personal";

    const priority = task.priority || "Medium";

    const priorityBadge = document.createElement("span");

    priorityBadge.className =
        `task-priority-badge priority-${priority.toLowerCase()}`;

    priorityBadge.textContent = `${priority} priority`;

    taskMeta.append(categoryBadge, priorityBadge);
    taskDetails.appendChild(taskMeta);


    // DUE DATE DISPLAY

    if (task.dueDate) {
        const dueDateLabel = document.createElement("small");

        dueDateLabel.className = "task-due-date";

        if (isOverdue(task)) {
            dueDateLabel.classList.add("overdue");
            dueDateLabel.textContent =
                `⚠ Overdue · ${formatDueDate(task.dueDate)}`;
        } else if (isDueToday(task)) {
            dueDateLabel.classList.add("due-today");
            dueDateLabel.textContent =
                `◷ Due today · ${formatDueDate(task.dueDate)}`;
        } else {
            dueDateLabel.textContent =
                `◷ Due ${formatDueDate(task.dueDate)}`;
        }

        taskDetails.appendChild(dueDateLabel);
    }


    // REMINDER INDICATOR

    if (task.dueDate && task.reminderTime) {
        const reminderLabel = document.createElement("small");

        reminderLabel.className = "task-reminder";

        const clockIcon = document.createElement("span");
        clockIcon.className = "reminder-clock";
        clockIcon.setAttribute("aria-hidden", "true");
        clockIcon.textContent = "◷";

        reminderLabel.append(
            clockIcon,
            document.createTextNode(
                `Reminder: ${formatReminder(task.dueDate, task.reminderTime)}`
            )
        );

        taskDetails.appendChild(reminderLabel);
    }


    // OVERDUE LABEL

    if (isOverdue(task)) {
        const overdueLabel = document.createElement("span");

        overdueLabel.className = "overdue-label";
        overdueLabel.textContent = "Overdue";

        taskDetails.appendChild(overdueLabel);
    }


    // EDIT BUTTON

    const editButton = document.createElement("button");

    editButton.className = "edit-button";
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", "Edit task");

    editButton.addEventListener("click", () => {
        openEditModal(task);
    });


    // DELETE BUTTON

    const deleteButton = document.createElement("button");

    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");

    deleteButton.addEventListener("click", () => {
        const confirmed = confirm(`Delete "${task.text}"?`);

        if (!confirmed) return;

        clearReminderTimer(task.id);

        tasks = tasks.filter(item => item.id !== task.id);

        saveTasks();
        renderTasks();
    });


    taskItem.append(
        completeButton,
        taskDetails,
        editButton,
        deleteButton
    );

    return taskItem;
}


// 19. DISPLAY TASKS

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = getVisibleTasks();

    updateTaskCount();
    updateDashboard();

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";

        if (tasks.length === 0) {
            emptyMessage.textContent =
                "Your list is clear. Add a task to get started.";
        } else if (currentSearch) {
            emptyMessage.textContent =
                `No tasks found matching "${taskSearch.value}".`;
        } else {
            emptyMessage.textContent =
                "No tasks match your selected filters.";
        }

        taskList.appendChild(emptyMessage);
        return;
    }

    filteredTasks.forEach(task => {
        taskList.appendChild(createTaskCard(task));
    });
}


// 20. REMINDER TIMERS

function clearReminderTimer(taskId) {
    if (reminderTimers.has(taskId)) {
        clearTimeout(reminderTimers.get(taskId));
        reminderTimers.delete(taskId);
    }
}


// 21. SEND BROWSER NOTIFICATION

function sendReminderNotification(task) {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (task.completed || task.reminderNotified) return;

    new Notification("TaskFlow Reminder", {
        body: `It's time to: ${task.text}`
    });

    task.reminderNotified = true;
    saveTasks();
}


// 22. SCHEDULE REMINDERS

function scheduleReminder(task) {
    clearReminderTimer(task.id);

    if (!task.dueDate || !task.reminderTime || task.completed) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (task.reminderNotified) return;

    const reminderDate = new Date(
        `${task.dueDate}T${task.reminderTime}`
    );

    const delay = reminderDate.getTime() - Date.now();

    if (delay <= 0) {
        sendReminderNotification(task);
        return;
    }

    const maximumDelay = 2147483647;

    const timer = setTimeout(() => {
        scheduleReminder(task);
    }, Math.min(delay, maximumDelay));

    reminderTimers.set(task.id, timer);
}


// 23. REQUEST NOTIFICATION PERMISSION

async function enableNotifications() {
    if (!("Notification" in window)) {
        alert("Your browser does not support notifications.");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission === "denied") {
        alert(
            "Notifications are blocked for this website. " +
            "You can enable them in your browser's site settings."
        );

        return false;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        alert("Notifications were not enabled.");
        return false;
    }

    return true;
}


// 24. ADD NEW TASK

async function addTask() {
    const text = taskInput.value.trim();
    const description = taskDescription.value.trim();

    const date = taskDate.value;
    const time = taskTime.value;

    const category = taskCategory.value;
    const priority = taskPriority.value;

    if (!text) {
        taskInput.focus();
        return;
    }

    // A TIME REQUIRES A DATE.
    // A DATE DOES NOT REQUIRE A REMINDER TIME.

    if (time && !date) {
        alert("Please select a due date before setting a reminder time.");
        return;
    }

    let savedReminderTime = time || null;

    if (date && time) {
        const reminderDate = new Date(`${date}T${time}`);

        if (Number.isNaN(reminderDate.getTime())) {
            alert("Please enter a valid reminder date and time.");
            return;
        }

        // Past due dates are allowed.
        // A reminder, however, must be in the future.
        if (reminderDate.getTime() <= Date.now()) {
            const continueWithoutReminder = confirm(
                "This due date is in the past. The task will still be saved as overdue, but its reminder time will be removed. Continue?"
            );

            if (!continueWithoutReminder) return;

            savedReminderTime = null;
        }
    }

    const newTask = {
        id: Date.now(),
        text,
        description,
        completed: false,
        dueDate: date || null,
        reminderTime: savedReminderTime,
        category,
        priority,
        reminderNotified: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();


    // RESET INPUTS

    taskInput.value = "";
    taskDescription.value = "";

    taskDate.value = "";
    taskTime.value = "";

    taskCategory.value = "Personal";
    taskPriority.value = "Medium";

    taskInput.focus();


    // ENABLE NOTIFICATIONS ONLY WHEN BOTH DATE AND TIME EXIST

    if (newTask.dueDate && newTask.reminderTime) {
        const permissionGranted = await enableNotifications();

        if (permissionGranted) {
            scheduleReminder(newTask);
        }
    }
}


// 25. ADD TASK EVENTS

addButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        addTask();
    }
});


// 26. STATUS FILTERS

filters.forEach(button => {
    button.addEventListener("click", () => {
        filters.forEach(filter => {
            filter.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();
    });
});


// 27. INITIALIZE APPLICATION

renderTasks();
initializeWelcome();


// RESTORE SAVED REMINDERS

if (
    "Notification" in window &&
    Notification.permission === "granted"
) {
    tasks.forEach(task => {
        scheduleReminder(task);
    });
}