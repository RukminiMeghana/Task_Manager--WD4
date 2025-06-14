// ========= script.js =========

// ====== 1. Task Class ======
class Task {
  constructor(id, title, description, priority, category, completed = false) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.category = category;
    this.completed = completed;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }
}

// ====== 2. TaskManager Class ======
class TaskManager {
  constructor() {
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push(task);
    this.save();
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
  }

  updateTask(task) {
    const idx = this.tasks.findIndex(t => t.id === task.id);
    if (idx > -1) {
      this.tasks[idx] = task;
      this.save();
    }
  }

  getTasks(category = 'All', query = '') {
    return this.tasks
      .filter(t => category === 'All' || t.category === category)
      .filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
  }

  markComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.toggleComplete();
      this.save();
    }
  }

  save() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  load() {
    const data = JSON.parse(localStorage.getItem('tasks')) || [];
    this.tasks = data.map(
      t => new Task(t.id, t.title, t.description, t.priority, t.category, t.completed)
    );
  }
}

// ====== 3. DOM Elements ======
const form = document.getElementById('task-form');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const priorityInput = document.getElementById('priority');
const categoryInput = document.getElementById('category');
const submitBtn = document.getElementById('submit-btn');
const searchInput = document.getElementById('search-box');
const categoryFilter = document.getElementById('category-filter');
const prioritySort = document.getElementById('priority-sort');
const taskList = document.getElementById('task-list');
const themeToggle = document.getElementById('theme-toggle');
const notificationBox = document.getElementById('notifications');

let manager = new TaskManager();
let editingId = null;
manager.load();

// ====== 4. Helpers ======
function notify(msg) {
  notificationBox.textContent = msg;
  notificationBox.classList.add('visible');
  setTimeout(() => notificationBox.classList.remove('visible'), 3500);
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => {
    el.textContent = '';
    el.style.visibility = 'hidden';
  });
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

function showError(el, msg) {
  const err = document.getElementById(`${el.id}-error`);
  err.textContent = msg;
  err.style.visibility = 'visible';
  el.classList.add('input-error');
}

function sortTasks(tasks) {
  const order = { High: 3, Medium: 2, Low: 1 };
  if (prioritySort.value === 'high-low')
    return tasks.sort((a, b) => order[b.priority] - order[a.priority]);
  if (prioritySort.value === 'low-high')
    return tasks.sort((a, b) => order[a.priority] - order[b.priority]);
  return tasks;
}

function render() {
  taskList.innerHTML = '';
  let list = manager.getTasks(
    categoryFilter.value,
    searchInput.value.trim().toLowerCase()
  );
  list = sortTasks(list);

  list.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card' + (task.completed ? ' completed' : '');

    card.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Category:</strong> ${task.category}</p>
      <div class="actions">
        <button class="btn-complete" onclick="toggleComplete(${task.id})">✔️</button>
        <button class="btn-edit" onclick="startEdit(${task.id})">✏️</button>
        <button class="btn-delete" onclick="remove(${task.id})">🗑️</button>
      </div>
    `;

    taskList.appendChild(card);
  });
}

// ====== 5. Events ======
form.addEventListener('submit', e => {
  e.preventDefault();
  clearErrors();
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();

  if (!title) return showError(titleInput, 'Title required');
  if (!desc) return showError(descInput, 'Description required');

  if (editingId) {
    const prev = manager.tasks.find(t => t.id === editingId);
    const updated = new Task(
      editingId,
      title,
      desc,
      priorityInput.value,
      categoryInput.value,
      prev.completed
    );
    manager.updateTask(updated);
    if (priorityInput.value === 'High') {
      notify(`🚨 High-priority task updated!`);
    }
    editingId = null;
    submitBtn.textContent = 'Add Task';
  } else {
    const newTask = new Task(
      Date.now(),
      title,
      desc,
      priorityInput.value,
      categoryInput.value
    );
    manager.addTask(newTask);
    if (priorityInput.value === 'High') {
      notify(`🚨 High-priority task added!`);
    }
  }

  form.reset();
  render();
});

function remove(id) {
  manager.deleteTask(id);
  render();
}

function toggleComplete(id) {
  manager.markComplete(id);
  const t = manager.tasks.find(t => t.id === id);
  if (t.priority === 'High') notify('🚨 High-priority task completed!');
  render();
}

function startEdit(id) {
  const t = manager.tasks.find(t => t.id === id);
  titleInput.value = t.title;
  descInput.value = t.description;
  priorityInput.value = t.priority;
  categoryInput.value = t.category;
  editingId = id;
  submitBtn.textContent = 'Update Task';
}

searchInput.addEventListener('input', render);
categoryFilter.addEventListener('change', render);
prioritySort.addEventListener('change', render);

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  localStorage.setItem(
    'theme',
    document.body.classList.contains('dark-theme') ? 'dark' : 'light'
  );
});

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark')
    document.body.classList.add('dark-theme');
  render();
});
