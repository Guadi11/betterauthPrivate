// lib/pat/disenos/editor/editor-events.ts

export const EditorEvent = {
  ADD_RECT: 'editor:addRect',
  ADD_TEXT: 'editor:addText',
  ADD_IMAGE: 'editor:addImage',
} as const;

export type EditorEventName = typeof EditorEvent[keyof typeof EditorEvent];
