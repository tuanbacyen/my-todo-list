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
        data = JSON.parse(savedData);
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu từ localStorage:", error);
        data = {};
      }
    }
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
