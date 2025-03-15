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

  // Biến lưu trữ dữ liệu và ngày hiện tại
  let currentDate = new Date();
  let todosData = loadTodosData();

  // Hiển thị ngày hiện tại và danh sách công việc
  updateDateDisplay();
  renderTodos();

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
});
