import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  Plugin,
} from "obsidian";

export default class H1Suggester extends EditorSuggest<string> {
  constructor(public plugin: Plugin) {
    super(plugin.app);
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
  ): EditorSuggestTriggerInfo | null {
    const line = editor.getLine(cursor.line);
    if (line !== "# " || cursor.ch !== line.length) return null;
    return {
      start: { line: cursor.line, ch: 0 },
      end: cursor,
      query: "",
    };
  }

  getSuggestions(context: EditorSuggestContext) {
    return [context.file.basename];
  }

  renderSuggestion(suggestion: string, el: HTMLElement): void {
    el.setText(suggestion);
  }

  selectSuggestion(suggestion: string): void {
    if (!this.context) return;
    suggestion = `# ${suggestion.trim()}`;
    const { editor, end } = this.context;
    if (editor.lineCount() - 1 === end.line) suggestion += "\n\n";
    else if (editor.getLine(end.line + 1).trim() !== "") suggestion += "\n";
    if (end.line - 1 < 0 || editor.getLine(end.line - 1).trim() !== "")
      suggestion = "\n" + suggestion;
    this.context.editor.replaceRange(
      suggestion,
      this.context.start,
      this.context.end,
    );
  }
}
