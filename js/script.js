document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const taskInput = document.getElementById('taskInput');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskList = document.getElementById('taskList');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const prioritySelect = document.getElementById('prioritySelect');
  const dueDateInput = document.getElementById('dueDateInput');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const searchInput = document.getElementById('searchInput');

  // State
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentFilter = 'all';
  let dragStartIndex;

  // Initialize date picker
  flatpickr("#dueDateInput", {
    dateFormat: "Y-m-d",
    minDate: "today"
  });

  // Load dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Render tasks
  function renderTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
      // Filter by status
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    });

    filteredTasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = `list-group-item task-item d-flex justify-content-between align-items-center ${task.completed ? 'completed' : ''} priority-${task.priority}`;
      li.setAttribute('data-index', index);
      li.setAttribute('draggable', 'true');
      
      li.innerHTML = `
        <div class="d-flex align-items-center">
          <input type="checkbox" class="form-check-input me-2" ${task.completed ? 'checked' : ''}>
          <span>${task.text}</span>
          ${task.dueDate ? `<span class="badge bg-secondary ms-2">${task.dueDate}</span>` : ''}
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary edit-btn me-1">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      // Search filter
      const searchTerm = searchInput.value.toLowerCase();
      if (searchTerm && !task.text.toLowerCase().includes(searchTerm)) {
        li.style.display = 'none';
      }

      taskList.appendChild(li);

      // Add event listeners
      const checkbox = li.querySelector('.form-check-input');
      const editBtn = li.querySelector('.edit-btn');
      const deleteBtn = li.querySelector('.delete-btn');

      checkbox.addEventListener('change', () => toggleTask(index));
      editBtn.addEventListener('click', () => editTask(index));
      deleteBtn.addEventListener('click', () => deleteTask(index));

      // Drag events
      li.addEventListener('dragstart', dragStart);
      li.addEventListener('dragover', dragOver);
      li.addEventListener('dragleave', dragLeave);
      li.addEventListener('dragend', dragEnd);
      li.addEventListener('drop', drop);
    });
  }

  // Task functions
  function addTask() {
    const text = taskInput.value.trim();
    if (text) {
      tasks.push({
        text,
        completed: false,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value || null
      });
      
      taskInput.value = '';
      dueDateInput.value = '';
      saveTasks();
      renderTasks();
    }
  }

  function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  }

  function editTask(index) {
    const newText = prompt('Edit task:', tasks[index].text);
    if (newText !== null) {
      tasks[index].text = newText.trim();
      saveTasks();
      renderTasks();
    }
  }

  function deleteTask(index) {
    if (confirm('Are you sure you want to delete this task?')) {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }
  }

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Drag and drop functions
  function dragStart(e) {
    dragStartIndex = +this.getAttribute('data-index');
    this.classList.add('dragging');
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function dragLeave() {
    this.classList.remove('dragging');
  }

  function dragEnd() {
    this.classList.remove('dragging');
  }

  function drop() {
    const dragEndIndex = +this.getAttribute('data-index');
    swapTasks(dragStartIndex, dragEndIndex);
  }

  function swapTasks(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    
    const [removed] = tasks.splice(fromIndex, 1);
    tasks.splice(toIndex, 0, removed);
    saveTasks();
    renderTasks();
  }

  // Event listeners
  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      renderTasks();
    });
  });

  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });

  searchInput.addEventListener('input', renderTasks);

  // Initial render
  renderTasks();
});