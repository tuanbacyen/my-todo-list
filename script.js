document.addEventListener("DOMContentLoaded", function () {
  // Các phần tử DOM
  const todoForm = document.getElementById("todo-form");
  const todoNameInput = document.getElementById("todo-name");
  const priorityValue = document.getElementById("priority-value");
  const todosList = document.getElementById("todos-list");
  const exportDataBtn = document.getElementById("export-data");
  const currentDateElement = document.getElementById("current-date");
  const prevDateBtn = document.getElementById("prev-date");
  const nextDateBtn = document.getElementById("next-date");
  const stars = document.querySelectorAll(".stars i");
  const commitGithubBtn = document.getElementById("commit-github");
  const commitModal = document.getElementById("commit-modal");
  const closeModalBtn = document.querySelector(".close");
  const confirmCommitBtn = document.getElementById("confirm-commit");
  const cancelCommitBtn = document.getElementById("cancel-commit");
  const commitMessageInput = document.getElementById("commit-message");
  const commitStatusElement = document.getElementById("commit-status");
  const recurringTasksList = document.getElementById("recurring-tasks-list");

  // Biến lưu trữ dữ liệu và ngày hiện tại
  let currentDate = new Date();
  let todosData = loadTodosData();
  let completionChart = null;
  let priorityChart = null;

  // GitHub token (mã hóa nhẹ để không hiển thị trực tiếp)
  const encodedToken =
    "Z2l0aHViX3BhdF8xMUFGUzM0RkEwQ3NlYXJvYTZYdmUzXzd1NXZrV1BhWDhteHFMZGFST292ZVFYbndtVVBCdFR1cnFCZFNJODd0MEJBTkNFR0JXNENwWTlwWkhv";

  // Hiển thị ngày hiện tại và danh sách công việc
  updateDateDisplay();
  renderTodos();
  updateStatistics();
  renderCharts();
  findRecurringTasks();

  // Xử lý sự kiện chọn độ ưu tiên (sao)
  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const value = parseInt(this.getAttribute("data-value"));
      priorityValue.value = value;

      // Cập nhật hiển thị sao
      stars.forEach((s) => {
        const starValue = parseInt(s.getAttribute("data-value"));
        if (starValue <= value) {
          s.className = "fas fa-star";
        } else {
          s.className = "far fa-star";
        }
      });
    });
  });

  // Xử lý sự kiện thêm công việc mới
  todoForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const todoName = todoNameInput.value.trim();
    const priority = parseInt(priorityValue.value);

    if (todoName) {
      addTodo(todoName, priority);
      todoNameInput.value = "";
      // Reset độ ưu tiên về 1
      priorityValue.value = 1;
      stars.forEach((s, index) => {
        s.className = index === 0 ? "fas fa-star" : "far fa-star";
      });
    }
  });

  // Xử lý sự kiện chuyển ngày
  prevDateBtn.addEventListener("click", function () {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    renderTodos();
  });

  nextDateBtn.addEventListener("click", function () {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    renderTodos();
  });

  // Xử lý sự kiện xuất dữ liệu
  exportDataBtn.addEventListener("click", function () {
    exportData();
  });

  // Xử lý sự kiện mở modal commit
  commitGithubBtn.addEventListener("click", function () {
    commitModal.style.display = "block";
  });

  // Xử lý sự kiện đóng modal
  closeModalBtn.addEventListener("click", function () {
    commitModal.style.display = "none";
  });

  cancelCommitBtn.addEventListener("click", function () {
    commitModal.style.display = "none";
  });

  // Xử lý sự kiện khi nhấn nút xác nhận commit
  confirmCommitBtn.addEventListener("click", function () {
    const commitMessage =
      commitMessageInput.value.trim() || "Cập nhật dữ liệu todo list";
    commitToGitHub(commitMessage);
  });

  // Đóng modal khi click bên ngoài
  window.addEventListener("click", function (event) {
    if (event.target === commitModal) {
      commitModal.style.display = "none";
    }
  });

  // Hàm thêm công việc mới
  function addTodo(name, priority) {
    const dateKey = getDateKey(currentDate);
    const monthKey = getMonthKey(currentDate);

    if (!todosData[monthKey]) {
      todosData[monthKey] = {};
    }

    if (!todosData[monthKey][dateKey]) {
      todosData[monthKey][dateKey] = [];
    }

    const newTodo = {
      id: Date.now(),
      name: name,
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    todosData[monthKey][dateKey].push(newTodo);
    saveTodosData();
    renderTodos();
    updateStatistics();
    renderCharts();
    findRecurringTasks();
  }

  // Hàm đánh dấu hoàn thành công việc
  function toggleTodoComplete(id) {
    const dateKey = getDateKey(currentDate);
    const monthKey = getMonthKey(currentDate);

    if (todosData[monthKey] && todosData[monthKey][dateKey]) {
      const todo = todosData[monthKey][dateKey].find((item) => item.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        saveTodosData();
        renderTodos();
        updateStatistics();
        renderCharts();
      }
    }
  }

  // Hàm xóa công việc
  function deleteTodo(id) {
    const dateKey = getDateKey(currentDate);
    const monthKey = getMonthKey(currentDate);

    if (todosData[monthKey] && todosData[monthKey][dateKey]) {
      todosData[monthKey][dateKey] = todosData[monthKey][dateKey].filter(
        (item) => item.id !== id
      );
      saveTodosData();
      renderTodos();
      updateStatistics();
      renderCharts();
      findRecurringTasks();
    }
  }

  // Hàm hiển thị danh sách công việc
  function renderTodos() {
    todosList.innerHTML = "";

    const dateKey = getDateKey(currentDate);
    const monthKey = getMonthKey(currentDate);

    if (
      todosData[monthKey] &&
      todosData[monthKey][dateKey] &&
      todosData[monthKey][dateKey].length > 0
    ) {
      // Sắp xếp theo độ ưu tiên từ cao đến thấp
      const sortedTodos = [...todosData[monthKey][dateKey]].sort(
        (a, b) => b.priority - a.priority
      );

      sortedTodos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = `todo-item ${todo.completed ? "completed" : ""}`;

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
        completeBtn.addEventListener("click", () =>
          toggleTodoComplete(todo.id)
        );

        // Nút xóa
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

        // Thêm các phần tử vào DOM
        todoActions.appendChild(completeBtn);
        todoActions.appendChild(deleteBtn);

        li.appendChild(priorityDiv);
        li.appendChild(todoText);
        li.appendChild(todoActions);

        todosList.appendChild(li);
      });
    } else {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Không có công việc nào cho ngày này.";
      emptyMessage.style.textAlign = "center";
      emptyMessage.style.color = "#7f8c8d";
      emptyMessage.style.padding = "20px";
      todosList.appendChild(emptyMessage);
    }
  }

  // Hàm cập nhật hiển thị ngày
  function updateDateDisplay() {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    currentDateElement.textContent = currentDate.toLocaleDateString(
      "vi-VN",
      options
    );
  }

  // Hàm lấy key ngày theo định dạng DD
  function getDateKey(date) {
    return date.getDate().toString().padStart(2, "0");
  }

  // Hàm lấy key tháng theo định dạng YYYY-MM
  function getMonthKey(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
  }

  // Hàm lưu dữ liệu vào localStorage
  function saveTodosData() {
    localStorage.setItem("todosData", JSON.stringify(todosData));
  }

  // Hàm tải dữ liệu từ localStorage
  function loadTodosData() {
    const data = localStorage.getItem("todosData");
    return data ? JSON.parse(data) : {};
  }

  // Hàm xuất dữ liệu
  function exportData() {
    const dataStr = JSON.stringify(todosData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "todos-data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }

  // Hàm cập nhật thống kê
  function updateStatistics() {
    // Lấy ngày hiện tại, hôm qua và 7 ngày trước
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Thống kê hôm nay
    updateDayStatistics(today, "today");

    // Thống kê hôm qua
    updateDayStatistics(yesterday, "yesterday");

    // Thống kê 7 ngày qua
    updateWeekStatistics();
  }

  // Hàm cập nhật thống kê cho một ngày cụ thể
  function updateDayStatistics(date, prefix) {
    const dateKey = getDateKey(date);
    const monthKey = getMonthKey(date);

    let completed = 0;
    let total = 0;
    let priorityCompleted = 0;
    let priorityIncomplete = 0;

    if (todosData[monthKey] && todosData[monthKey][dateKey]) {
      const todos = todosData[monthKey][dateKey];
      total = todos.length;

      todos.forEach((todo) => {
        if (todo.completed) {
          completed++;
          priorityCompleted += todo.priority;
        } else {
          priorityIncomplete += todo.priority;
        }
      });
    }

    // Cập nhật DOM
    document.getElementById(`${prefix}-completed`).textContent = completed;
    document.getElementById(`${prefix}-total`).textContent = total;
    document.getElementById(`${prefix}-priority-completed`).textContent =
      priorityCompleted;
    document.getElementById(`${prefix}-priority-incomplete`).textContent =
      priorityIncomplete;
  }

  // Hàm cập nhật thống kê cho 7 ngày qua
  function updateWeekStatistics() {
    let completed = 0;
    let total = 0;
    let priorityCompleted = 0;
    let priorityIncomplete = 0;

    // Lấy dữ liệu 7 ngày qua
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dateKey = getDateKey(date);
      const monthKey = getMonthKey(date);

      if (todosData[monthKey] && todosData[monthKey][dateKey]) {
        const todos = todosData[monthKey][dateKey];
        total += todos.length;

        todos.forEach((todo) => {
          if (todo.completed) {
            completed++;
            priorityCompleted += todo.priority;
          } else {
            priorityIncomplete += todo.priority;
          }
        });
      }
    }

    // Cập nhật DOM
    document.getElementById("week-completed").textContent = completed;
    document.getElementById("week-total").textContent = total;
    document.getElementById("week-priority-completed").textContent =
      priorityCompleted;
    document.getElementById("week-priority-incomplete").textContent =
      priorityIncomplete;
  }

  // Hàm tạo và cập nhật biểu đồ
  function renderCharts() {
    renderCompletionChart();
    renderPriorityChart();
  }

  // Hàm tạo biểu đồ tiến độ hoàn thành theo ngày
  function renderCompletionChart() {
    const ctx = document.getElementById("completion-chart").getContext("2d");

    // Lấy dữ liệu 7 ngày gần nhất
    const labels = [];
    const completedData = [];
    const incompleteData = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dateKey = getDateKey(date);
      const monthKey = getMonthKey(date);

      // Format ngày để hiển thị
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
      labels.push(formattedDate);

      let completed = 0;
      let incomplete = 0;

      if (todosData[monthKey] && todosData[monthKey][dateKey]) {
        const todos = todosData[monthKey][dateKey];

        todos.forEach((todo) => {
          if (todo.completed) {
            completed++;
          } else {
            incomplete++;
          }
        });
      }

      completedData.push(completed);
      incompleteData.push(incomplete);
    }

    // Hủy biểu đồ cũ nếu có
    if (completionChart) {
      completionChart.destroy();
    }

    // Tạo biểu đồ mới
    completionChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Hoàn thành",
            data: completedData,
            backgroundColor: "#2ecc71",
            borderColor: "#27ae60",
            borderWidth: 1,
          },
          {
            label: "Chưa hoàn thành",
            data: incompleteData,
            backgroundColor: "#e74c3c",
            borderColor: "#c0392b",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }

  // Hàm tạo biểu đồ phân bố độ ưu tiên
  function renderPriorityChart() {
    const ctx = document.getElementById("priority-chart").getContext("2d");

    // Lấy dữ liệu phân bố độ ưu tiên
    const priorityCounts = [0, 0, 0, 0, 0]; // Độ ưu tiên từ 1-5

    // Duyệt qua tất cả dữ liệu
    for (const monthKey in todosData) {
      for (const dateKey in todosData[monthKey]) {
        const todos = todosData[monthKey][dateKey];

        todos.forEach((todo) => {
          priorityCounts[todo.priority - 1]++;
        });
      }
    }

    // Hủy biểu đồ cũ nếu có
    if (priorityChart) {
      priorityChart.destroy();
    }

    // Tạo biểu đồ mới
    priorityChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["1 sao", "2 sao", "3 sao", "4 sao", "5 sao"],
        datasets: [
          {
            data: priorityCounts,
            backgroundColor: [
              "#f1c40f",
              "#e67e22",
              "#e74c3c",
              "#9b59b6",
              "#8e44ad",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  }

  // Hàm tìm công việc làm liên tục
  function findRecurringTasks() {
    // Tạo map để đếm tần suất xuất hiện của các công việc
    const taskFrequency = new Map();
    const taskDetails = new Map();

    // Duyệt qua tất cả dữ liệu
    for (const monthKey in todosData) {
      for (const dateKey in todosData[monthKey]) {
        const todos = todosData[monthKey][dateKey];

        todos.forEach((todo) => {
          const taskName = todo.name.toLowerCase();

          // Tăng tần suất
          if (taskFrequency.has(taskName)) {
            taskFrequency.set(taskName, taskFrequency.get(taskName) + 1);
          } else {
            taskFrequency.set(taskName, 1);
            taskDetails.set(taskName, {
              name: todo.name,
              priority: todo.priority,
            });
          }
        });
      }
    }

    // Lọc ra các công việc xuất hiện từ 3 lần trở lên
    const recurringTasks = [];
    taskFrequency.forEach((frequency, taskName) => {
      if (frequency >= 3) {
        recurringTasks.push({
          name: taskDetails.get(taskName).name,
          frequency: frequency,
          priority: taskDetails.get(taskName).priority,
        });
      }
    });

    // Sắp xếp theo tần suất giảm dần
    recurringTasks.sort((a, b) => b.frequency - a.frequency);

    // Hiển thị danh sách công việc liên tục
    renderRecurringTasks(recurringTasks);
  }

  // Hàm hiển thị danh sách công việc liên tục
  function renderRecurringTasks(tasks) {
    recurringTasksList.innerHTML = "";

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

        recurringTasksList.appendChild(taskItem);
      });
    } else {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Không tìm thấy công việc làm liên tục.";
      emptyMessage.style.textAlign = "center";
      emptyMessage.style.color = "#7f8c8d";
      emptyMessage.style.padding = "20px";
      recurringTasksList.appendChild(emptyMessage);
    }
  }

  // Hàm commit lên GitHub
  function commitToGitHub(commitMessage) {
    // Hiển thị trạng thái đang xử lý
    commitStatusElement.textContent = "Đang xử lý...";
    commitStatusElement.className = "";
    commitStatusElement.style.display = "block";

    // Lấy dữ liệu để commit
    const dataToCommit = JSON.stringify(todosData, null, 2);

    // Giải mã token
    const token = atob(encodedToken);

    // Thông tin repository
    const owner = "pat"; // Thay bằng username GitHub của bạn
    const repo = "my-todo-list"; // Tên repository
    const path = "todos-data.json"; // Đường dẫn file

    // Kiểm tra xem file đã tồn tại chưa
    fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        let sha = null;
        if (!data.message) {
          // File đã tồn tại
          sha = data.sha;
        }

        // Tạo hoặc cập nhật file
        return fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: "PUT",
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: commitMessage,
              content: btoa(unescape(encodeURIComponent(dataToCommit))),
              sha: sha,
            }),
          }
        );
      })
      .then((response) => {
        if (response.ok) {
          commitStatusElement.textContent = "Commit thành công!";
          commitStatusElement.className = "success";

          // Đóng modal sau 2 giây
          setTimeout(() => {
            commitModal.style.display = "none";
            commitStatusElement.style.display = "none";
          }, 2000);
        } else {
          throw new Error("Lỗi khi commit");
        }
      })
      .catch((error) => {
        console.error("Lỗi:", error);
        commitStatusElement.textContent = "Lỗi khi commit. Vui lòng thử lại.";
        commitStatusElement.className = "error";
      });
  }
});
