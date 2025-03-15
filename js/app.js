/**
 * Module chính của ứng dụng
 */

const AppModule = (function () {
  // Biến lưu trữ trạng thái ứng dụng
  let currentDate = new Date();
  let isInitialized = false;

  // Các phần tử DOM
  const elements = {
    todoForm: document.getElementById("todo-form"),
    todoInput: document.getElementById("todo-input"),
    priorityInput: document.getElementById("priority-input"),
    currentDateElement: document.getElementById("current-date"),
    prevDayButton: document.getElementById("prev-day"),
    nextDayButton: document.getElementById("next-day"),
    todayButton: document.getElementById("today-btn"),
    commitBtn: document.getElementById("commit-btn"),
    todosList: document.getElementById("todos-list"),
  };

  // Hàm khởi tạo ứng dụng
  async function init() {
    if (isInitialized) return;

    try {
      // Hiển thị ngày hiện tại
      updateDateDisplay();

      // Tải dữ liệu
      await loadData();

      // Thiết lập sự kiện
      setupEventListeners();

      // Thiết lập xử lý resize cho biểu đồ
      if (window.ChartModule) {
        window.ChartModule.setupResizeHandler(DataModule.getAllData());
      }

      // Thiết lập sự kiện cho form cấu hình GitHub
      if (window.GitHubModule) {
        window.GitHubModule.setupConfigEvents();
      }

      isInitialized = true;
    } catch (error) {
      console.error("Error initializing app:", error);
      UIModule.showStatusMessage(
        "Error initializing app: " + error.message,
        "error"
      );
    }
  }

  // Cập nhật hiển thị ngày
  function updateDateDisplay() {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    elements.currentDateElement.textContent = currentDate.toLocaleDateString(
      "vi-VN",
      options
    );
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
            // Thiết lập dữ liệu cho tháng hiện tại
            // DataModule.setMonthData sẽ tự động hợp nhất với dữ liệu chưa commit
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
      updateTodoList();

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

    // Lấy danh sách công việc cho ngày hiện tại
    const todos = DataModule.getTodos(monthKey, dateKey);

    // Cập nhật UI
    UIModule.renderTodos(todos);

    // Thiết lập sự kiện cho các mục todo
    setupTodoItemEvents();
  }

  // Hàm thiết lập sự kiện cho các mục todo
  function setupTodoItemEvents() {
    elements.todosList.addEventListener("click", function (e) {
      // Xử lý sự kiện hoàn thành công việc
      if (
        e.target.classList.contains("complete-btn") ||
        e.target.closest(".complete-btn")
      ) {
        const todoItem = e.target.closest(".todo-item");
        const todoId = todoItem.dataset.id;
        toggleTodoComplete(todoId);
      }

      // Xử lý sự kiện xóa công việc
      if (
        e.target.classList.contains("delete-btn") ||
        e.target.closest(".delete-btn")
      ) {
        const todoItem = e.target.closest(".todo-item");
        const todoId = todoItem.dataset.id;
        deleteTodo(todoId);
      }
    });
  }

  // Hàm cập nhật thống kê
  function updateStatistics() {
    // Tính toán thống kê
    const stats = StatsModule.updateAllStats(DataModule.getAllData());

    // Cập nhật UI
    UIModule.updateStatistics(
      stats.todayStats,
      stats.yesterdayStats,
      stats.weekStats
    );

    // Cập nhật danh sách công việc lặp lại
    UIModule.renderRecurringTasks(stats.recurringTasks);
  }

  // Hàm thiết lập các sự kiện
  function setupEventListeners() {
    // Sự kiện thêm công việc mới
    elements.todoForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const todoName = elements.todoInput.value.trim();
      const priority = parseInt(elements.priorityInput.value);

      if (todoName) {
        addTodo(todoName, priority);
        UIModule.resetTodoForm();
      }
    });

    // Sự kiện chuyển ngày
    elements.prevDayButton.addEventListener("click", function () {
      changeDate(-1);
    });

    elements.nextDayButton.addEventListener("click", function () {
      changeDate(1);
    });

    elements.todayButton.addEventListener("click", function () {
      currentDate = new Date();
      updateDateDisplay();
      updateTodoList();
      updateStatistics();
    });

    // Thiết lập sự kiện cho các ngôi sao
    UIModule.setupStarsEvents();

    // Sự kiện lưu lên GitHub
    if (elements.commitBtn) {
      elements.commitBtn.addEventListener("click", commitToGitHub);
    }
  }

  // Hàm thêm công việc mới
  function addTodo(name, priority) {
    // Tạo ID duy nhất
    const todoId = Date.now().toString();

    // Tạo đối tượng công việc mới
    const newTodo = {
      id: todoId,
      name: name,
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Thêm vào dữ liệu
    const dateKey = DataModule.getDateKey(currentDate);
    const monthKey = DataModule.getMonthKey(currentDate);

    DataModule.addTodo(monthKey, dateKey, newTodo);

    // Cập nhật giao diện
    updateTodoList();
    updateStatistics();

    // Hiển thị biểu đồ
    if (window.ChartModule) {
      window.ChartModule.renderCharts(DataModule.getAllData());
    }

    // Hiển thị thông báo
    UIModule.showStatusMessage("Đã thêm công việc mới!", "success");
  }

  // Hàm xóa công việc
  function deleteTodo(todoId) {
    const dateKey = DataModule.getDateKey(currentDate);
    const monthKey = DataModule.getMonthKey(currentDate);

    const success = DataModule.deleteTodo(monthKey, dateKey, todoId);

    if (success) {
      updateTodoList();
      updateStatistics();

      // Cập nhật biểu đồ
      if (window.ChartModule) {
        window.ChartModule.renderCharts(DataModule.getAllData());
      }

      UIModule.showStatusMessage("Đã xóa công việc!", "success");
    }
  }

  // Hàm đánh dấu hoàn thành công việc
  function toggleTodoComplete(todoId) {
    const dateKey = DataModule.getDateKey(currentDate);
    const monthKey = DataModule.getMonthKey(currentDate);

    const success = DataModule.toggleTodoComplete(monthKey, dateKey, todoId);

    if (success) {
      updateTodoList();
      updateStatistics();

      // Cập nhật biểu đồ
      if (window.ChartModule) {
        window.ChartModule.renderCharts(DataModule.getAllData());
      }

      UIModule.showStatusMessage(
        "Đã cập nhật trạng thái công việc!",
        "success"
      );
    }
  }

  // Hàm thay đổi ngày
  function changeDate(offset) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    currentDate = newDate;

    updateDateDisplay();
    updateTodoList();
    updateStatistics();
  }

  // Hàm commit lên GitHub
  async function commitToGitHub() {
    try {
      if (!window.GitHubModule || !window.GitHubModule.isConfigured()) {
        UIModule.showStatusMessage("GitHub chưa được cấu hình!", "error");
        return;
      }

      UIModule.showStatusMessage("Đang lưu dữ liệu lên GitHub...", "info");

      // Lấy tháng hiện tại
      const monthKey = DataModule.getMonthKey(currentDate);
      const monthData = DataModule.getMonthData(monthKey);

      // Lưu dữ liệu lên GitHub
      await window.GitHubModule.saveDataToGitHub(monthData);

      UIModule.showStatusMessage(
        "Đã lưu dữ liệu lên GitHub thành công!",
        "success"
      );
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu lên GitHub:", error);
      UIModule.showStatusMessage(
        `Lỗi khi lưu dữ liệu: ${error.message}`,
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
