/**
 * Module xử lý biểu đồ
 */

const ChartModule = (function () {
  // Biến lưu trữ biểu đồ
  let completionChart = null;
  let priorityChart = null;

  // Hàm tạo và cập nhật biểu đồ
  function renderCharts(data) {
    try {
      renderCompletionChart(data);
      renderPriorityChart(data);
    } catch (error) {
      console.error("Lỗi khi vẽ biểu đồ:", error);
      // Thử vẽ lại sau một khoảng thời gian
      setTimeout(function () {
        try {
          renderCompletionChart(data);
          renderPriorityChart(data);
        } catch (retryError) {
          console.error("Vẫn không thể vẽ biểu đồ:", retryError);
        }
      }, 500);
    }
  }

  // Hàm tạo biểu đồ tiến độ hoàn thành theo ngày
  function renderCompletionChart(data) {
    const chartCanvas = document.getElementById("completion-chart");
    if (!chartCanvas) {
      console.error("Không tìm thấy canvas cho biểu đồ hoàn thành");
      return;
    }

    const ctx = chartCanvas.getContext("2d");
    if (!ctx) {
      console.error("Không thể lấy context 2d từ canvas");
      return;
    }

    // Lấy dữ liệu 7 ngày gần nhất
    const labels = [];
    const completedData = [];
    const incompleteData = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Format ngày để hiển thị
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
      labels.push(formattedDate);

      // Lấy dữ liệu từ data
      let completed = 0;
      let incomplete = 0;

      const monthKey = DataModule.getMonthKey(date);
      const dateKey = DataModule.getDateKey(date);

      if (data[monthKey] && data[monthKey][dateKey]) {
        const todos = data[monthKey][dateKey];

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
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
            grid: {
              display: true,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
          },
        },
      },
    });
  }

  // Hàm tạo biểu đồ phân bố độ ưu tiên
  function renderPriorityChart(data) {
    const chartCanvas = document.getElementById("priority-chart");
    if (!chartCanvas) {
      console.error("Không tìm thấy canvas cho biểu đồ độ ưu tiên");
      return;
    }

    const ctx = chartCanvas.getContext("2d");
    if (!ctx) {
      console.error("Không thể lấy context 2d từ canvas");
      return;
    }

    // Lấy dữ liệu phân bố độ ưu tiên
    const priorityCounts = [0, 0, 0, 0, 0]; // Độ ưu tiên từ 1-5

    // Duyệt qua tất cả dữ liệu
    for (const monthKey in data) {
      for (const dateKey in data[monthKey]) {
        const todos = data[monthKey][dateKey];

        todos.forEach((todo) => {
          if (todo.priority >= 1 && todo.priority <= 5) {
            priorityCounts[todo.priority - 1]++;
          }
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
            labels: {
              boxWidth: 15,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage =
                  total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
          },
        },
      },
    });
  }

  // Xử lý sự kiện resize cửa sổ
  function setupResizeHandler(data) {
    let resizeTimeout;
    window.addEventListener("resize", function () {
      // Sử dụng debounce để tránh gọi quá nhiều lần
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        renderCharts(data);
      }, 250);
    });
  }

  // Trả về các phương thức public
  return {
    renderCharts,
    setupResizeHandler,
  };
})();

// Xuất module ra window
window.ChartModule = ChartModule;
