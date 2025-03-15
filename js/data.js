/**
 * Module xử lý dữ liệu - đọc/ghi dữ liệu từ file JSON
 */

const DataModule = (function () {
  // Dữ liệu todo theo tháng và ngày
  let data = {};

  // Khởi tạo dữ liệu
  function init() {
    // Tải dữ liệu từ localStorage nếu có
    const savedData = localStorage.getItem("todoData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);

        // Chuẩn hóa dữ liệu để đảm bảo đúng định dạng
        data = normalizeData(parsedData);
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu từ localStorage:", error);
        data = {};
      }
    }
  }

  // Chuẩn hóa dữ liệu để đảm bảo đúng định dạng YYYY-MM/DD
  function normalizeData(inputData) {
    const normalizedData = {};

    // Duyệt qua tất cả các key trong dữ liệu
    for (const key in inputData) {
      // Nếu key có định dạng YYYY-MM, giữ nguyên
      if (/^\d{4}-\d{2}$/.test(key)) {
        normalizedData[key] = inputData[key];
      }
      // Nếu key là một ngày, chuyển đổi sang định dạng YYYY-MM/DD
      else if (key.includes("GMT")) {
        try {
          const date = new Date(key);
          const monthKey = getMonthKey(date);
          const dateKey = getDateKey(date);

          // Tạo cấu trúc nếu chưa tồn tại
          if (!normalizedData[monthKey]) {
            normalizedData[monthKey] = {};
          }

          // Lấy dữ liệu từ key cũ
          const todoData = inputData[key];

          // Chuyển đổi dữ liệu sang định dạng mới nếu cần
          if (Array.isArray(todoData)) {
            // Nếu đã là mảng, giữ nguyên
            if (!normalizedData[monthKey][dateKey]) {
              normalizedData[monthKey][dateKey] = [];
            }
            normalizedData[monthKey][dateKey] =
              normalizedData[monthKey][dateKey].concat(todoData);
          } else {
            // Nếu là object cũ, chuyển đổi sang định dạng mới
            for (const todoName in todoData) {
              if (!normalizedData[monthKey][dateKey]) {
                normalizedData[monthKey][dateKey] = [];
              }

              // Tạo todo mới với định dạng chuẩn
              const newTodo = {
                id: Date.now() + "-" + todoName,
                name: todoName,
                priority: Array.isArray(todoData[todoName])
                  ? todoData[todoName].length
                  : todoData[todoName] || 1,
                completed: false,
                createdAt: new Date().toISOString(),
              };

              normalizedData[monthKey][dateKey].push(newTodo);
            }
          }
        } catch (error) {
          console.error("Lỗi khi chuyển đổi dữ liệu:", error);
        }
      } else {
        // Các key khác giữ nguyên
        normalizedData[key] = inputData[key];
      }
    }

    return normalizedData;
  }

  // Lưu dữ liệu vào localStorage
  function saveData() {
    try {
      localStorage.setItem("todoData", JSON.stringify(data));
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu vào localStorage:", error);
    }
  }

  // Lấy tất cả dữ liệu
  function getAllData() {
    return data;
  }

  // Lấy dữ liệu của một tháng
  function getMonthData(monthKey) {
    return data[monthKey] || {};
  }

  // Thiết lập dữ liệu cho một tháng
  function setMonthData(monthKey, monthData) {
    data[monthKey] = monthData;
    saveData();
  }

  // Lấy danh sách công việc của một ngày
  function getTodos(monthKey, dateKey) {
    if (!data[monthKey]) {
      data[monthKey] = {};
    }

    if (!data[monthKey][dateKey]) {
      data[monthKey][dateKey] = [];
    }

    return data[monthKey][dateKey];
  }

  // Thêm công việc mới
  function addTodo(monthKey, dateKey, todo) {
    if (!data[monthKey]) {
      data[monthKey] = {};
    }

    if (!data[monthKey][dateKey]) {
      data[monthKey][dateKey] = [];
    }

    data[monthKey][dateKey].push(todo);
    saveData();

    return true;
  }

  // Cập nhật trạng thái hoàn thành của công việc
  function toggleTodoComplete(monthKey, dateKey, todoId) {
    if (!data[monthKey] || !data[monthKey][dateKey]) {
      return false;
    }

    const todoIndex = data[monthKey][dateKey].findIndex(
      (todo) => todo.id === todoId
    );

    if (todoIndex === -1) {
      return false;
    }

    data[monthKey][dateKey][todoIndex].completed =
      !data[monthKey][dateKey][todoIndex].completed;
    saveData();

    return true;
  }

  // Xóa công việc
  function deleteTodo(monthKey, dateKey, todoId) {
    if (!data[monthKey] || !data[monthKey][dateKey]) {
      return false;
    }

    const initialLength = data[monthKey][dateKey].length;
    data[monthKey][dateKey] = data[monthKey][dateKey].filter(
      (todo) => todo.id !== todoId
    );

    if (data[monthKey][dateKey].length === initialLength) {
      return false;
    }

    saveData();
    return true;
  }

  // Hàm lấy key ngày theo định dạng DD
  function getDateKey(date) {
    return String(date.getDate()).padStart(2, "0");
  }

  // Hàm lấy key tháng theo định dạng YYYY-MM
  function getMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }

  // Khởi tạo dữ liệu khi module được tạo
  init();

  // Trả về các phương thức công khai
  return {
    getAllData,
    getMonthData,
    setMonthData,
    getTodos,
    addTodo,
    toggleTodoComplete,
    deleteTodo,
    getMonthKey,
    getDateKey,
    saveData,
  };
})();

// Xuất module ra window
window.DataModule = DataModule;
