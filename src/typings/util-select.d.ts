declare module "unist-util-select" {
  /**
   * @param {string} selector
   * @param {Node} [node]
   * @returns {boolean}
   */
  export function matches<T extends Node>(
    selector: string,
    node?: Node,
  ): node is T;
  /**
   * @param {string} selector
   * @param {Node} [node]
   * @returns {Node|null}
   */
  export function select<T extends Node>(
    selector: string,
    node?: Node,
  ): T | null;
  /**
   * @param {string} selector
   * @param {Node} [node]
   * @returns {Array.<Node>}
   */
  export function selectAll<T extends Node>(selector: string, node?: Node): T[];
  export type Node = import("unist").Node;
}
