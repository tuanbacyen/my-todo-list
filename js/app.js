/**
 * Module chính của ứng dụng
 */

const AppModule = (function () {
  // Biến lưu trữ trạng thái ứng dụng
  let currentDate = new Date();
  let todoData = {};
  let isInitialized = false;

  // Các phần tử DOM
  const elements = {
    githubConfigForm: document.getElementById("github-config-form"),
    tokenInput: document.getElementById("github-token"),
    usernameInput: document.getElementById("github-username"),
    repoInput: document.getElementById("github-repo"),
    saveConfigBtn: document.getElementById("save-github-config"),
    commitBtn: document.getElementById("commit-btn"),
    configStatus: document.getElementById("config-status"),
    todosList: document.getElementById("todos-list"),
  };

  // Hàm khởi tạo ứng dụng
  async function init() {
    if (isInitialized) return;

    try {
      // Tải dữ liệu
      await loadData();

      // Cập nhật UI
      UIModule.updateDateDisplay(currentDate);
      updateTodoList();
      updateStatistics();

      // Thiết lập sự kiện
      setupEventListeners();

      // Thiết lập xử lý resize cho biểu đồ
      ChartModule.setupResizeHandler(todoData);

      // Cập nhật trạng thái GitHub
      updateGitHubStatus();

      isInitialized = true;
    } catch (error) {
      console.error("Error initializing app:", error);
      UIModule.showStatusMessage(
        "Error initializing app: " + error.message,
        "error"
      );
    }
  }

  // Hàm tải dữ liệu
  async function loadData() {
    try {
      // Lấy key của tháng hiện tại
      const monthKey = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;

      // Tải dữ liệu từ GitHub nếu đã cấu hình
      if (window.GitHubModule && window.GitHubModule.isConfigured()) {
        try {
          const data = await window.GitHubModule.loadDataFromGitHub(monthKey);
          if (data && Object.keys(data).length > 0) {
            DataModule.setMonthData(monthKey, data);
          }
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu từ GitHub:", error);
          UIModule.showStatusMessage(
            "Không thể tải dữ liệu từ GitHub. Sử dụng dữ liệu cục bộ.",
            "error"
          );
        }
      }

      // Hiển thị danh sách công việc
      renderTodos();

      // Cập nhật thống kê
      updateStatistics();

      // Hiển thị biểu đồ
      if (window.ChartModule) {
        window.ChartModule.renderCharts(DataModule.getAllData());
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      UIModule.showStatusMessage("Đã xảy ra lỗi khi tải dữ liệu.", "error");
    }
  }

  // Hàm cập nhật danh sách công việc
  function updateTodoList() {
    const dateKey = DataModule.getDateKey(currentDate);
    const monthKey = DataModule.getMonthKey(currentDate);

    // Đảm bảo cấu trúc dữ liệu tồn tại
    if (!todoData[monthKey]) {
      todoData[monthKey] = {};
    }

    if (!todoData[monthKey][dateKey]) {
      todoData[monthKey][dateKey] = [];
    }

    // Lấy danh sách công việc cho ngày hiện tại
    const todos = todoData[monthKey][dateKey];

    // Cập nhật UI
    UIModule.renderTodos(todos);

    // Thiết lập sự kiện cho các mục todo
    setupTodoItemEvents();
  }

  // Hàm thiết lập sự kiện cho các mục todo
  function setupTodoItemEvents() {
    // Sự kiện nút hoàn thành
    document.querySelectorAll(".complete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const todoItem = this.closest(".todo-item");
        const todoId = parseInt(todoItem.dataset.id);
        toggleTodoComplete(todoId);
      });
    });

    // Sự kiện nút xóa
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const todoItem = this.closest(".todo-item");
        const todoId = parseInt(todoItem.dataset.id);
        deleteTodo(todoId);
      });
    });
  }

  // Hàm cập nhật thống kê
  function updateStatistics() {
    // Tính toán thống kê
    const stats = StatsModule.updateAllStats(todoData);

    // Cập nhật UI
    UIModule.updateStatistics(
      stats.todayStats,
      stats.yesterdayStats,
      stats.weekStats
    );

    // Cập nhật biểu đồ
    ChartModule.renderCharts(todoData);
  }

  // Hàm thiết lập các sự kiện
  function setupEventListeners() {
    // Sự kiện thêm công việc mới
    document
      .getElementById("todo-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();

        const todoInput = document.getElementById("todo-input");
        const priorityInput = document.getElementById("priority-input");

        const todoName = todoInput.value.trim();
        const priority = parseInt(priorityInput.value);

        if (todoName) {
          addTodo(todoName, priority);
          UIModule.resetTodoForm();
        }
      });

    // Sự kiện chuyển ngày
    document.getElementById("prev-day").addEventListener("click", function () {
      changeDate(-1);
    });

    document.getElementById("next-day").addEventListener("click", function () {
      changeDate(1);
    });

    document.getElementById("today-btn").addEventListener("click", function () {
      currentDate = new Date();
      UIModule.updateDateDisplay(currentDate);
      updateTodoList();
      updateStatistics();
    });

    // Thiết lập sự kiện cho các ngôi sao
    UIModule.setupStarsEvents();

    // Sự kiện lưu cấu hình GitHub
    if (elements.githubConfigForm) {
      elements.githubConfigForm.addEventListener("submit", function (e) {
        e.preventDefault();
        saveGitHubConfig();
      });
    }

    // Sự kiện commit lên GitHub
    if (elements.commitBtn) {
      elements.commitBtn.addEventListener("click", commitToGitHub);
    }
  }

  // Hàm thêm công việc mới
  function addTodo(name, priority) {
    DataModule.addTodo(currentDate, name, priority);
    updateTodoList();
    updateStatistics();
    DataModule.saveData();
  }

  // Hàm xóa công việc
  function deleteTodo(id) {
    DataModule.deleteTodo(currentDate, id);
    updateTodoList();
    updateStatistics();
    DataModule.saveData();
  }

  // Hàm đánh dấu hoàn thành công việc
  function toggleTodoComplete(id) {
    DataModule.toggleTodoComplete(currentDate, id);
    updateTodoList();
    updateStatistics();
    DataModule.saveData();
  }

  // Hàm thay đổi ngày
  function changeDate(offset) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    currentDate = newDate;

    UIModule.updateDateDisplay(currentDate);
    updateTodoList();
    updateStatistics();
  }

  // Hàm lưu cấu hình GitHub
  function saveGitHubConfig() {
    const token = elements.tokenInput.value.trim();
    const username = elements.usernameInput.value.trim();
    const repo = elements.repoInput.value.trim();

    if (token && username && repo) {
      const configured = GitHubModule.saveConfig(token, username, repo);
      updateGitHubStatus();

      if (configured) {
        UIModule.showStatusMessage(
          "GitHub configuration saved successfully",
          "success"
        );
      } else {
        UIModule.showStatusMessage(
          "Failed to save GitHub configuration",
          "error"
        );
      }
    } else {
      UIModule.showStatusMessage(
        "Please fill in all GitHub configuration fields",
        "error"
      );
    }
  }

  // Hàm cập nhật trạng thái GitHub
  function updateGitHubStatus() {
    if (elements.configStatus) {
      const isConfigured = GitHubModule.isConfigured();
      elements.configStatus.textContent = isConfigured
        ? "GitHub is configured"
        : "GitHub is not configured";
      elements.configStatus.className = isConfigured
        ? "status-success"
        : "status-error";

      if (elements.commitBtn) {
        elements.commitBtn.disabled = !isConfigured;
      }
    }
  }

  // Hàm commit lên GitHub
  async function commitToGitHub() {
    if (!GitHubModule.isConfigured()) {
      UIModule.showStatusMessage("GitHub is not configured", "error");
      return;
    }

    try {
      UIModule.showStatusMessage("Committing to GitHub...", "loading");

      // Lưu dữ liệu trước khi commit
      const saveResult = await DataModule.saveData();

      if (!saveResult.success) {
        throw new Error(saveResult.message || "Failed to save data");
      }

      // Thực hiện commit
      const result = await GitHubModule.saveDataToGitHub(todoData);

      UIModule.showStatusMessage(
        result.message,
        result.success ? "success" : "error"
      );
    } catch (error) {
      console.error("Error committing to GitHub:", error);
      UIModule.showStatusMessage(
        "Error committing to GitHub: " + error.message,
        "error"
      );
    }
  }

  // Trả về các phương thức public
  return {
    init,
    addTodo,
    deleteTodo,
    toggleTodoComplete,
    changeDate,
    commitToGitHub,
  };
})();

// Khởi tạo ứng dụng khi trang đã tải xong
document.addEventListener("DOMContentLoaded", function () {
  AppModule.init();
});
