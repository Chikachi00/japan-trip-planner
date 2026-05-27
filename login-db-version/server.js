const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const PORT = 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DB_PATH = path.join(ROOT, "data", "db.json");
const sessions = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = http.createServer(async function (request, response) {
  try {
    if (request.url.startsWith("/api/")) {
      await handleApi(request, response);
      return;
    }

    await serveStaticFile(request, response);
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      message: error.message || "服务器错误",
    });
  }
});

server.listen(PORT, function () {
  console.log("Login DB version running at http://localhost:" + PORT);
});

async function handleApi(request, response) {
  const url = new URL(request.url, "http://localhost:" + PORT);

  if (request.method === "POST" && url.pathname === "/api/register") {
    await register(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/login") {
    await login(request, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/me") {
    const user = await getCurrentUser(request);
    sendJson(response, 200, { username: user.username });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/favorites") {
    const user = await getCurrentUser(request);
    sendJson(response, 200, { favorites: user.favorites });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/favorites") {
    await addFavorite(request, response);
    return;
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/favorites/")) {
    await removeFavorite(request, response, decodeURIComponent(url.pathname.replace("/api/favorites/", "")));
    return;
  }

  sendJson(response, 404, { message: "接口不存在" });
}

async function register(request, response) {
  const body = await readJsonBody(request);
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password) {
    sendJson(response, 400, { message: "请输入用户名和密码" });
    return;
  }

  const db = await readDb();
  const exists = db.users.some(function (user) {
    return user.username === username;
  });

  if (exists) {
    sendJson(response, 409, { message: "用户名已存在" });
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const user = {
    id: crypto.randomUUID(),
    username: username,
    salt: salt,
    passwordHash: hashPassword(password, salt),
    favorites: [],
  };

  db.users.push(user);
  await writeDb(db);

  sendJson(response, 201, { message: "注册成功" });
}

async function login(request, response) {
  const body = await readJsonBody(request);
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const db = await readDb();

  const user = db.users.find(function (item) {
    return item.username === username;
  });

  if (!user || user.passwordHash !== hashPassword(password, user.salt)) {
    sendJson(response, 401, { message: "用户名或密码错误" });
    return;
  }

  const token = crypto.randomUUID();
  sessions.set(token, user.id);

  sendJson(response, 200, {
    token: token,
    username: user.username,
  });
}

async function addFavorite(request, response) {
  const currentUser = await getCurrentUser(request);
  const body = await readJsonBody(request);
  const spotId = String(body.spotId || "");
  const db = await readDb();
  const user = findUserById(db, currentUser.id);

  if (!user.favorites.includes(spotId)) {
    user.favorites.push(spotId);
    await writeDb(db);
  }

  sendJson(response, 200, { favorites: user.favorites });
}

async function removeFavorite(request, response, spotId) {
  const currentUser = await getCurrentUser(request);
  const db = await readDb();
  const user = findUserById(db, currentUser.id);

  user.favorites = user.favorites.filter(function (id) {
    return id !== spotId;
  });
  await writeDb(db);

  sendJson(response, 200, { favorites: user.favorites });
}

async function getCurrentUser(request) {
  const token = getToken(request);
  const userId = sessions.get(token);

  if (!userId) {
    const error = new Error("请先登录");
    error.statusCode = 401;
    throw error;
  }

  const db = await readDb();
  return findUserById(db, userId);
}

function getToken(request) {
  const auth = request.headers.authorization || "";
  return auth.replace("Bearer ", "");
}

function findUserById(db, userId) {
  const user = db.users.find(function (item) {
    return item.id === userId;
  });

  if (!user) {
    const error = new Error("用户不存在");
    error.statusCode = 401;
    throw error;
  }

  return user;
}

function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

async function readDb() {
  const text = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(text);
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

async function readJsonBody(request) {
  let text = "";

  for await (const chunk of request) {
    text += chunk;
  }

  return text ? JSON.parse(text) : {};
}

async function serveStaticFile(request, response) {
  const url = new URL(request.url, "http://localhost:" + PORT);
  const safePath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  const extension = path.extname(filePath);
  const content = await fs.readFile(filePath);

  response.writeHead(200, {
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
  });
  response.end(content);
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(data));
}
