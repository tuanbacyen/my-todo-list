/**
 * Module xử lý thống kê
 */

const StatsModule = (function () {
  // Hàm tính toán thống kê cho một ngày cụ thể
  function calculateDayStats(data, date) {
    if (!data) {
      return {
        completed: 0,
        total: 0,
        priorityCompleted: 0,
        priorityIncomplete: 0,
      };
    }

    const dateKey = DataModule.getDateKey(date);
    const monthKey = DataModule.getMonthKey(date);

    let completed = 0;
    let total = 0;
    let priorityCompleted = 0;
    let priorityIncomplete = 0;

    if (data[monthKey] && data[monthKey][dateKey]) {
      const todos = data[monthKey][dateKey];
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

    return {
      completed,
      total,
      priorityCompleted,
      priorityIncomplete,
    };
  }

  // Hàm tính toán thống kê cho 7 ngày qua
  function calculateWeekStats(data) {
    if (!data) {
      return {
        completed: 0,
        total: 0,
        priorityCompleted: 0,
        priorityIncomplete: 0,
      };
    }

    let completed = 0;
    let total = 0;
    let priorityCompleted = 0;
    let priorityIncomplete = 0;

    // Lấy dữ liệu 7 ngày qua
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dateKey = DataModule.getDateKey(date);
      const monthKey = DataModule.getMonthKey(date);

      if (data[monthKey] && data[monthKey][dateKey]) {
        const todos = data[monthKey][dateKey];
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

    return {
      completed,
      total,
      priorityCompleted,
      priorityIncomplete,
    };
  }

  // Hàm tìm công việc làm liên tục
  function findRecurringTasks(data) {
    if (!data || Object.keys(data).length === 0) {
      return [];
    }

    // Tạo map để đếm tần suất xuất hiện của các công việc
    const taskFrequency = new Map();
    const taskDetails = new Map();

    // Duyệt qua tất cả dữ liệu
    for (const monthKey in data) {
      for (const dateKey in data[monthKey]) {
        const todos = data[monthKey][dateKey];

        todos.forEach((todo) => {
          // Kiểm tra todo và todo.name có tồn tại không
          if (!todo || !todo.name) return;

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

    return recurringTasks;
  }

  // Hàm cập nhật tất cả thống kê
  function updateAllStats(data) {
    if (!data) {
      return {
        todayStats: {
          completed: 0,
          total: 0,
          priorityCompleted: 0,
          priorityIncomplete: 0,
        },
        yesterdayStats: {
          completed: 0,
          total: 0,
          priorityCompleted: 0,
          priorityIncomplete: 0,
        },
        weekStats: {
          completed: 0,
          total: 0,
          priorityCompleted: 0,
          priorityIncomplete: 0,
        },
        recurringTasks: [],
      };
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Tính toán thống kê
    const todayStats = calculateDayStats(data, today);
    const yesterdayStats = calculateDayStats(data, yesterday);
    const weekStats = calculateWeekStats(data);
    const recurringTasks = findRecurringTasks(data);

    return {
      todayStats,
      yesterdayStats,
      weekStats,
      recurringTasks,
    };
  }

  // Trả về các phương thức public
  return {
    calculateDayStats,
    calculateWeekStats,
    findRecurringTasks,
    updateAllStats,
  };
})();

// Export module
window.StatsModule = StatsModule;
