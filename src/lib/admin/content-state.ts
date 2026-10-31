export type ContentActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const INITIAL_CONTENT_STATE: ContentActionState = { status: 'idle' };
