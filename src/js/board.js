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

  moveTask(sourceTaskId, targetTaskId) {
    console.log(
      `Attempting to move task from ${sourceTaskId} to ${targetTaskId}`,
    );

    const sourceTask = this.findTaskById(sourceTaskId);
    const targetTask = this.findTaskById(targetTaskId);

    if (sourceTask && targetTask) {
      console.log(`Found source task:`, sourceTask);
      console.log(`Found target task:`, targetTask);

      const sourceContainer = document.querySelector(
        `.task_container[data-board-id="${sourceTask.boardId}"]`,
      );
      const targetContainer = document.querySelector(
        `.task_container[data-board-id="${targetTask.boardId}"]`,
      );

      if (sourceContainer && targetContainer) {
        console.log(`Found source container:`, sourceContainer);
        console.log(`Found target container:`, targetContainer);

        const taskElement = sourceContainer.querySelector(
          `.task[data-id="${sourceTaskId}"]`,
        );
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
      const task = this.tasks[boardId].find((t) => t.id === taskId);
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
      const taskIndex = this.tasks[boardId].findIndex((t) => t.id === taskId);
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
        tasks: this.tasks,
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
              const taskInstance = new Task(
                task.id,
                task.content,
                id,
                this,
                task.isPinned,
                task.completed,
              );

              const taskElement = taskInstance.render();
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
                const board = document.querySelector(
                  `.task_container[data-id="${id}"]`,
                );
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
    this.taskFilter.applyFilter(
      this.taskFilter.filterInput.value.toLowerCase(),
    );
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

  getTaskElement(taskId) {
    for (const boardId in this.tasks) {
      const boardContainer = document.querySelector(
        `.task_container[data-id="${boardId}"]`,
      );
      if (boardContainer) {
        const taskElement = boardContainer.querySelector(
          `.task[data-id="${taskId}"]`,
        );
        if (taskElement) {
          return taskElement;
        }
      }
    }
    return null;
  }

  renderTask(taskId) {
    for (const boardId in this.tasks) {
      const boardContainer = document.querySelector(
        `.task_container[data-id="${boardId}"]`,
      );
      if (boardContainer) {
        const task = this.tasks[boardId].find((t) => t.id === taskId);
        if (task) {
          const taskInstance = new Task(
            task.id,
            task.content,
            boardId,
            this,
            task.isPinned,
            task.completed,
          );
          const taskElement = taskInstance.render();
          const taskContainer =
            boardContainer.querySelector(".all_tasks_wrapper");
          taskContainer.appendChild(taskElement);
          break;
        }
      }
    }
  }
}
