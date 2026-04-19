import { useAuthStore } from "@/stores/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || "Ein Fehler ist aufgetreten");
  }

  return data;
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return data; // { access_token, user } -> backend gibt vermutlich access_token zurück. Mal sehen was B2 wirklich gebaut hat.
    },
    register: async (email: string, username: string, password: string) => {
      const data = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });
      return data;
    },
    me: async () => {
      return fetchApi("/auth/me");
    }
  },
  games: {
    createGame: async (name: string, isPrivate: boolean) => {
      return fetchApi("/games", {
        method: "POST",
        body: JSON.stringify({ name, isPrivate }),
      });
    },
    joinGame: async (roomCode: string) => {
      return fetchApi("/games/join", {
        method: "POST",
        body: JSON.stringify({ roomCode }),
      });
    },
    getLobby: async (gameId: string) => {
      return fetchApi(`/games/${gameId}`);
    },
    chooseNation: async (gameId: string, nation: string) => {
      return fetchApi(`/games/${gameId}/nation`, {
        method: "PATCH",
        body: JSON.stringify({ nation }),
      });
    },
    toggleReady: async (gameId: string) => {
      return fetchApi(`/games/${gameId}/ready`, {
        method: "PATCH",
      });
    },
    startGame: async (gameId: string) => {
      return fetchApi(`/games/${gameId}/start`, {
        method: "POST",
      });
    }
  },
};
