import pinImage from "../img/pin.png";

export default class Task {
  constructor(
    id,
    content,
    boardId,
    board,
    isPinned = false,
    completed = false,
  ) {
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

  syncTaskState() {
    const boardData = JSON.parse(localStorage.getItem("TaskBoard"));
    const table = boardData.tasks[this.boardId];
    const taskIndex = table.findIndex((task) => task.id === this.id);
    if (taskIndex !== -1) {
      boardData.tasks[this.boardId][taskIndex] = {
        ...boardData.tasks[this.boardId][taskIndex],
        completed: this.completed,
        isPinned: this.isPinned,
        content: this.content,
      };
      localStorage.setItem("TaskBoard", JSON.stringify(boardData));
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

    taskInput.addEventListener("input", (event) => {
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
      const board = document.querySelector(
        `.task_container[data-id="${this.boardId}"]`,
      );
      const pinnedTasksContainer = board.querySelector(
        ".pinned_wrapper .pinned_tasks",
      );
      const emptyMessage = board.querySelector(
        ".pinned_wrapper .no_pinned_tasks",
      );

      this.board.removeTaskFromTable(this.boardId, this.id);

      task.remove();

      this.updatePinnedVisibility(pinnedTasksContainer, emptyMessage);
    });
    const pinnedBtn = this.createButton("📌", "pinned_task_button", () =>
      this.addPin(this.content),
    );

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
    pinImg.src = pinImage;
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
    const pinnedHeaderWrapper = emptyMessage
      .closest(".pinned_wrapper")
      .querySelector(".pinned_header_wrapper");
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

    const board = document.querySelector(
      `.task_container[data-id="${this.boardId}"]`,
    );
    if (!board) return;

    const pinnedWrapper = board.querySelector(".pinned_wrapper");
    if (!pinnedWrapper) {
      this.createPinnedSection(board);
    }

    const pinnedTasksContainer = board.querySelector(
      ".pinned_wrapper .pinned_tasks",
    );
    const allTasksContainer = board.querySelector(".all_tasks_wrapper");
    const emptyMessage = board.querySelector(
      ".pinned_wrapper .no_pinned_tasks",
    );

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
