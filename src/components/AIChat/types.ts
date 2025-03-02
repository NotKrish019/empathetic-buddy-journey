
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sentiment?: string;
}
