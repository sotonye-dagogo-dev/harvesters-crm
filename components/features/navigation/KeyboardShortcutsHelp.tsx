"use client";

import Modal from "@/components/ui/Modal";
import { KeyOutlined } from "@ant-design/icons";
import { useState } from "react";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    keys: ["Tab"],
    description: "Navigate forward through interactive elements",
    category: "Navigation",
  },
  {
    keys: ["Shift", "Tab"],
    description: "Navigate backward through interactive elements",
    category: "Navigation",
  },
  {
    keys: ["Enter"],
    description: "Activate buttons and links",
    category: "Navigation",
  },
  {
    keys: ["Space"],
    description: "Activate buttons and checkboxes",
    category: "Navigation",
  },
  {
    keys: ["Escape"],
    description: "Close modals and dialogs",
    category: "Navigation",
  },
  {
    keys: ["?"],
    description: "Show keyboard shortcuts help",
    category: "Navigation",
  },

  // Forms
  {
    keys: ["Ctrl", "Enter"],
    description: "Submit forms",
    category: "Forms",
  },

  // Lists & Tables
  {
    keys: ["↑", "↓"],
    description: "Navigate through list items",
    category: "Lists",
  },
  {
    keys: ["Home"],
    description: "Go to first item",
    category: "Lists",
  },
  {
    keys: ["End"],
    description: "Go to last item",
    category: "Lists",
  },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, KeyboardShortcut[]>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-ds-brand-accent text-white rounded-full shadow-lg hover:bg-ds-brand-accent/90 transition-all flex items-center justify-center"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Press ?)"
      >
        <KeyOutlined className="text-lg" />
      </button>

      <Modal
        title="Keyboard Shortcuts"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-ds-text-primary mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-ds-border-subtle last:border-0"
                  >
                    <span className="text-ds-text-secondary">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-ds-text-primary bg-ds-surface-sunken border border-ds-border-strong rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 bg-ds-chart-1/5 border border-blue-200 rounded">
            <p className="text-sm text-ds-chart-1">
              <strong>Tip:</strong> Press{" "}
              <kbd className="px-1 py-0.5 text-xs font-semibold bg-white border border-blue-300 rounded">
                ?
              </kbd>{" "}
              at any time to see these shortcuts.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
