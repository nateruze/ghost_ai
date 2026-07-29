import type { AiChatFeedMessage, AiStatusFeedMessage } from "@/types/tasks"

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    // Example, a conflict-free list
    // Storage: { animals: LiveList<string> };
    Storage: Record<string, never>;

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: Record<string, never>;

    // Custom data for feed messages, for useFeedMessages, useCreateFeedMessage
    // Two separate feeds share this union (types/tasks.ts): "ai-status-feed" holds
    // AiStatusFeedMessage payloads, "ai-chat" holds AiChatFeedMessage payloads.
    FeedMessageData: AiStatusFeedMessage | AiChatFeedMessage;

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    // Example, attaching coordinates to a thread
    // ThreadMetadata: { x: number; y: number };
    ThreadMetadata: Record<string, never>;

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    // Example, rooms with a title and url
    // RoomInfo: { title: string; url: string };
    RoomInfo: Record<string, never>;
  }
}

export {};
