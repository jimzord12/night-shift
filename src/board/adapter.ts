// A board adapter hides one task board (Trello, a JSON file, later others) behind four reads.
// The rest of the app only knows these shapes, so adding a board never touches it.

export interface RawCard {
  id: string;
  name: string;
  url: string;
  list: string;
  labels: string[];
  desc: string;
  closed: boolean;
}

export interface RawComment {
  cardId: string;
  cardName: string;
  cardUrl: string;
  date: string;
  text: string;
}

export interface RawAttachment {
  id: string;
  name: string;
}

export interface AttachmentBody {
  body: ArrayBuffer;
  contentType: string;
}

export interface BoardAdapter {
  // Open cards, in board order (list order, then card position).
  cards(): Promise<RawCard[]>;
  // Recent comments, newest first. Adapters may return all comments; the caller filters.
  comments(): Promise<RawComment[]>;
  attachments(cardId: string): Promise<RawAttachment[]>;
  attachment(cardId: string, attachmentId: string): Promise<AttachmentBody>;
}

export class BoardError extends Error {}
