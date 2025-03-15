/**
 * Module xử lý dữ liệu - đọc/ghi dữ liệu từ file JSON
 */

const DataModule = (function () {
  // Dữ liệu todo theo tháng và ngày
  let data = {}; // Dữ liệu đã commit từ GitHub
  let uncommittedData = {}; // Dữ liệu chưa commit

  // Khởi tạo dữ liệu
  function init() {
    // Tải dữ liệu từ localStorage nếu có
    loadFromLocalStorage();
  }

  // Tải dữ liệu từ localStorage
  function loadFromLocalStorage() {
    // Tải dữ liệu đã commit
    const savedData = localStorage.getItem("todoData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        data = normalizeData(parsedData);
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu từ localStorage:", error);
        data = {};
      }
    }

    // Tải dữ liệu chưa commit
    const uncommittedSavedData = localStorage.getItem("todoDataUncommitted");
    if (uncommittedSavedData) {
      try {
        const parsedData = JSON.parse(uncommittedSavedData);
        uncommittedData = normalizeData(parsedData);
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu chưa commit:", error);
        uncommittedData = {};
      }
    }

    // Hợp nhất dữ liệu
    mergeData();
  }

  // Hợp nhất dữ liệu đã commit và chưa commit
  function mergeData() {
    // Tạo bản sao sâu của dữ liệu đã commit
    const mergedData = JSON.parse(JSON.stringify(data));

    // Hợp nhất với dữ liệu chưa commit
    for (const monthKey in uncommittedData) {
      if (!mergedData[monthKey]) {
        mergedData[monthKey] = {};
      }

      for (const dateKey in uncommittedData[monthKey]) {
        if (!mergedData[monthKey][dateKey]) {
          mergedData[monthKey][dateKey] = [];
        }

        // Tạo Set các ID đã tồn tại để loại bỏ trùng lặp
        const existingIds = new Set(
          mergedData[monthKey][dateKey].map((todo) => todo.id)
        );

        // Lọc ra các todo chưa commit mà chưa tồn tại trong dữ liệu đã commit
        const uniqueUncommittedTodos = uncommittedData[monthKey][
          dateKey
        ].filter((todo) => !existingIds.has(todo.id));

        // Thêm các todo chưa commit vào dữ liệu đã hợp nhất
        mergedData[monthKey][dateKey] = [
          ...mergedData[monthKey][dateKey],
          ...uniqueUncommittedTodos,
        ];
      }
    }

    // Cập nhật dữ liệu
    data = mergedData;
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

  // Lưu dữ liệu chưa commit vào localStorage
  function saveUncommittedData() {
    try {
      localStorage.setItem(
        "todoDataUncommitted",
        JSON.stringify(uncommittedData)
      );
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu chưa commit:", error);
    }
  }

  // Lấy tất cả dữ liệu (đã hợp nhất)
  function getAllData() {
    return data;
  }

  // Lấy dữ liệu của một tháng
  function getMonthData(monthKey) {
    return data[monthKey] || {};
  }

  // Thiết lập dữ liệu cho một tháng (từ GitHub)
  function setMonthData(monthKey, monthData) {
    // Lưu dữ liệu từ GitHub
    data[monthKey] = monthData;

    // Lưu vào localStorage trước khi hợp nhất
    saveData();

    // Hợp nhất với dữ liệu chưa commit
    mergeData();

    // Lưu lại sau khi hợp nhất
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

  // Thêm công việc mới (vào dữ liệu chưa commit)
  function addTodo(monthKey, dateKey, todo) {
    // Thêm vào dữ liệu chưa commit
    if (!uncommittedData[monthKey]) {
      uncommittedData[monthKey] = {};
    }

    if (!uncommittedData[monthKey][dateKey]) {
      uncommittedData[monthKey][dateKey] = [];
    }

    uncommittedData[monthKey][dateKey].push(todo);
    saveUncommittedData();

    // Cập nhật dữ liệu đã hợp nhất
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
    // Kiểm tra trong dữ liệu đã hợp nhất
    if (!data[monthKey] || !data[monthKey][dateKey]) {
      return false;
    }

    const todoIndex = data[monthKey][dateKey].findIndex(
      (todo) => todo.id === todoId
    );

    if (todoIndex === -1) {
      return false;
    }

    // Cập nhật trạng thái trong dữ liệu đã hợp nhất
    data[monthKey][dateKey][todoIndex].completed =
      !data[monthKey][dateKey][todoIndex].completed;
    saveData();

    // Kiểm tra xem todo có trong dữ liệu chưa commit không
    if (uncommittedData[monthKey] && uncommittedData[monthKey][dateKey]) {
      const uncommittedTodoIndex = uncommittedData[monthKey][dateKey].findIndex(
        (todo) => todo.id === todoId
      );

      if (uncommittedTodoIndex !== -1) {
        // Cập nhật trạng thái trong dữ liệu chưa commit
        uncommittedData[monthKey][dateKey][uncommittedTodoIndex].completed =
          data[monthKey][dateKey][todoIndex].completed;
        saveUncommittedData();
      } else {
        // Nếu không có trong dữ liệu chưa commit, thêm vào
        if (!uncommittedData[monthKey]) {
          uncommittedData[monthKey] = {};
        }
        if (!uncommittedData[monthKey][dateKey]) {
          uncommittedData[monthKey][dateKey] = [];
        }
        uncommittedData[monthKey][dateKey].push(
          JSON.parse(JSON.stringify(data[monthKey][dateKey][todoIndex]))
        );
        saveUncommittedData();
      }
    } else {
      // Nếu không có trong dữ liệu chưa commit, thêm vào
      if (!uncommittedData[monthKey]) {
        uncommittedData[monthKey] = {};
      }
      if (!uncommittedData[monthKey][dateKey]) {
        uncommittedData[monthKey][dateKey] = [];
      }
      uncommittedData[monthKey][dateKey].push(
        JSON.parse(JSON.stringify(data[monthKey][dateKey][todoIndex]))
      );
      saveUncommittedData();
    }

    return true;
  }

  // Xóa công việc
  function deleteTodo(monthKey, dateKey, todoId) {
    // Xóa từ dữ liệu đã hợp nhất
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

    // Xóa từ dữ liệu chưa commit nếu có
    if (uncommittedData[monthKey] && uncommittedData[monthKey][dateKey]) {
      uncommittedData[monthKey][dateKey] = uncommittedData[monthKey][
        dateKey
      ].filter((todo) => todo.id !== todoId);
      saveUncommittedData();
    }

    return true;
  }

  // Lấy dữ liệu chưa commit để đẩy lên GitHub
  function getUncommittedData() {
    return uncommittedData;
  }

  // Xóa dữ liệu chưa commit sau khi đã đẩy lên GitHub
  function clearUncommittedData() {
    uncommittedData = {};
    saveUncommittedData();
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
    getUncommittedData,
    clearUncommittedData,
  };
})();

// Xuất module ra window
window.DataModule = DataModule;
