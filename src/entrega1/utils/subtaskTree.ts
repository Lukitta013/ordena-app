export type AppSubtask = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  children: AppSubtask[];
};

let _counter = 0;
export function genId() {
  return `st-${Date.now()}-${++_counter}`;
}

export function addSubtask(
  tree: AppSubtask[],
  parentId: string | null,
  title: string,
): AppSubtask[] {
  const node: AppSubtask = { id: genId(), title, completed: false, children: [] };
  if (parentId === null) return [...tree, node];
  return tree.map(n =>
    n.id === parentId
      ? { ...n, children: [...n.children, node] }
      : { ...n, children: addSubtask(n.children, parentId, title) },
  );
}

export function updateSubtask(
  tree: AppSubtask[],
  id: string,
  patch: Partial<Omit<AppSubtask, "children">>,
): AppSubtask[] {
  return tree.map(n =>
    n.id === id
      ? { ...n, ...patch }
      : { ...n, children: updateSubtask(n.children, id, patch) },
  );
}

export function removeSubtask(tree: AppSubtask[], id: string): AppSubtask[] {
  return tree
    .filter(n => n.id !== id)
    .map(n => ({ ...n, children: removeSubtask(n.children, id) }));
}

function markAll(nodes: AppSubtask[], completed: boolean): AppSubtask[] {
  return nodes.map(n => ({ ...n, completed, children: markAll(n.children, completed) }));
}

export function toggleSubtask(tree: AppSubtask[], id: string): AppSubtask[] {
  function toggle(nodes: AppSubtask[]): AppSubtask[] {
    return nodes.map(n => {
      if (n.id === id) {
        const next = !n.completed;
        return { ...n, completed: next, children: markAll(n.children, next) };
      }
      const newChildren = toggle(n.children);
      // If every child is now completed, auto-complete the parent
      const allDone =
        newChildren.length > 0 && newChildren.every(c => c.completed);
      return {
        ...n,
        children: newChildren,
        completed: allDone ? true : n.completed,
      };
    });
  }
  return toggle(tree);
}

export function countLeaves(tree: AppSubtask[]): { completed: number; total: number } {
  let completed = 0;
  let total = 0;
  function walk(nodes: AppSubtask[]) {
    for (const n of nodes) {
      total++;
      if (n.completed) completed++;
      walk(n.children);
    }
  }
  walk(tree);
  return { completed, total };
}

export function nodeDepth(tree: AppSubtask[], id: string, depth = 0): number {
  for (const n of tree) {
    if (n.id === id) return depth;
    const found = nodeDepth(n.children, id, depth + 1);
    if (found !== -1) return found;
  }
  return -1;
}
