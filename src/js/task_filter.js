export default class TaskFilter {
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
    this.filterInput.addEventListener("keydown", (e) => {
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
    containers.forEach((container) => {
      const allTasks = container.querySelector(".all_tasks_wrapper");
      if (!allTasks) {
        console.error("All tasks wrapper not found!");
        return;
      }

      const tasks = allTasks.querySelectorAll(".task");
      let found = false;

      tasks.forEach((task) => {
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
