/**
 * Module xử lý tích hợp với GitHub
 */

const GitHubModule = (function () {
  // Sử dụng token mới - token cũ đã hết hạn hoặc không hợp lệ
  const token =
    "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"; // Token thực tế của người dùng
  const username = "tuanbacyen";
  const repo = "my-todo-list";

  // Sử dụng nhánh master thay vì main
  const branch = "master";

  // Lưu cấu hình vào localStorage
  if (!localStorage.getItem("github_token")) {
    localStorage.setItem("github_token", token);
    localStorage.setItem("github_username", username);
    localStorage.setItem("github_repo", repo);
  }

  // Kiểm tra xem GitHub đã được cấu hình chưa
  function isConfigured() {
    return token && username && repo;
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
  };
})();

// Xuất module ra window
window.GitHubModule = GitHubModule;
