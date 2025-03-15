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
              content: encodeUnicode(
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

      // Hợp nhất dữ liệu đã commit với dữ liệu chưa commit
      let mergedData = data;

      // Nếu có dữ liệu chưa commit, hợp nhất vào
      if (window.DataModule && window.DataModule.getUncommittedData) {
        const uncommittedData = window.DataModule.getUncommittedData();

        // Kiểm tra xem có dữ liệu chưa commit cho tháng hiện tại không
        if (uncommittedData[monthKey]) {
          // Tạo bản sao sâu của dữ liệu
          mergedData = JSON.parse(JSON.stringify(data));

          // Hợp nhất dữ liệu
          for (const dateKey in uncommittedData[monthKey]) {
            if (!mergedData[dateKey]) {
              mergedData[dateKey] = [];
            }

            // Thêm các todo chưa commit vào dữ liệu đã hợp nhất, loại bỏ trùng lặp
            const existingIds = new Set(
              mergedData[dateKey].map((todo) => todo.id)
            );

            // Chỉ thêm các todo có id chưa tồn tại
            const uniqueNewTodos = uncommittedData[monthKey][dateKey].filter(
              (todo) => !existingIds.has(todo.id)
            );

            mergedData[dateKey] = [...mergedData[dateKey], ...uniqueNewTodos];
          }
        }
      }

      // Chuẩn bị dữ liệu để lưu
      // Sử dụng hàm encodeUnicode để xử lý các ký tự Unicode
      const jsonString = JSON.stringify(mergedData, null, 2);
      const content = encodeUnicode(jsonString);
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

      // Xóa dữ liệu chưa commit sau khi đã lưu thành công
      if (window.DataModule && window.DataModule.clearUncommittedData) {
        window.DataModule.clearUncommittedData();
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
      // Sử dụng hàm decodeUnicode để giải mã nội dung
      try {
        // GitHub API trả về nội dung đã được mã hóa base64
        const content = decodeUnicode(data.content);
        return JSON.parse(content);
      } catch (error) {
        // Nếu có lỗi với phương pháp mới, thử phương pháp cũ
        console.warn("Lỗi khi giải mã Unicode, thử phương pháp cũ:", error);
        const content = atob(data.content);
        return JSON.parse(content);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu từ GitHub:", error);
      // Trả về đối tượng trống nếu có lỗi
      return {};
    }
  }

  // Hàm mã hóa chuỗi Unicode thành base64 an toàn
  function encodeUnicode(str) {
    try {
      // Chuyển đổi chuỗi thành mảng byte UTF-8
      const utf8Bytes = new TextEncoder().encode(str);

      // Chuyển đổi mảng byte thành chuỗi base64
      const base64 = btoa(
        Array.from(utf8Bytes)
          .map((byte) => String.fromCharCode(byte))
          .join("")
      );

      return base64;
    } catch (error) {
      console.error("Lỗi khi mã hóa Unicode:", error);

      // Phương pháp thay thế nếu TextEncoder không khả dụng
      let binaryString = "";
      const bytes = new Uint8Array(str.length * 3); // Dự phòng cho các ký tự UTF-8 dài
      let bytesLength = 0;

      for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);

        if (charCode < 0x80) {
          // ASCII character (1 byte)
          bytes[bytesLength++] = charCode;
        } else if (charCode < 0x800) {
          // 2-byte character
          bytes[bytesLength++] = 0xc0 | (charCode >> 6);
          bytes[bytesLength++] = 0x80 | (charCode & 0x3f);
        } else if (charCode < 0xd800 || charCode >= 0xe000) {
          // 3-byte character
          bytes[bytesLength++] = 0xe0 | (charCode >> 12);
          bytes[bytesLength++] = 0x80 | ((charCode >> 6) & 0x3f);
          bytes[bytesLength++] = 0x80 | (charCode & 0x3f);
        } else {
          // Surrogate pair (4-byte character)
          i++;
          const nextCharCode = str.charCodeAt(i);
          const codePoint =
            (0x10000 + ((charCode & 0x3ff) << 10)) | (nextCharCode & 0x3ff);

          bytes[bytesLength++] = 0xf0 | (codePoint >> 18);
          bytes[bytesLength++] = 0x80 | ((codePoint >> 12) & 0x3f);
          bytes[bytesLength++] = 0x80 | ((codePoint >> 6) & 0x3f);
          bytes[bytesLength++] = 0x80 | (codePoint & 0x3f);
        }
      }

      // Chuyển đổi mảng byte thành chuỗi để btoa có thể xử lý
      for (let i = 0; i < bytesLength; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }

      return btoa(binaryString);
    }
  }

  // Hàm giải mã chuỗi base64 thành Unicode
  function decodeUnicode(base64) {
    try {
      // Giải mã base64 thành chuỗi byte
      const binaryString = atob(base64);

      // Chuyển đổi chuỗi byte thành mảng byte UTF-8
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Giải mã mảng byte UTF-8 thành chuỗi Unicode
      return new TextDecoder().decode(bytes);
    } catch (error) {
      console.error("Lỗi khi giải mã Unicode:", error);

      // Phương pháp thay thế nếu TextDecoder không khả dụng
      try {
        // Giải mã base64 thành chuỗi byte
        const binaryString = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));

        // Xử lý UTF-8 thủ công
        let result = "";
        let i = 0;

        while (i < binaryString.length) {
          const byte1 = binaryString.charCodeAt(i++);

          // Xác định số byte của ký tự UTF-8
          if (byte1 < 0x80) {
            // 1-byte character
            result += String.fromCharCode(byte1);
          } else if (byte1 < 0xe0) {
            // 2-byte character
            const byte2 = binaryString.charCodeAt(i++);
            result += String.fromCharCode(
              ((byte1 & 0x1f) << 6) | (byte2 & 0x3f)
            );
          } else if (byte1 < 0xf0) {
            // 3-byte character
            const byte2 = binaryString.charCodeAt(i++);
            const byte3 = binaryString.charCodeAt(i++);
            result += String.fromCharCode(
              ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
            );
          } else {
            // 4-byte character (surrogate pair in JavaScript)
            const byte2 = binaryString.charCodeAt(i++);
            const byte3 = binaryString.charCodeAt(i++);
            const byte4 = binaryString.charCodeAt(i++);

            // Calculate the Unicode code point
            const codePoint =
              ((byte1 & 0x07) << 18) |
              ((byte2 & 0x3f) << 12) |
              ((byte3 & 0x3f) << 6) |
              (byte4 & 0x3f);

            // Convert to surrogate pair
            const highSurrogate =
              Math.floor((codePoint - 0x10000) / 0x400) + 0xd800;
            const lowSurrogate = ((codePoint - 0x10000) % 0x400) + 0xdc00;

            result += String.fromCharCode(highSurrogate, lowSurrogate);
          }
        }

        return result;
      } catch (fallbackError) {
        console.error("Lỗi khi sử dụng phương pháp thay thế:", fallbackError);
        // Trả về chuỗi gốc nếu cả hai phương pháp đều thất bại
        return atob(base64);
      }
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
