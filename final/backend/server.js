const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const PORT = 3001;
const DB_PATH = path.join(__dirname, "data", "db.json");
const SPOTS_PATH = path.join(__dirname, "data", "spots.json");
const sessions = new Map();

const server = http.createServer(async function (request, response) {
  try {
    setCorsHeaders(response);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    await handleApi(request, response);
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      message: error.message || "服务器错误",
    });
  }
});

server.listen(PORT, function () {
  console.log("Final backend running at http://localhost:" + PORT);
});

async function handleApi(request, response) {
  const url = new URL(request.url, "http://localhost:" + PORT);

  if (request.method === "GET" && url.pathname === "/api/spots") {
    const spots = JSON.parse(await fs.readFile(SPOTS_PATH, "utf8"));
    sendJson(response, 200, { spots: spots });
    return;
  }

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
    const spotId = decodeURIComponent(url.pathname.replace("/api/favorites/", ""));
    await removeFavorite(request, response, spotId);
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
  db.users.push({
    id: crypto.randomUUID(),
    username: username,
    salt: salt,
    passwordHash: hashPassword(password, salt),
    favorites: [],
  });
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

  if (spotId && !user.favorites.includes(spotId)) {
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
  const token = (request.headers.authorization || "").replace("Bearer ", "");
  const userId = sessions.get(token);

  if (!userId) {
    const error = new Error("请先登录");
    error.statusCode = 401;
    throw error;
  }

  const db = await readDb();
  return findUserById(db, userId);
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
  return JSON.parse(await fs.readFile(DB_PATH, "utf8"));
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

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(data));
}
