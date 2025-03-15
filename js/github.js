/**
 * Module xử lý tích hợp với GitHub
 */

const GitHubModule = (function () {
  // Lấy thông tin cấu hình từ localStorage
  let token = localStorage.getItem("github_token") || "";
  const username = "tuanbacyen";
  const repo = "my-todo-list";
  const branch = "master";

  // Hiển thị thông tin token hiện tại
  function displayCurrentToken() {
    const tokenInfoElement = document.getElementById("current-token-info");
    if (!tokenInfoElement) return;

    if (token) {
      const firstFive = token.substring(0, 5);
      const lastFive = token.substring(token.length - 5);
      tokenInfoElement.innerHTML = `<p>Token hiện tại: ${firstFive}...${lastFive}</p>`;
    } else {
      tokenInfoElement.innerHTML = "<p>Chưa có token nào được cấu hình</p>";
    }
  }

  // Thiết lập cấu hình GitHub
  function configure(newToken) {
    token = newToken;
    localStorage.setItem("github_token", token);
    displayCurrentToken();
    return isConfigured();
  }

  // Kiểm tra xem GitHub đã được cấu hình chưa
  function isConfigured() {
    return token && username && repo;
  }

  // Thiết lập sự kiện cho form cấu hình
  function setupConfigEvents() {
    const configBtn = document.getElementById("github-config-btn");
    const modal = document.getElementById("github-config-modal");
    const closeBtn = modal?.querySelector(".close");
    const form = document.getElementById("github-config-form");

    // Hiển thị thông tin token hiện tại
    displayCurrentToken();

    if (configBtn) {
      configBtn.addEventListener("click", function () {
        if (modal) modal.style.display = "block";
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        if (modal) modal.style.display = "none";
      });
    }

    // Đóng modal khi click bên ngoài
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const tokenInput = document.getElementById("github-token");
        if (tokenInput && tokenInput.value) {
          const success = configure(tokenInput.value);
          if (success) {
            if (modal) modal.style.display = "none";
            UIModule.showStatusMessage(
              "Đã lưu cấu hình GitHub thành công!",
              "success"
            );
          }
        }
      });
    }
  }

  // Đảm bảo thư mục data tồn tại
  async function ensureDataFolder() {
    try {
      // Kiểm tra xem thư mục data đã tồn tại chưa
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/data?ref=${branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (response.status === 401) {
        const errorData = await response.json();
        console.error("Lỗi xác thực GitHub:", errorData);
        throw new Error(
          `Lỗi xác thực GitHub: ${errorData.message}. Vui lòng kiểm tra token của bạn.`
        );
      }

      if (response.status === 404) {
        // Thư mục không tồn tại, tạo nó bằng cách thêm file README.md
        const createResponse = await fetch(
          `https://api.github.com/repos/${username}/${repo}/contents/data/README.md`,
          {
            method: "PUT",
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: "Tạo thư mục data",
              content: btoa(
                "# Thư mục dữ liệu\nThư mục này chứa dữ liệu todo của ứng dụng."
              ),
              branch: branch,
            }),
          }
        );

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          console.error("Lỗi khi tạo thư mục data:", errorData);
          throw new Error(
            `Không thể tạo thư mục data: ${
              createResponse.statusText
            } - ${JSON.stringify(errorData)}`
          );
        }

        return true;
      } else if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi khi kiểm tra thư mục data:", errorData);
        throw new Error(
          `Lỗi khi kiểm tra thư mục data: ${
            response.statusText
          } - ${JSON.stringify(errorData)}`
        );
      }

      return true;
    } catch (error) {
      console.error("Lỗi khi đảm bảo thư mục data:", error);
      throw error; // Ném lỗi để xử lý ở cấp cao hơn
    }
  }

  // Lấy SHA của file nếu tồn tại
  async function getFileSHA(path) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/${path}?ref=${branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (response.status === 404) {
        return null; // File không tồn tại
      }

      if (!response.ok) {
        throw new Error(`Không thể lấy SHA của file: ${response.statusText}`);
      }

      const data = await response.json();
      return data.sha;
    } catch (error) {
      console.error(`Lỗi khi lấy SHA của file ${path}:`, error);
      return null;
    }
  }

  // Tạo thông điệp commit
  function generateCommitMessage() {
    const now = new Date();
    return `Cập nhật dữ liệu todo - ${now.toLocaleString()}`;
  }

  // Lưu dữ liệu lên GitHub
  async function saveDataToGitHub(data) {
    try {
      if (!isConfigured()) {
        throw new Error("GitHub chưa được cấu hình");
      }

      // Đảm bảo thư mục data tồn tại
      const folderExists = await ensureDataFolder();
      if (!folderExists) {
        throw new Error("Không thể đảm bảo thư mục data tồn tại");
      }

      // Lấy tháng hiện tại để lưu dữ liệu
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;
      const filePath = `data/${monthKey}.json`;

      // Lấy SHA của file nếu tồn tại
      const fileSHA = await getFileSHA(filePath);

      // Chuẩn bị dữ liệu để lưu
      const content = btoa(JSON.stringify(data, null, 2));
      const commitMessage = generateCommitMessage();

      const requestBody = {
        message: commitMessage,
        content: content,
        branch: branch,
      };

      // Nếu file đã tồn tại, thêm SHA vào request
      if (fileSHA) {
        requestBody.sha = fileSHA;
      }

      // Gửi request để lưu file
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Không thể lưu dữ liệu: ${response.statusText} - ${JSON.stringify(
            errorData
          )}`
        );
      }

      return true;
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu lên GitHub:", error);
      throw error;
    }
  }

  // Tải dữ liệu từ GitHub
  async function loadDataFromGitHub(monthKey) {
    try {
      if (!isConfigured()) {
        throw new Error("GitHub chưa được cấu hình");
      }

      const filePath = `data/${monthKey}.json`;

      const response = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/${filePath}?ref=${branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (response.status === 404) {
        console.log(`File ${filePath} không tồn tại, trả về dữ liệu trống`);
        return {}; // Trả về đối tượng trống nếu file không tồn tại
      }

      if (!response.ok) {
        throw new Error(`Không thể tải dữ liệu: ${response.statusText}`);
      }

      const data = await response.json();
      const content = atob(data.content);

      return JSON.parse(content);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu từ GitHub:", error);
      // Trả về đối tượng trống nếu có lỗi
      return {};
    }
  }

  // Trả về các phương thức công khai
  return {
    isConfigured,
    saveDataToGitHub,
    loadDataFromGitHub,
    setupConfigEvents,
  };
})();

// Xuất module ra window
window.GitHubModule = GitHubModule;
