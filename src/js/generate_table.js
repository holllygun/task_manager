import penImagePath from "../img/highlighter.png";
import Task from "./Task";

export default class Space {
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

    const penimg = document.createElement("img");
    penimg.src = penImagePath;
    penimg.alt = "pen";
    penimg.classList.add("pen");

    secondwrapper.append(allTasksHeader, penimg);
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

    newTask.addEventListener("keydown", (e) => {
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
