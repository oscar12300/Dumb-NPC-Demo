// 建立場景與相機
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 設定相機初始位置
camera.position.set(4, 1.5, 6);

// 地板
const floorGeometry = new THREE.PlaneGeometry(100, 100); //平面
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// NPC（綠色方塊）
const npcGeometry = new THREE.BoxGeometry(1, 2, 1); //立體方塊
const npcMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const npc = new THREE.Mesh(npcGeometry, npcMaterial);
npc.position.set(5, 1, 0);
scene.add(npc);

// 簡單的光源
const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

// 玩家移動控制
const move = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

document.addEventListener("keydown", (event) => {
  console.log("Key pressed:", event.key); // 訊息紀錄
  switch (event.key) {
    case "w":
      move.forward = true;
      break;
    case "s":
      move.backward = true;
      break;
    case "a":
      move.left = true;
      break;
    case "d":
      move.right = true;
      break;
  }
});

document.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "w":
      move.forward = false;
      break;
    case "s":
      move.backward = false;
      break;
    case "a":
      move.left = false;
      break;
    case "d":
      move.right = false;
      break;
  }
});

// 對話框設定
const dialogBox = document.getElementById("dialog-box");

function checkInteraction() {
  const distance = camera.position.distanceTo(npc.position);
  if (distance < 3) {
    dialogBox.style.display = "block";
  } else {
    dialogBox.style.display = "none";
  }
}

// 自動調整螢幕大小
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 渲染循環
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.1;
  if (move.forward) camera.position.z -= speed;
  if (move.backward) camera.position.z += speed;
  if (move.left) camera.position.x -= speed;
  if (move.right) camera.position.x += speed;

  checkInteraction();
  renderer.render(scene, camera);
}

animate();

//接chat GPT API
async function fetchGPTResponse(prompt) {
  const apiKey = "sk-proj-FAKE-KEY-FOR-GITHUB-DEPLOYMENT";
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "一位AI NPC" },
          { role: "user", content: prompt },
        ],
        max_tokens: 100, // 最多生成 100 個 token
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from GPT API:", errorData);
      return "API 請求失敗，請檢查控制台日誌。";
    }

    const data = await response.json();
    console.log("GPT Response:", data);
    return data.choices[0].message.content.trim(); // 讀取 GPT 的回答
  } catch (error) {
    console.error("Fetch error:", error);
    return "網路錯誤，請檢查連線。";
  }
}

//和NPC互動
const sendButton = document.getElementById("send-button");
const userInput = document.getElementById("user-input");
userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendButton.click();
  }
});

let interacting = false;

document.addEventListener("keydown", async (event) => {
  if (event.key === "Enter" && !interacting) {
    const distance = camera.position.distanceTo(npc.position);
    if (distance < 3) {
      interacting = true;
      dialogBox.innerText = "...";
      dialogBox.style.display = "block";

      //從輸入框問問題
      const prompt = userInput.value.trim(); // 取得使用者輸入的問題
      if (prompt === "") {
        dialogBox.innerText = "請先輸入一個問題！";
      } else {
        const response = await fetchGPTResponse(prompt);
        dialogBox.innerText = response;
        userInput.value = ""; // 清空輸入框
      }
    }
  }
});
