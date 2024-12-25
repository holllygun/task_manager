import Space from "./generate_table";
import Board from "./board";
import TaskFilter from "./task_filter";

export default class UserBoard {
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
      this.space.generateTable(
        id,
        (removeId) => {
          this.board.removeTable(removeId);
          this.taskFilter.applyFilter(
            this.taskFilter.filterInput.value.toLowerCase(),
          );
          this.updateSearchBarVisibility();
          this.triggerTablesUpdated();
        },
        (taskId, taskContent) => {
          this.board.addTaskToTable(id, { id: taskId, content: taskContent });
          this.taskFilter.applyFilter(
            this.taskFilter.filterInput.value.toLowerCase(),
          );
          this.triggerTablesUpdated();
        },
      );

      this.taskFilter.applyFilter(
        this.taskFilter.filterInput.value.toLowerCase(),
      );

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
    taskContainers.forEach((container) => {
      const tasks = container.querySelectorAll(".task");
      tasks.forEach((taskElement) => {
        this.initializeTaskEvents(taskElement);
      });
    });
  }

  initializeTaskEvents(taskElement) {
    taskElement.setAttribute("draggable", "true");

    taskElement.addEventListener("dragstart", (e) => {
      const taskId = e.target.getAttribute("data-id");
      e.dataTransfer.setData("text/plain", taskId);
      e.target.classList.add("dragging");
    });

    taskElement.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.target.classList.add("drag-over");
    });

    taskElement.addEventListener("dragleave", (e) => {
      e.target.classList.remove("drag-over");
    });

    taskElement.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggedTaskId = e.dataTransfer.getData("text/plain");
      const droppedTaskId = e.target.getAttribute("data-id");

      if (draggedTaskId !== droppedTaskId) {
        this.board.moveTask(draggedTaskId, droppedTaskId);
        this.triggerTablesUpdated();
      }

      e.target.classList.remove("drag-over");
    });

    taskElement.addEventListener("dragend", (e) => {
      e.target.classList.remove("dragging");
    });
  }

  initializeDrag(taskContainers) {
    taskContainers.forEach((container) => {
      const tasks = container.querySelectorAll(".task");
      tasks.forEach((taskElement) => {
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
