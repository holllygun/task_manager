import Task from "./Task";

export default class Board {
  constructor() {
    this.tasks = {};
    this.counter = 0;
    this.space = null;
    this.taskFilter = null;
  }

  initialize(space, taskFilter) {
    this.space = space;
    this.taskFilter = taskFilter;

    this.taskFilter.applyFilter(
      this.taskFilter.filterInput.value.toLowerCase(),
    );
  }

  saveToLocalStorage() {
    try {
      const data = {
        counter: this.counter,
        tasks: this.tasks,
      };
      localStorage.setItem("TaskBoard", JSON.stringify(data));
      console.log("setted", data);
    } catch (error) {
      console.error("failed to save tasks in local storage", error);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem("TaskBoard");
      if (data) {
        const parsedData = JSON.parse(data);
        this.counter = parsedData.counter || 0;
        this.tasks = parsedData.tasks || {};
        console.log("loaded", parsedData.tasks);

        for (const id in this.tasks) {
          if (Object.prototype.hasOwnProperty.call(this.tasks, id)) {
            this.space.generateTable(
              id,
              (removeId) => {
                this.removeTable(removeId);
                this.taskFilter.applyFilter(
                  this.taskFilter.filterInput.value.toLowerCase(),
                );
              },
              (taskId, taskContent) => {
                this.addTaskToTable(id, { id: taskId, content: taskContent });
                this.taskFilter.applyFilter(
                  this.taskFilter.filterInput.value.toLowerCase(),
                );
              },
            );

            this.tasks[id].forEach((task) => {
              const taskElement = new Task(
                task.id,
                task.content,
                id,
                this,
                task.isPinned,
                task.completed,
              ).render();
              const taskContainer = document.querySelector(
                `.task_container[data-id="${id}"] .all_tasks_wrapper`,
              );
              taskContainer.appendChild(taskElement);

              if (task.completed) {
                taskElement.querySelector(".task_checkbox").checked = true;
                taskElement
                  .querySelector(".task_input")
                  .classList.add("line-through");
              }

              if (task.isPinned) {
                taskElement
                  .querySelector(".pinned_task_button")
                  .classList.add("active");
              }

              const taskInput = taskElement.querySelector(".task_input");
              taskInput.addEventListener("input", (event) => {
                task.content = event.target.value;
                this.saveToLocalStorage();
              });

              const checkbox = taskElement.querySelector(".task_checkbox");
              checkbox.addEventListener("change", (event) => {
                task.completed = event.target.checked;
                if (task.completed) {
                  taskElement
                    .querySelector(".task_input")
                    .classList.add("line-through");
                } else {
                  taskElement
                    .querySelector(".task_input")
                    .classList.remove("line-through");
                }
                this.saveToLocalStorage();
              });

              const pinButton = taskElement.querySelector(
                ".pinned_task_button",
              );
              pinButton.addEventListener("click", () => {
                task.isPinned = !task.isPinned;
                pinButton.classList.toggle("active");
                this.saveToLocalStorage();
              });
            });
          }
        }
        document.dispatchEvent(new Event("boardInitialized"));
      }
    } catch (error) {
      console.error("failed to load tasks from local storage", error);
    }
  }

  addTable() {
    const id = ++this.counter;
    this.tasks[id] = [];
    this.saveToLocalStorage();
    this.taskFilter.applyFilter(
      this.taskFilter.filterInput.value.toLowerCase(),
    );
    return id;
  }

  removeTable(id) {
    console.log("remove");
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

    const extendedTask = { ...task, completed: false, isPinned: false };
    this.tasks[tableId].push(extendedTask);
    this.saveToLocalStorage();

    this.taskFilter.applyFilter(
      this.taskFilter.filterInput.value.toLowerCase(),
    );
  }

  removeTaskFromTable(tableId, taskId) {
    if (!this.tasks[tableId]) {
      console.error(`Table with ID ${tableId} does not exist.`);
      return;
    }
    this.tasks[tableId] = this.tasks[tableId].filter(
      (task) => task.id !== taskId,
    );
    this.saveToLocalStorage();

    this.taskFilter.applyFilter(
      this.taskFilter.filterInput.value.toLowerCase(),
    );
  }
}
