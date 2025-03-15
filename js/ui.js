/**
 * Module xử lý giao diện người dùng
 */

const UIModule = (function () {
  // Các phần tử DOM
  const elements = {
    todoForm: document.getElementById("todo-form"),
    todoNameInput: document.getElementById("todo-input"),
    priorityValue: document.getElementById("priority-input"),
    todosList: document.getElementById("todos-list"),
    currentDateElement: document.getElementById("current-date"),
    prevDateBtn: document.getElementById("prev-day"),
    nextDateBtn: document.getElementById("next-day"),
    todayBtn: document.getElementById("today-btn"),
    stars: document.querySelectorAll(".stars i"),
    commitBtn: document.getElementById("commit-btn"),
    statusMessage: document.getElementById("status-message"),
    recurringTasksList: document.getElementById("recurring-tasks-list"),

    // Các phần tử thống kê
    todayCompleted: document.getElementById("today-completed"),
    todayTotal: document.getElementById("today-total"),
    todayPriorityCompleted: document.getElementById("today-priority-completed"),
    todayPriorityIncomplete: document.getElementById(
      "today-priority-incomplete"
    ),

    yesterdayCompleted: document.getElementById("yesterday-completed"),
    yesterdayTotal: document.getElementById("yesterday-total"),
    yesterdayPriorityCompleted: document.getElementById(
      "yesterday-priority-completed"
    ),
    yesterdayPriorityIncomplete: document.getElementById(
      "yesterday-priority-incomplete"
    ),

    weekCompleted: document.getElementById("week-completed"),
    weekTotal: document.getElementById("week-total"),
    weekPriorityCompleted: document.getElementById("week-priority-completed"),
    weekPriorityIncomplete: document.getElementById("week-priority-incomplete"),
  };

  // Thiết lập sự kiện cho các ngôi sao
  function setupStarsEvents() {
    if (elements.stars && elements.stars.length > 0) {
      elements.stars.forEach((star) => {
        star.addEventListener("click", function () {
          const value = parseInt(this.getAttribute("data-value"));
          elements.priorityValue.value = value;
          updateStarsDisplay(value);
        });
      });
    }
  }

  // Hiển thị ngày hiện tại
  function updateDateDisplay(date) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    elements.currentDateElement.textContent = date.toLocaleDateString(
      "vi-VN",
      options
    );
  }

  // Hiển thị danh sách công việc
  function renderTodos(todos) {
    elements.todosList.innerHTML = "";

    if (todos.length > 0) {
      // Sắp xếp theo độ ưu tiên từ cao đến thấp
      const sortedTodos = [...todos].sort((a, b) => b.priority - a.priority);

      sortedTodos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = `todo-item ${todo.completed ? "completed" : ""}`;
        li.dataset.id = todo.id;

        // Tạo phần tử hiển thị độ ưu tiên (sao)
        const priorityDiv = document.createElement("div");
        priorityDiv.className = "priority";
        for (let i = 0; i < todo.priority; i++) {
          const star = document.createElement("i");
          star.className = "fas fa-star";
          priorityDiv.appendChild(star);
        }

        // Tạo phần tử hiển thị tên công việc
        const todoText = document.createElement("div");
        todoText.className = "todo-text";
        todoText.textContent = todo.name;

        // Tạo phần tử chứa các nút hành động
        const todoActions = document.createElement("div");
        todoActions.className = "todo-actions";

        // Nút đánh dấu hoàn thành
        const completeBtn = document.createElement("button");
        completeBtn.innerHTML = todo.completed
          ? '<i class="fas fa-check-circle"></i>'
          : '<i class="far fa-circle"></i>';
        completeBtn.className = "complete-btn";

        // Nút xóa
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.className = "delete-btn";

        // Thêm các phần tử vào DOM
        todoActions.appendChild(completeBtn);
        todoActions.appendChild(deleteBtn);

        li.appendChild(priorityDiv);
        li.appendChild(todoText);
        li.appendChild(todoActions);

        elements.todosList.appendChild(li);
      });
    } else {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Không có công việc nào cho ngày này.";
      emptyMessage.style.textAlign = "center";
      emptyMessage.style.color = "#7f8c8d";
      emptyMessage.style.padding = "20px";
      elements.todosList.appendChild(emptyMessage);
    }
  }

  // Cập nhật hiển thị sao khi chọn độ ưu tiên
  function updateStarsDisplay(value) {
    elements.stars.forEach((s) => {
      const starValue = parseInt(s.getAttribute("data-value"));
      if (starValue <= value) {
        s.className = "fas fa-star";
      } else {
        s.className = "far fa-star";
      }
    });
  }

  // Reset form thêm công việc
  function resetTodoForm() {
    const todoInput = document.getElementById("todo-input");
    const priorityInput = document.getElementById("priority-input");
    const stars = document.querySelectorAll(".stars i");

    // Xóa nội dung input
    if (todoInput) todoInput.value = "";

    // Reset độ ưu tiên về 1
    if (priorityInput) priorityInput.value = "1";

    // Reset hiển thị sao
    if (stars.length > 0) {
      stars.forEach((star, index) => {
        if (index === 0) {
          star.classList.remove("far");
          star.classList.add("fas");
        } else {
          star.classList.remove("fas");
          star.classList.add("far");
        }
      });
    }

    // Focus vào input để người dùng có thể nhập tiếp
    if (todoInput) todoInput.focus();
  }

  // Hiển thị thông báo trạng thái
  function showStatusMessage(message, type) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type}`;

    // Tự động ẩn thông báo sau 3 giây nếu là success
    if (type === "success") {
      setTimeout(() => {
        elements.statusMessage.className = "status-message";
      }, 3000);
    }
  }

  // Cập nhật thống kê
  function updateStatistics(todayStats, yesterdayStats, weekStats) {
    // Cập nhật thống kê hôm nay
    elements.todayCompleted.textContent = todayStats.completed;
    elements.todayTotal.textContent = todayStats.total;
    elements.todayPriorityCompleted.textContent = todayStats.priorityCompleted;
    elements.todayPriorityIncomplete.textContent =
      todayStats.priorityIncomplete;

    // Cập nhật thống kê hôm qua
    elements.yesterdayCompleted.textContent = yesterdayStats.completed;
    elements.yesterdayTotal.textContent = yesterdayStats.total;
    elements.yesterdayPriorityCompleted.textContent =
      yesterdayStats.priorityCompleted;
    elements.yesterdayPriorityIncomplete.textContent =
      yesterdayStats.priorityIncomplete;

    // Cập nhật thống kê 7 ngày qua
    elements.weekCompleted.textContent = weekStats.completed;
    elements.weekTotal.textContent = weekStats.total;
    elements.weekPriorityCompleted.textContent = weekStats.priorityCompleted;
    elements.weekPriorityIncomplete.textContent = weekStats.priorityIncomplete;
  }

  // Hiển thị danh sách công việc làm liên tục
  function renderRecurringTasks(tasks) {
    elements.recurringTasksList.innerHTML = "";

    if (tasks.length > 0) {
      tasks.forEach((task) => {
        const taskItem = document.createElement("div");
        taskItem.className = "recurring-task-item";

        // Tên công việc
        const taskName = document.createElement("div");
        taskName.className = "task-name";
        taskName.textContent = task.name;

        // Tần suất
        const taskFrequency = document.createElement("div");
        taskFrequency.className = "task-frequency";
        taskFrequency.textContent = `${task.frequency} lần`;

        // Độ ưu tiên
        const taskPriority = document.createElement("div");
        taskPriority.className = "task-priority";
        for (let i = 0; i < task.priority; i++) {
          const star = document.createElement("i");
          star.className = "fas fa-star";
          taskPriority.appendChild(star);
        }

        // Thêm vào DOM
        taskItem.appendChild(taskPriority);
        taskItem.appendChild(taskName);
        taskItem.appendChild(taskFrequency);

        elements.recurringTasksList.appendChild(taskItem);
      });
    } else {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Không tìm thấy công việc làm liên tục.";
      emptyMessage.style.textAlign = "center";
      emptyMessage.style.color = "#7f8c8d";
      emptyMessage.style.padding = "20px";
      elements.recurringTasksList.appendChild(emptyMessage);
    }
  }

  // Khởi tạo module
  function init() {
    // Thiết lập sự kiện cho các ngôi sao
    setupStarsEvents();
  }

  // Trả về các phương thức public
  return {
    elements,
    init,
    updateDateDisplay,
    renderTodos,
    updateStarsDisplay,
    resetTodoForm,
    showStatusMessage,
    updateStatistics,
    renderRecurringTasks,
    setupStarsEvents,
  };
})();

// Khởi tạo module khi trang đã tải xong
document.addEventListener("DOMContentLoaded", function () {
  UIModule.init();
});

// Export module
window.UIModule = UIModule;
