
import {
  auth,
  db,
  signInAnonymously,
  onAuthStateChanged,
  googleProvider,
  signInWithRedirect,
  getRedirectResult
} from "./firebase.js";

import {
  createRoom,
  joinRoom,
  watchRoom,
  startGame,
  playTile,
  drawTile,
  passTurn,
  leaveRoom
} from "./rooms.js";

import { canPlace } from "./domino.js";

const $ = id => document.getElementById(id);

let user = null;
let code = null;
let room = null;
let unsubscribe = null;

const say = (id, msg) => {
  $(id).textContent = msg;
};

const nickname = () => {
  const entered = $("nickname").value.trim().slice(0, 18);
  return entered || user?.displayName || "Jugador";
};

function showScreen(screen) {
  $("login").classList.toggle("hidden", screen !== "login");
  $("lobby").classList.toggle("hidden", screen !== "lobby");
  $("game").classList.toggle("hidden", screen !== "game");
}

function tileNode(tile, clickable = false, onClick = null) {
  const b = document.createElement(clickable ? "button" : "div");
  b.className = clickable ? "tile-button" : "tile";

  const tileEl = document.createElement("div");
  tileEl.className = "tile";

  for (const n of tile) {
    const s = document.createElement("span");
    s.textContent = n;
    tileEl.append(s);
  }

  if (clickable) {
    b.type = "button";
    b.append(tileEl);
    b.onclick = onClick;
  } else {
    b.append(tileEl);
  }

  return b;
}

function render() {
  if (!room) return;

  $("roomLabel").textContent = code;

  const players = Object.values(room.players || {});
  $("players").replaceChildren();

  players.forEach(p => {
    const card = document.createElement("div");
    card.className = "player" + (room.turn === p.uid ? " active" : "");

    const name = document.createElement("strong");
    name.textContent = p.name + (p.uid === user.uid ? " (tú)" : "");

    const count = document.createElement("small");
    count.textContent = `${room.hands?.[p.uid]?.length ?? "—"} fichas`;

    card.append(name, count);
    $("players").append(card);
  });

  $("chain").replaceChildren();
  (room.board || []).forEach(t => {
    $("chain").append(tileNode(t));
  });

  const hand = room.hands?.[user.uid] || [];
  $("hand").replaceChildren();

  hand.forEach((t, i) => {
    const allowed =
      room.status === "playing" &&
      room.turn === user.uid &&
      canPlace(t, room.board || []);

    $("hand").append(tileNode(t, allowed, async () => {
      let side = "right";

      if ((room.board || []).length) {
        const left =
          room.board[0][0] === t[0] ||
          room.board[0][0] === t[1];

        const right =
          room.board.at(-1)[1] === t[0] ||
          room.board.at(-1)[1] === t[1];

        if (left && right) {
          side = confirm(
            "Aceptar = colocar a la izquierda. Cancelar = derecha."
          ) ? "left" : "right";
        } else if (left && !right) {
          side = "left";
        }
      }

      try {
        await playTile(db, user, code, i, side);
      } catch (e) {
        say("gameMessage", e.message);
      }
    }));
  });

  $("handCount").textContent = `${hand.length} fichas`;

  $("turnLabel").textContent =
    room.status === "playing"
      ? (room.turn === user.uid ? "Tu turno" : "Turno de otro jugador")
      : room.status === "finished"
        ? "Partida terminada"
        : "Esperando inicio";

  say(
    "gameMessage",
    room.message || "Comparte el código para invitar jugadores."
  );

  $("startGame").disabled =
    room.status !== "waiting" || players.length < 2;

  $("startGame").textContent =
    players.length < 2 ? "Esperando jugadores…" : "Iniciar partida";

  $("drawTile").disabled =
    room.status !== "playing" ||
    room.turn !== user.uid ||
    !(room.stock || []).length;

  $("passTurn").disabled =
    room.status !== "playing" ||
    room.turn !== user.uid ||
    (room.stock || []).length > 0;
}

function listen(codeValue) {
  code = codeValue;
  showScreen("game");
  $("roomLabel").textContent = code;

  if (unsubscribe) unsubscribe();

  unsubscribe = watchRoom(db, code, data => {
    if (!data) {
      say("gameMessage", "La sala ya no existe.");
      return;
    }

    room = data;
    render();
  });
}

async function run(action) {
  try {
    await action();
  } catch (e) {
    say("lobbyMessage", e.message || "Ocurrió un error.");
  }
}

// Acceso como invitado
$("guestLogin").onclick = async () => {
  $("guestLogin").disabled = true;
  $("googleLogin").disabled = true;
  say("loginMessage", "Entrando como invitado…");

  try {
    await signInAnonymously(auth);
  } catch (e) {
    say("loginMessage", "Error de acceso: " + e.message);
    $("guestLogin").disabled = false;
    $("googleLogin").disabled = false;
  }
};

// Acceso con Google
$("googleLogin").onclick = async () => {
  $("guestLogin").disabled = true;
  $("googleLogin").disabled = true;
  say("loginMessage", "Abriendo Google…");

  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (e) {
    say("loginMessage", "Error con Google: " + e.message);
    $("guestLogin").disabled = false;
    $("googleLogin").disabled = false;
  }
};

// Recibir el resultado cuando Google devuelve al jugador
getRedirectResult(auth).catch(e => {
  say("loginMessage", "Error al regresar de Google: " + e.message);
  $("guestLogin").disabled = false;
  $("googleLogin").disabled = false;
});

// Detectar cuándo el jugador ya está conectado
onAuthStateChanged(auth, u => {
  user = u;

  if (u) {
    $("connection").textContent = "Conectado";
    showScreen("lobby");
    $("guestLogin").disabled = false;
    $("googleLogin").disabled = false;
  } else {
    $("connection").textContent = "Desconectado";
    showScreen("login");
  }
});

// Crear sala
$("createRoom").onclick = () => run(async () => {
  const c = await createRoom(db, user, nickname());
  listen(c);
});

// Unirse a una sala
$("joinRoom").onclick = () => run(async () => {
  const c = $("roomCode").value.trim().toUpperCase();

  if (!/^[A-Z0-9]{6}$/.test(c)) {
    throw new Error("Escribe un código válido de 6 caracteres.");
  }

  await joinRoom(db, user, nickname(), c);
  listen(c);
});

// Acciones de la partida
$("startGame").onclick = () =>
  run(() => startGame(db, user, code));

$("drawTile").onclick = () =>
  run(() => drawTile(db, user, code));

$("passTurn").onclick = () =>
  run(() => passTurn(db, user, code));

$("leaveRoom").onclick = () => run(async () => {
  if (code) await leaveRoom(db, user, code);

  if (unsubscribe) unsubscribe();

  unsubscribe = null;
  code = null;
  room = null;

  showScreen("lobby");
});

// Copiar código de sala
$("copyCode").onclick = async () => {
  try {
    await navigator.clipboard.writeText(code);
    say("gameMessage", "Código copiado.");
  } catch {
    say("gameMessage", `Comparte este código: ${code}`);
  }
};
