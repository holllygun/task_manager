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
    console.log('added')
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
        },
        (taskId, taskContent) => {
          this.board.addTaskToTable(id, { id: taskId, content: taskContent });
          this.taskFilter.applyFilter(
            this.taskFilter.filterInput.value.toLowerCase(),
          );
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
}
