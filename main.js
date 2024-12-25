/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/

;// ./src/img/pin.png
const pin_namespaceObject = __webpack_require__.p + "40f912e9e8455e4e8ef3.png";
;// ./src/js/Task.js

class Task {
  constructor(id, content, boardId, board, isPinned = false, completed = false) {
    this.id = id;
    this.content = content;
    this.boardId = boardId;
    this.board = board;
    this.isPinned = isPinned;
    this.completed = completed;
  }
  render() {
    const task = this.createTaskElement(this.content);
    task.setAttribute("data-id", this.id);
    task.setAttribute("data-board-id", this.boardId);
    task.draggable = "true";
    const checkbox = task.querySelector(".task_checkbox");
    task.addEventListener("dragstart", this.onDragStart.bind(this));
    task.addEventListener("dragover", this.onDragOver.bind(this));
    task.addEventListener("drop", this.onDrop.bind(this));
    task.addEventListener("dragend", this.onDragEnd.bind(this));
    if (this.completed) {
      checkbox.checked = true;
      task.querySelector(".task_input").classList.add("line-through");
    }
    checkbox.addEventListener("change", () => {
      const input = task.querySelector(".task_input");
      this.completed = checkbox.checked;
      if (this.completed) {
        input.classList.add("line-through");
      } else {
        input.classList.remove("line-through");
      }
      this.syncTaskState();
    });
    return task;
  }
  onDragStart(e) {
    e.dataTransfer.setData("text/plain", this.id);
    e.target.classList.add("dragged");
    console.log("drag");
  }
  onDragOver(e) {
    e.preventDefault();
    console.log("dragover");
  }
  onDrop(e) {
    e.preventDefault();
    const droppedTaskId = e.dataTransfer.getData("text/plain");
    if (!droppedTaskId) {
      console.error("Ошибка при перетаскивании: id не передан.");
      return;
    }
    console.log(`drop: trying to move task with ID ${droppedTaskId} to ${this.id}`);
    const boardData = JSON.parse(localStorage.getItem("TaskBoard"));
    const boardTasks = boardData.tasks[this.boardId];
    console.log("Current tasks in board before syncing:", boardTasks);
    const taskExists = boardTasks.some(task => task.id === droppedTaskId);
    if (!taskExists) {
      console.log(`Task with ID ${droppedTaskId} not found in board ${this.boardId}`);
    }
    if (droppedTaskId !== this.id) {
      this.board.moveTask(droppedTaskId, this.id);
      console.log("drop executed");
      const oldTaskElement = document.querySelector(`.task[data-id="${droppedTaskId}"]`);
      if (oldTaskElement) {
        oldTaskElement.remove();
      } else {
        console.warn(`Не удалось найти старый элемент задачи с id ${droppedTaskId}`);
      }
      const taskElement = this.board.getTaskElement(droppedTaskId);
      taskElement && taskElement.remove();
      this.board.renderTask(droppedTaskId);
    }
  }
  onDragEnd(e) {
    e.target.classList.remove("dragged");
  }
  syncTaskState() {
    const boardData = JSON.parse(localStorage.getItem("TaskBoard"));
    const table = boardData.tasks[this.boardId];
    console.log("Current tasks in board before syncing:", table);
    const taskIndex = table.findIndex(task => task.id === this.id);
    if (taskIndex !== -1) {
      console.log(`Syncing task with ID ${this.id}`);
      boardData.tasks[this.boardId][taskIndex] = {
        ...boardData.tasks[this.boardId][taskIndex],
        completed: this.completed,
        isPinned: this.isPinned,
        content: this.content
      };
      localStorage.setItem("TaskBoard", JSON.stringify(boardData));
    } else {
      console.log(`Task with ID ${this.id} not found in board data.`);
    }
  }
  createTaskElement(content) {
    const task = document.createElement("div");
    task.setAttribute("data-id", this.id);
    task.classList.add("task");
    const taskInputWrapper = document.createElement("div");
    taskInputWrapper.classList.add("task_input_wrapper");
    task.appendChild(taskInputWrapper);
    const inputWrapper = document.createElement("div");
    inputWrapper.classList.add("input_wrapper");
    const taskInput = document.createElement("div");
    taskInput.classList.add("task_input");
    taskInput.contentEditable = "true";
    taskInput.textContent = content;
    taskInput.addEventListener("input", event => {
      this.content = event.target.textContent;
      this.syncTaskState();
    });
    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.name = "task_checkbox";
    taskCheckbox.classList.add("task_checkbox");
    taskCheckbox.addEventListener("change", () => {
      if (taskCheckbox.checked) {
        this.completed = taskCheckbox.checked;
        taskInput.classList.add("line-through", this.completed);
        this.syncTaskState();
      }
    });
    const taskButtons = document.createElement("div");
    taskButtons.classList.add("task_buttons");
    const deleteBtn = this.createButton("⨉", "delete_task_button", () => {
      const board = document.querySelector(`.task_container[data-id="${this.boardId}"]`);
      const pinnedTasksContainer = board.querySelector(".pinned_wrapper .pinned_tasks");
      const emptyMessage = board.querySelector(".pinned_wrapper .no_pinned_tasks");
      this.board.removeTaskFromTable(this.boardId, this.id);
      task.remove();
      this.updatePinnedVisibility(pinnedTasksContainer, emptyMessage);
    });
    const pinnedBtn = this.createButton("📌", "pinned_task_button", () => this.addPin(this.content));
    taskButtons.append(deleteBtn, pinnedBtn);
    taskInputWrapper.appendChild(taskInput);
    taskInputWrapper.append(taskButtons, taskCheckbox);
    return task;
  }
  createButton(text, className, onClick) {
    const button = document.createElement("button");
    button.classList.add(className);
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }
  createPinnedSection(board) {
    const taskBlock = board.querySelector(".task_block");
    if (board.querySelector(".pinned_wrapper")) return;
    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper", "pinned_wrapper");
    const pinnedHeader = document.createElement("h2");
    pinnedHeader.textContent = "Pinned";
    const pinImg = document.createElement("img");
    pinImg.src = pin_namespaceObject;
    pinImg.alt = "pin";
    pinImg.classList.add("pin");
    const pinnedHeaderWrapper = document.createElement("div");
    pinnedHeaderWrapper.classList.add("pinned_header_wrapper");
    pinnedHeaderWrapper.append(pinnedHeader, pinImg);
    const pinnedTasks = document.createElement("div");
    pinnedTasks.classList.add("pinned_tasks");
    const noPinned = document.createElement("div");
    noPinned.classList.add("no_pinned_tasks");
    noPinned.textContent = "No pinned tasks";
    wrapper.append(pinnedHeaderWrapper, pinnedTasks, noPinned);
    const allTasks = taskBlock.querySelector(".all_tasks_wrapper");
    taskBlock.insertBefore(wrapper, allTasks);
    this.updatePinnedVisibility(pinnedHeaderWrapper, noPinned);
    return wrapper;
  }
  updatePinnedVisibility(pinnedTasks, emptyMessage) {
    if (!emptyMessage) return;
    const pinnedHeaderWrapper = emptyMessage.closest(".pinned_wrapper").querySelector(".pinned_header_wrapper");
    if (pinnedTasks.children.length === 0) {
      emptyMessage.style.display = "block";
      pinnedTasks.style.display = "none";
      pinnedHeaderWrapper.style.display = "none";
    } else {
      emptyMessage.style.display = "none";
      pinnedTasks.style.display = "flex";
      pinnedHeaderWrapper.style.display = "flex";
    }
  }
  addPin(content, isInitialization = false) {
    if (!isInitialization) {
      this.isPinned = !this.isPinned;
    }
    this.syncTaskState();
    const board = document.querySelector(`.task_container[data-id="${this.boardId}"]`);
    if (!board) return;
    const pinnedWrapper = board.querySelector(".pinned_wrapper");
    if (!pinnedWrapper) {
      this.createPinnedSection(board);
    }
    const pinnedTasksContainer = board.querySelector(".pinned_wrapper .pinned_tasks");
    const allTasksContainer = board.querySelector(".all_tasks_wrapper");
    const emptyMessage = board.querySelector(".pinned_wrapper .no_pinned_tasks");
    const taskElement = board.querySelector(`.task[data-id="${this.id}"]`);
    if (!taskElement) return;
    if (this.isPinned) {
      pinnedTasksContainer.appendChild(taskElement);
    } else {
      allTasksContainer.appendChild(taskElement);
    }
    this.updatePinnedVisibility(pinnedTasksContainer, emptyMessage);
    const pinButton = taskElement.querySelector(".pinned_task_button");
    if (this.isPinned) {
      pinButton.classList.add("active");
    } else {
      pinButton.classList.remove("active");
    }
  }
}
;// ./src/js/generate_table.js
// import penImagePath from "../img/highlighter.png";

class Space {
  constructor(board) {
    this.board = board;
  }
  generateTable(id, removeTableCallback, addTaskCallback) {
    const taskContainer = document.createElement("div");
    taskContainer.classList.add("task_container");
    taskContainer.dataset.id = id;
    document.querySelector(".planner_container").appendChild(taskContainer);
    const taskBlock = document.createElement("div");
    taskBlock.classList.add("task_block");
    taskContainer.appendChild(taskBlock);
    const boardTitleWrapper = document.createElement("div");
    boardTitleWrapper.classList.add("board_title_wrapper");
    const boardTitle = document.createElement("h2");
    boardTitle.classList.add("board_title");
    boardTitle.contentEditable = true;
    boardTitle.textContent = `Board ${id}`;
    taskBlock.appendChild(boardTitleWrapper);
    boardTitle.addEventListener("blur", () => {
      const updatedTitle = boardTitle.textContent.trim();
      if (!updatedTitle) {
        boardTitle.textContent = `Board ${id}`;
      }
    });
    boardTitleWrapper.appendChild(boardTitle);
    const secondwrapper = document.createElement("div");
    secondwrapper.classList.add("wrapper");
    const allTasksWrapper = document.createElement("div");
    allTasksWrapper.classList.add("all_tasks_wrapper");
    taskBlock.appendChild(allTasksWrapper);
    const allTasksHeader = document.createElement("h2");
    allTasksHeader.textContent = "All Tasks";

    // const penimg = document.createElement("img");
    // penimg.src = penImagePath;
    // penimg.alt = "pen";
    // penimg.classList.add("pen");
    secondwrapper.appendChild(allTasksHeader);
    // secondwrapper.append(allTasksHeader, penimg);
    allTasksWrapper.append(secondwrapper);
    const addTaskPopup = document.createElement("div");
    addTaskPopup.classList.add("add_task_popup", "hidden");
    const addCardButton = document.createElement("button");
    addCardButton.classList.add("add_card");
    addCardButton.textContent = "Add Card";
    const deletePopup = document.createElement("button");
    deletePopup.classList.add("delete_popup");
    deletePopup.textContent = "×";
    addTaskPopup.append(addCardButton, deletePopup);
    taskContainer.appendChild(addTaskPopup);
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    taskContainer.appendChild(tooltip);
    const button = document.createElement("button");
    button.type = "submit";
    button.classList.add("remove_taskslist_button", "tooltip_button");
    button.textContent = "×";
    const addButton = document.createElement("button");
    addButton.type = "submit";
    addButton.classList.add("add_card_button", "tooltip_button");
    addButton.textContent = "+ Add another card";
    tooltip.append(button, addButton);
    button.addEventListener("click", () => {
      removeTableCallback(id);
      taskContainer.remove();
    });
    deletePopup.addEventListener("click", () => {
      addTaskPopup.classList.add("hidden");
      newTask.value = "";
      newTask.classList.add("hidden");
    });
    const newTask = document.createElement("input");
    newTask.classList.add("new_task", "task_input", "hidden");
    newTask.type = "text";
    newTask.placeholder = "Write down your text here";
    taskBlock.appendChild(newTask);
    addButton.addEventListener("click", () => {
      addTaskPopup.classList.remove("hidden");
      newTask.classList.remove("hidden");
    });
    function handleAddNewTask() {
      const content = newTask.value.trim();
      if (!content || !/[a-zA-Zа-яА-Я]/.test(content)) {
        const newTask = taskContainer.querySelector(".new_task");
        const existingError = newTask.querySelector(".error");
        if (!existingError) {
          const error = document.createElement("div");
          error.classList.add("error");
          taskBlock.appendChild(error);
          error.textContent = "Please, write down a task!";
          newTask.classList.add("input-error");
          setTimeout(() => {
            error.remove();
            newTask.classList.remove("input-error");
          }, 2000);
        }
      } else {
        const taskId = Date.now();
        const boardId = taskContainer.dataset.id;
        addTaskCallback(taskId, content, boardId);
        const task = new Task(taskId, content, boardId);
        const taskElement = task.render();
        allTasksWrapper.appendChild(taskElement);
        newTask.value = "";
        newTask.classList.add("hidden");
        addTaskPopup.classList.add("hidden");
        newTask.classList.add("hidden");
      }
    }
    newTask.addEventListener("keydown", e => {
      const tip = taskContainer.querySelector(".tip");
      if (tip) {
        tip.textContent = "";
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddNewTask();
      }
    });
    addCardButton.addEventListener("click", () => {
      handleAddNewTask();
    });
    return taskContainer;
  }
}
;// ./src/js/board.js

class Board {
  constructor() {
    this.tasks = {};
    this.counter = 0;
    this.space = null;
    this.taskFilter = null;
  }
  initialize(space, taskFilter) {
    this.space = space;
    this.taskFilter = taskFilter;
    this.taskFilter.applyFilter(this.taskFilter.filterInput.value.toLowerCase());
  }
  moveTask(sourceTaskId, targetTaskId) {
    console.log(`Attempting to move task from ${sourceTaskId} to ${targetTaskId}`);
    const sourceTask = this.findTaskById(sourceTaskId);
    const targetTask = this.findTaskById(targetTaskId);
    if (sourceTask && targetTask) {
      console.log(`Found source task:`, sourceTask);
      console.log(`Found target task:`, targetTask);
      const sourceContainer = document.querySelector(`.task_container[data-board-id="${sourceTask.boardId}"]`);
      const targetContainer = document.querySelector(`.task_container[data-board-id="${targetTask.boardId}"]`);
      if (sourceContainer && targetContainer) {
        console.log(`Found source container:`, sourceContainer);
        console.log(`Found target container:`, targetContainer);
        const taskElement = sourceContainer.querySelector(`.task[data-id="${sourceTaskId}"]`);
        console.log(`Found task element to move:`, taskElement);
        if (taskElement) {
          targetContainer.appendChild(taskElement);
          console.log(`Task moved successfully`);
          this.updateTaskBoard(sourceTaskId, targetTask.boardId);
          console.log(`Task board updated:`, this.tasks);
          this.saveToLocalStorage();
          console.log(`Changes saved to local storage`);
        } else {
          console.error(`Task element not found in the source container`);
        }
      } else {
        console.error(`Source or target container not found.`);
      }
    } else {
      console.error(`Source or target task not found.`);
    }
  }
  findTaskById(taskId) {
    console.log(`Looking for task with ID: ${taskId}`);
    for (const boardId in this.tasks) {
      const task = this.tasks[boardId].find(t => t.id === taskId);
      if (task) {
        console.log(`Task found for board ${boardId}:`, task);
        return task;
      }
    }
    console.log(`Task with ID ${taskId} not found.`);
    return null;
  }
  updateTaskBoard(taskId, newBoardId) {
    for (const boardId in this.tasks) {
      const taskIndex = this.tasks[boardId].findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const [task] = this.tasks[boardId].splice(taskIndex, 1);
        this.tasks[newBoardId] = this.tasks[newBoardId] || [];
        this.tasks[newBoardId].push(task);
        return;
      }
    }
  }
  saveToLocalStorage() {
    try {
      const data = {
        counter: this.counter,
        tasks: this.tasks
      };
      localStorage.setItem("TaskBoard", JSON.stringify(data));
      console.log("Saved to localStorage", data);
    } catch (error) {
      console.error("Failed to save tasks in local storage", error);
    }
  }
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem("TaskBoard");
      if (data) {
        const parsedData = JSON.parse(data);
        this.counter = parsedData.counter || 0;
        this.tasks = parsedData.tasks || {};
        console.log("Loaded tasks:", this.tasks);
        for (const id in this.tasks) {
          if (Object.prototype.hasOwnProperty.call(this.tasks, id)) {
            this.space.generateTable(id, removeId => {
              this.removeTable(removeId);
              this.taskFilter.applyFilter(this.taskFilter.filterInput.value.toLowerCase());
            }, (taskId, taskContent) => {
              this.addTaskToTable(id, {
                id: taskId,
                content: taskContent
              });
              this.taskFilter.applyFilter(this.taskFilter.filterInput.value.toLowerCase());
            });
            this.tasks[id].forEach(task => {
              const taskInstance = new Task(task.id, task.content, id, this, task.isPinned, task.completed);
              const taskElement = taskInstance.render();
              const taskContainer = document.querySelector(`.task_container[data-id="${id}"] .all_tasks_wrapper`);
              taskContainer.appendChild(taskElement);
              if (task.completed) {
                taskElement.querySelector(".task_checkbox").checked = true;
                taskElement.querySelector(".task_input").classList.add("line-through");
              }
              if (task.isPinned) {
                const board = document.querySelector(`.task_container[data-id="${id}"]`);
                if (board) {
                  taskInstance.addPin(task.content, true);
                }
              }
            });
          }
        }
        document.dispatchEvent(new Event("boardInitialized"));
      }
    } catch (error) {
      console.error("Failed to load tasks from local storage", error);
    }
  }
  addTable() {
    const id = ++this.counter;
    this.tasks[id] = [];
    this.saveToLocalStorage();
    this.taskFilter.applyFilter(this.taskFilter.filterInput.value.toLowerCase());
    return id;
  }
  removeTable(id) {
    console.log("Removing table with ID:", id);
    delete this.tasks[id];
    this.saveToLocalStorage();
  }
  getBoards() {
    return Object.keys(this.tasks);
  }
  addTaskToTable(tableId, task) {
    if (!this.tasks[tableId]) {
      console.error(`Table with ID ${tableId} does not exist.`);
      return;
    }
    const extendedTask = {
      ...task,
      completed: false,
      isPinned: false
    };
    this.tasks[tableId].push(extendedTask);
    this.saveToLocalStorage();
    this.taskFilter.applyFilter(this.taskFilter.filterInput.value.toLowerCase());
  }
  removeTaskFromTable(tableId, taskId) {
    if (!this.tasks[tableId]) {
      console.error(`Table with ID ${tableId} does not exist.`);
      return;
    }
    this.tasks[tableId] = this.tasks[tableId].filter(task => task.id !== taskId);
    this.saveToLocalStorage();
    this.taskFilter.applyFilter(this.taskFilter.filterInput.value.toLowerCase());
  }
  getTaskElement(taskId) {
    for (const boardId in this.tasks) {
      const boardContainer = document.querySelector(`.task_container[data-id="${boardId}"]`);
      if (boardContainer) {
        const taskElement = boardContainer.querySelector(`.task[data-id="${taskId}"]`);
        if (taskElement) {
          return taskElement;
        }
      }
    }
    return null;
  }
  renderTask(taskId) {
    for (const boardId in this.tasks) {
      const boardContainer = document.querySelector(`.task_container[data-id="${boardId}"]`);
      if (boardContainer) {
        const task = this.tasks[boardId].find(t => t.id === taskId);
        if (task) {
          const taskInstance = new Task(task.id, task.content, boardId, this, task.isPinned, task.completed);
          const taskElement = taskInstance.render();
          const taskContainer = boardContainer.querySelector(".all_tasks_wrapper");
          taskContainer.appendChild(taskElement);
          break;
        }
      }
    }
  }
}
;// ./src/js/task_filter.js
class TaskFilter {
  constructor(filterInputSelector, containerSelector) {
    this.filterInput = document.querySelector(filterInputSelector);
    this.containerSelector = containerSelector;
    this.init();
  }
  init() {
    this.filterInput.addEventListener("input", () => {
      const filterValue = this.filterInput.value.toLowerCase();
      this.applyFilter(filterValue);
    });
    this.filterInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.filterInput.value = "";
        this.applyFilter("");
      }
    });
  }
  getContainers() {
    return document.querySelectorAll(this.containerSelector);
  }
  applyFilter(filterValue) {
    const containers = this.getContainers();
    containers.forEach(container => {
      const allTasks = container.querySelector(".all_tasks_wrapper");
      if (!allTasks) {
        console.error("All tasks wrapper not found!");
        return;
      }
      const tasks = allTasks.querySelectorAll(".task");
      let found = false;
      tasks.forEach(task => {
        const contentElement = task.querySelector(".task_input");
        if (!contentElement) {
          console.error("Task input not found in task:", task);
          return;
        }
        const content = (contentElement.textContent || "").toLowerCase();
        if (content.startsWith(filterValue)) {
          task.style.display = "flex";
          found = true;
        } else {
          task.style.display = "none";
        }
      });
      const noTasksMessage = allTasks.querySelector(".no_tasks_found");
      if (!found && filterValue !== "") {
        if (!noTasksMessage) {
          const message = document.createElement("div");
          message.textContent = "No tasks found";
          message.classList.add("no_tasks_found");
          allTasks.appendChild(message);
        }
      } else if (noTasksMessage) {
        noTasksMessage.remove();
      }
    });
  }
}
;// ./src/js/user_actions.js



class UserBoard {
  constructor() {
    this.board = new Board();
    this.space = new Space();
    this.taskFilter = new TaskFilter(".filter_input", ".task_container");
    this.board.initialize(this.space, this.taskFilter);
    document.addEventListener("boardInitialized", this.init.bind(this));
    this.board.loadFromLocalStorage();
  }
  init() {
    const addBtn = document.querySelector(".add_taskslist_button");
    if (!addBtn) {
      console.error("Кнопка не найдена!");
    } else {
      console.log("Кнопка добавлена");
    }
    const searchBar = document.querySelector(".search_bar");
    if (localStorage.getItem("searchBarVisible") === "false") {
      searchBar.classList.add("hidden");
    } else {
      searchBar.classList.remove("hidden");
    }
    addBtn.addEventListener("click", () => {
      const id = this.board.addTable();
      this.space.generateTable(id, removeId => {
        this.board.removeTable(removeId);
        this.taskFilter.applyFilter(this.taskFilter.filterInput.value.toLowerCase());
        this.updateSearchBarVisibility();
        this.triggerTablesUpdated();
      }, (taskId, taskContent) => {
        this.board.addTaskToTable(id, {
          id: taskId,
          content: taskContent
        });
        this.taskFilter.applyFilter(this.taskFilter.filterInput.value.toLowerCase());
        this.triggerTablesUpdated();
      });
      this.taskFilter.applyFilter(this.taskFilter.filterInput.value.toLowerCase());
      this.updateSearchBarVisibility();
    });
    this.updateSearchBarVisibility();
    const savedFilterValue = localStorage.getItem("searchQuery");
    if (savedFilterValue) {
      this.taskFilter.filterInput.value = savedFilterValue;
      this.taskFilter.applyFilter(savedFilterValue.toLowerCase());
    }
    this.taskFilter.filterInput.addEventListener("input", () => {
      const filterValue = this.taskFilter.filterInput.value;
      localStorage.setItem("searchQuery", filterValue);
      this.taskFilter.applyFilter(filterValue.toLowerCase());
    });
    document.addEventListener("tablesUpdated", () => {
      console.log("Событие tablesUpdated запущено");
      this.dragTask();
    });
  }
  updateSearchBarVisibility() {
    const searchBar = document.querySelector(".search_bar");
    const boards = this.board.getBoards();
    if (boards.length > 0) {
      searchBar.classList.remove("hidden");
    } else {
      searchBar.classList.add("hidden");
    }
  }
  triggerTablesUpdated() {
    document.dispatchEvent(new CustomEvent("tablesUpdated"));
  }
  dragTask() {
    const taskContainers = document.querySelectorAll(".task_container");
    taskContainers.forEach(container => {
      const tasks = container.querySelectorAll(".task");
      tasks.forEach(taskElement => {
        this.initializeTaskEvents(taskElement);
      });
    });
  }
  initializeTaskEvents(taskElement) {
    taskElement.setAttribute("draggable", "true");
    taskElement.addEventListener("dragstart", e => {
      const taskId = e.target.getAttribute("data-id");
      e.dataTransfer.setData("text/plain", taskId);
      e.target.classList.add("dragging");
    });
    taskElement.addEventListener("dragover", e => {
      e.preventDefault();
      e.target.classList.add("drag-over");
    });
    taskElement.addEventListener("dragleave", e => {
      e.target.classList.remove("drag-over");
    });
    taskElement.addEventListener("drop", e => {
      e.preventDefault();
      const draggedTaskId = e.dataTransfer.getData("text/plain");
      const droppedTaskId = e.target.getAttribute("data-id");
      if (draggedTaskId !== droppedTaskId) {
        this.board.moveTask(draggedTaskId, droppedTaskId);
        this.triggerTablesUpdated();
      }
      e.target.classList.remove("drag-over");
    });
    taskElement.addEventListener("dragend", e => {
      e.target.classList.remove("dragging");
    });
  }
  initializeDrag(taskContainers) {
    taskContainers.forEach(container => {
      const tasks = container.querySelectorAll(".task");
      tasks.forEach(taskElement => {
        const taskId = taskElement.getAttribute("data-id");
        const task = this.board.findTaskById(taskId);
        if (task) {
          const newTaskElement = task.createElement();
          taskElement.replaceWith(newTaskElement);
          this.initializeTaskEvents(newTaskElement);
        }
      });
    });
  }
}
;// ./src/js/app.js

const newSpace = new UserBoard();
;// ./src/index.js


/******/ })()
;