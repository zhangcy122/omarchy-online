/**
 * Hyprland Dwindle Tiling Layout Engine (Binary Space Partitioning)
 * 1:1 Implementation of Omarchy Hyprland Dwindle Algorithm
 */

class DwindleNode {
  constructor(type, window = null) {
    this.type = type; // 'leaf' or 'internal'
    this.window = window; // Only present if type === 'leaf'
    this.split = 'v'; // 'v' = vertical (left/right), 'h' = horizontal (top/bottom)
    this.ratio = 0.5; // Split ratio
    this.left = null; // Left / Top child
    this.right = null; // Right / Bottom child
    this.parent = null;
  }

  isLeaf() {
    return this.type === 'leaf';
  }
}

class DwindleTree {
  constructor() {
    this.root = null;
  }

  /**
   * Insert a new window into the tree by splitting the target leaf node.
   * If targetLeaf is null, splits the rightmost or root leaf.
   */
  addWindow(windowData, targetWindowId = null) {
    const newLeaf = new DwindleNode('leaf', windowData);

    // 1. If tree is empty, new node becomes root
    if (!this.root) {
      this.root = newLeaf;
      return newLeaf;
    }

    // 2. Locate target leaf to split
    let targetNode = null;
    if (targetWindowId) {
      targetNode = this.findLeaf(targetWindowId);
    }
    if (!targetNode) {
      targetNode = this.getRightmostLeaf(this.root);
    }

    // 3. Determine split direction based on target node's dimensions (default or rect)
    const rect = targetNode.window && targetNode.window.rect ? targetNode.window.rect : { w: 800, h: 600 };
    const splitDir = rect.w >= rect.h * 1.1 ? 'v' : 'h';

    // 4. Create internal node replacing targetNode
    const parent = targetNode.parent;
    const internalNode = new DwindleNode('internal');
    internalNode.split = splitDir;
    internalNode.ratio = 0.5;
    internalNode.parent = parent;

    // Attach existing targetNode as left, newLeaf as right
    internalNode.left = targetNode;
    internalNode.right = newLeaf;
    targetNode.parent = internalNode;
    newLeaf.parent = internalNode;

    // Link back to grandparent or root
    if (!parent) {
      this.root = internalNode;
    } else {
      if (parent.left === targetNode) {
        parent.left = internalNode;
      } else {
        parent.right = internalNode;
      }
    }

    return newLeaf;
  }

  /**
   * Remove a window from the tree and rebalance sibling node to take up parent space.
   */
  removeWindow(windowId) {
    const leaf = this.findLeaf(windowId);
    if (!leaf) return null;

    // Case 1: Tree only has 1 window (root is leaf)
    if (this.root === leaf) {
      this.root = null;
      return null;
    }

    const parent = leaf.parent;
    const sibling = parent.left === leaf ? parent.right : parent.left;
    const grandparent = parent.parent;

    sibling.parent = grandparent;
    if (!grandparent) {
      this.root = sibling;
    } else {
      if (grandparent.left === parent) {
        grandparent.left = sibling;
      } else {
        grandparent.right = sibling;
      }
    }

    // Return the sibling leaf or rightmost leaf to focus
    return this.getRightmostLeaf(sibling);
  }

  /**
   * Toggle split direction of parent node (SUPER + J togglesplit)
   */
  toggleSplit(windowId) {
    const leaf = this.findLeaf(windowId);
    if (!leaf || !leaf.parent) return false;
    leaf.parent.split = leaf.parent.split === 'v' ? 'h' : 'v';
    return true;
  }

  /**
   * Find leaf node matching window ID
   */
  findLeaf(windowId, node = this.root) {
    if (!node) return null;
    if (node.isLeaf()) {
      return node.window && node.window.id === windowId ? node : null;
    }
    return this.findLeaf(windowId, node.left) || this.findLeaf(windowId, node.right);
  }

  getRightmostLeaf(node) {
    if (!node) return null;
    if (node.isLeaf()) return node;
    return this.getRightmostLeaf(node.right) || this.getRightmostLeaf(node.left);
  }

  getAllWindows(node = this.root, acc = []) {
    if (!node) return acc;
    if (node.isLeaf()) {
      if (node.window) acc.push(node.window);
      return acc;
    }
    this.getAllWindows(node.left, acc);
    this.getAllWindows(node.right, acc);
    return acc;
  }

  /**
   * Compute geometric layout rectangles for all leaves given bounding box & gaps.
   * gapsOut: outer margin
   * gapsIn: inner spacing between windows
   */
  calculateLayout(bounds, gapsIn = 5, gapsOut = 10) {
    const rects = [];
    if (!this.root) return rects;

    // Apply outer gaps
    const area = {
      x: bounds.x + gapsOut,
      y: bounds.y + gapsOut,
      w: Math.max(100, bounds.w - gapsOut * 2),
      h: Math.max(100, bounds.h - gapsOut * 2)
    };

    const traverse = (node, box) => {
      if (!node) return;
      if (node.isLeaf()) {
        const r = {
          window: node.window,
          x: Math.round(box.x),
          y: Math.round(box.y),
          w: Math.round(box.w),
          h: Math.round(box.h)
        };
        if (node.window) node.window.rect = r;
        rects.push(r);
        return;
      }

      if (node.split === 'v') {
        // Vertical split (Left and Right)
        const leftWidth = Math.max(50, (box.w - gapsIn) * node.ratio);
        const rightWidth = Math.max(50, box.w - gapsIn - leftWidth);
        traverse(node.left, { x: box.x, y: box.y, w: leftWidth, h: box.h });
        traverse(node.right, { x: box.x + leftWidth + gapsIn, y: box.y, w: rightWidth, h: box.h });
      } else {
        // Horizontal split (Top and Bottom)
        const topHeight = Math.max(50, (box.h - gapsIn) * node.ratio);
        const bottomHeight = Math.max(50, box.h - gapsIn - topHeight);
        traverse(node.left, { x: box.x, y: box.y, w: box.w, h: topHeight });
        traverse(node.right, { x: box.x, y: box.y + topHeight + gapsIn, w: box.w, h: bottomHeight });
      }
    };

    traverse(this.root, area);
    return rects;
  }

  /**
   * Swap two windows in the tree (swaps window payloads of leaf nodes)
   */
  swapWindows(windowIdA, windowIdB) {
    const leafA = this.findLeaf(windowIdA);
    const leafB = this.findLeaf(windowIdB);
    if (!leafA || !leafB || leafA === leafB) return false;
    const tempWin = leafA.window;
    leafA.window = leafB.window;
    leafB.window = tempWin;
    return true;
  }

  /**
   * Move / swap window in a given direction ('left', 'right', 'up', 'down')
   */
  moveWindowDirection(windowId, direction) {
    const leaf = this.findLeaf(windowId);
    if (!leaf || !leaf.window || !leaf.window.rect) return null;

    const allLeaves = [];
    const collect = (n) => {
      if (!n) return;
      if (n.isLeaf() && n.window && n.window.rect) allLeaves.push(n);
      else {
        collect(n.left);
        collect(n.right);
      }
    };
    collect(this.root);

    if (allLeaves.length <= 1) return null;

    const cur = leaf.window.rect;
    const curCx = cur.x + cur.w / 2;
    const curCy = cur.y + cur.h / 2;

    let bestNeighbor = null;
    let minDistance = Infinity;

    for (const other of allLeaves) {
      if (other.window.id === windowId) continue;
      const r = other.window.rect;
      const oCx = r.x + r.w / 2;
      const oCy = r.y + r.h / 2;

      let isMatch = false;
      if (direction === 'left' && oCx < curCx) isMatch = true;
      else if (direction === 'right' && oCx > curCx) isMatch = true;
      else if (direction === 'up' && oCy < curCy) isMatch = true;
      else if (direction === 'down' && oCy > curCy) isMatch = true;

      if (isMatch) {
        const dx = oCx - curCx;
        const dy = oCy - curCy;
        const dist = Math.hypot(dx, dy);
        if (dist < minDistance) {
          minDistance = dist;
          bestNeighbor = other;
        }
      }
    }

    if (bestNeighbor) {
      this.swapWindows(windowId, bestNeighbor.window.id);
      return bestNeighbor.window.id;
    }
    return null;
  }

  /**
   * Serialize tree topology to JSON-friendly object
   */
  serialize(node = this.root) {
    if (!node) return null;
    if (node.isLeaf()) {
      return {
        type: 'leaf',
        windowId: node.window ? node.window.id : null
      };
    }
    return {
      type: 'internal',
      split: node.split,
      ratio: node.ratio,
      left: this.serialize(node.left),
      right: this.serialize(node.right)
    };
  }

  /**
   * Deserialize tree topology from JSON object given a windowMap
   */
  static deserialize(data, windowMap = {}) {
    const tree = new DwindleTree();
    if (!data) return tree;

    const build = (nodeData, parent = null) => {
      if (!nodeData) return null;
      const node = new DwindleNode(nodeData.type);
      node.parent = parent;
      if (nodeData.type === 'leaf') {
        node.window = windowMap[nodeData.windowId] || null;
        return node;
      }
      node.split = nodeData.split || 'v';
      node.ratio = nodeData.ratio !== undefined ? nodeData.ratio : 0.5;
      node.left = build(nodeData.left, node);
      node.right = build(nodeData.right, node);
      return node;
    };

    tree.root = build(data, null);
    return tree;
  }
}

// Export for browser usage
window.DwindleTree = DwindleTree;
window.DwindleNode = DwindleNode;
