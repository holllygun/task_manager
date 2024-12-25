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
    const observer = new MutationObserver((mutationsList) => {
      let taskContainers = document.querySelectorAll(".task_container");
      console.log("Проверка: Контейнеры найдено", taskContainers.length);

      if (taskContainers.length === 0) {
        console.error("Контейнеры не найдены");
      } else {
        console.log("Контейнеры", taskContainers.length, "шт");
        this.initializeDrag(taskContainers);
        observer.disconnect();
      }

      mutationsList.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains("task_container")) {
              console.log("Добавлен новый task-container:", node);
            }
          });
        }
      });
    });

    const plannerContainer = document.querySelector(".planner_container");
    if (plannerContainer) {
      observer.observe(plannerContainer, { childList: true });
      console.log("MutationObserver настроен для .planner_container...");
    } else {
      console.error("planner_container не найден.");
    }
  }

  initializeDrag(taskContainers) {
    let draggedTask = null;

    taskContainers.forEach((container) => {
      container.replaceWith(container.cloneNode(true));
    });

    document.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("task")) {
        draggedTask = e.target;
        e.target.classList.add("dragged");
      }
    });

    document.addEventListener("dragend", (e) => {
      if (draggedTask) {
        draggedTask.classList.remove("dragged");
        draggedTask = null;
      }
    });

    taskContainers.forEach((container) => {
      container.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = this.getDragAfterElement(container, e.clientY);
        if (afterElement) {
          container.insertBefore(draggedTask, afterElement);
        } else {
          container.appendChild(draggedTask);
        }
      });

      container.addEventListener("drop", (e) => {
        e.preventDefault();
      });
    });
  }

  getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".task:not(.dragged)"),
    ];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        return offset < 0 && offset > closest.offset
          ? { offset, element: child }
          : closest;
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element;
  }
}
