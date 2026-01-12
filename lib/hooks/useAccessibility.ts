import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Hook to trap focus within an element (useful for modals, dialogs)
 *
 * @param isActive - Whether the focus trap should be active
 * @returns Ref to attach to the container element
 *
 * @example
 * const modalRef = useFocusTrap(isModalOpen);
 * return <div ref={modalRef}>...</div>
 */
export function useFocusTrap<T extends HTMLElement>(
  isActive: boolean
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when trap activates
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener("keydown", handleTabKey);

    return () => {
      element.removeEventListener("keydown", handleTabKey);
    };
  }, [isActive]);

  return ref;
}

/**
 * Hook to announce messages to screen readers
 *
 * @returns Function to announce message
 *
 * @example
 * const announce = useScreenReaderAnnounce();
 * announce("Item added to cart", "polite");
 */
export function useScreenReaderAnnounce() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement("div");
      announcer.setAttribute("role", "status");
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.className = "sr-only";
      announcer.style.position = "absolute";
      announcer.style.left = "-10000px";
      announcer.style.width = "1px";
      announcer.style.height = "1px";
      announcer.style.overflow = "hidden";
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
        announcerRef.current = null;
      }
    };
  }, []);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (!announcerRef.current) return;

      announcerRef.current.setAttribute("aria-live", priority);
      announcerRef.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = "";
        }
      }, 1000);
    },
    []
  );

  return announce;
}

/**
 * Hook to manage skip links for keyboard navigation
 *
 * @returns Props to spread on skip link and main content
 *
 * @example
 * const { skipLinkProps, mainContentProps } = useSkipLink();
 * return (
 *   <>
 *     <a {...skipLinkProps}>Skip to main content</a>
 *     <main {...mainContentProps}>...</main>
 *   </>
 * );
 */
export function useSkipLink() {
  const mainContentId = "main-content";

  const skipLinkProps = {
    href: `#${mainContentId}`,
    className:
      "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-church-primary focus:text-white focus:rounded",
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const mainContent = document.getElementById(mainContentId);
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: "smooth" });
      }
    },
  };

  const mainContentProps = {
    id: mainContentId,
    tabIndex: -1,
  };

  return { skipLinkProps, mainContentProps };
}

/**
 * Hook to restore focus to a previous element (useful for modals)
 *
 * @param isActive - Whether to save/restore focus
 *
 * @example
 * useFocusReturn(isModalOpen);
 */
export function useFocusReturn(isActive: boolean) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      // Save currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else {
      // Restore focus when deactivated
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isActive]);
}

/**
 * Hook to handle roving tabindex for keyboard navigation in lists
 *
 * @param itemCount - Number of items in the list
 * @param onSelect - Callback when item is selected
 * @returns Current active index and key handler
 *
 * @example
 * const { activeIndex, handleKeyDown } = useRovingTabIndex(items.length, selectItem);
 *
 * items.map((item, index) => (
 *   <button
 *     key={item.id}
 *     tabIndex={activeIndex === index ? 0 : -1}
 *     onKeyDown={handleKeyDown(index)}
 *   >
 *     {item.name}
 *   </button>
 * ));
 */
export function useRovingTabIndex(
  itemCount: number,
  onSelect?: (index: number) => void
) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % itemCount);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(itemCount - 1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onSelect?.(index);
          break;
      }
    },
    [itemCount, onSelect, setActiveIndex]
  );

  return { activeIndex, handleKeyDown };
}
