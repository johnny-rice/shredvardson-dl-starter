import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Dialog component for modal interactions
 *
 * A modal dialog built on Radix UI that overlays page content and requires
 * user interaction before dismissal. Uses semantic design tokens and includes
 * accessible keyboard navigation and focus management.
 *
 * @usageGuidelines
 * - Use for critical information that requires immediate user attention
 * - Use for confirmations before destructive actions (delete, cancel)
 * - Use for forms that should complete before returning to main content
 * - Avoid for non-critical notifications (use toast instead)
 * - Avoid for content users might want to reference while interacting with page
 * - Keep dialog content concise and focused on a single task
 * - Always provide clear dismiss options (X button, Cancel button, or Esc key)
 *
 * @accessibilityConsiderations
 * - Traps focus within dialog while open (cannot tab outside)
 * - Returns focus to trigger element when closed
 * - Supports Esc key to dismiss
 * - Uses aria-labelledby pointing to DialogTitle
 * - Uses aria-describedby pointing to DialogDescription
 * - Overlay dims background content to indicate modal state
 * - Close button includes sr-only "Close" text for screen readers
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button variant="outline">Open Dialog</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Are you sure?</DialogTitle>
 *       <DialogDescription>
 *         This action cannot be undone.
 *       </DialogDescription>
 *     </DialogHeader>
 *     <DialogFooter>
 *       <Button variant="outline">Cancel</Button>
 *       <Button variant="destructive">Delete</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

/**
 * DialogOverlay - Background overlay for Dialog component
 *
 * Semi-transparent overlay that dims the background content when Dialog is open.
 * Built on Radix UI Dialog.Overlay primitive with smooth fade animations.
 *
 * @param className - Additional CSS classes to merge with base styles
 *
 * @example
 * ```tsx
 * <DialogOverlay />
 * ```
 *
 * @see {@link https://www.radix-ui.com/primitives/docs/components/dialog#overlay | Radix UI Dialog.Overlay}
 * @see {@link DialogContent} - Automatically includes DialogOverlay
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * DialogContent - Main content container for Dialog
 *
 * Centered modal container with overlay, close button, and smooth animations.
 * Automatically includes DialogOverlay and a close button with accessibility support.
 * Built on Radix UI Dialog.Content primitive with focus trap and keyboard handling.
 *
 * @param className - Additional CSS classes to merge with base styles
 * @param children - Dialog content (typically DialogHeader, content, DialogFooter)
 *
 * @example
 * ```tsx
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>Confirm Action</DialogTitle>
 *     <DialogDescription>This action cannot be undone.</DialogDescription>
 *   </DialogHeader>
 *   <p>Are you sure you want to continue?</p>
 *   <DialogFooter>
 *     <Button variant="outline">Cancel</Button>
 *     <Button>Confirm</Button>
 *   </DialogFooter>
 * </DialogContent>
 * ```
 *
 * @example
 * ```tsx
 * // Wider dialog
 * <DialogContent className="max-w-3xl">
 *   <DialogHeader>
 *     <DialogTitle>Large Content</DialogTitle>
 *   </DialogHeader>
 *   <div>Wide content area</div>
 * </DialogContent>
 * ```
 *
 * @see {@link https://www.radix-ui.com/primitives/docs/components/dialog#content | Radix UI Dialog.Content}
 * @see {@link DialogHeader} - For title and description
 * @see {@link DialogFooter} - For action buttons
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="h-4 w-4">
          <path
            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * DialogHeader - Header section of a Dialog
 *
 * Container for DialogTitle and DialogDescription with proper spacing.
 * Text is centered on mobile and left-aligned on larger screens.
 *
 * @param className - Additional CSS classes to merge with base styles
 * @param children - Header content (typically DialogTitle and DialogDescription)
 *
 * @example
 * ```tsx
 * <DialogHeader>
 *   <DialogTitle>Delete Account</DialogTitle>
 *   <DialogDescription>
 *     This action is permanent and cannot be undone.
 *   </DialogDescription>
 * </DialogHeader>
 * ```
 *
 * @see {@link DialogTitle} - For the heading element
 * @see {@link DialogDescription} - For supporting description
 */
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

/**
 * DialogFooter - Footer section of a Dialog
 *
 * Container for action buttons with responsive layout.
 * Stacks vertically on mobile (reversed order) and horizontal on larger screens.
 *
 * @param className - Additional CSS classes to merge with base styles
 * @param children - Footer content (typically action buttons)
 *
 * @example
 * ```tsx
 * <DialogFooter>
 *   <Button variant="outline">Cancel</Button>
 *   <Button variant="destructive">Delete</Button>
 * </DialogFooter>
 * ```
 *
 * @example
 * ```tsx
 * // Single action
 * <DialogFooter>
 *   <Button>Got it</Button>
 * </DialogFooter>
 * ```
 *
 * @see {@link DialogContent} - Parent container
 */
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

/**
 * DialogTitle - Heading element for Dialog
 *
 * Semantic heading for Dialog with proper ARIA labeling.
 * Automatically sets aria-labelledby on DialogContent for accessibility.
 * Built on Radix UI Dialog.Title primitive.
 *
 * @param className - Additional CSS classes to merge with base styles
 * @param children - Title text content
 *
 * @example
 * ```tsx
 * <DialogTitle>Confirm Deletion</DialogTitle>
 * ```
 *
 * @example
 * ```tsx
 * <DialogTitle className="text-destructive">
 *   Warning: Irreversible Action
 * </DialogTitle>
 * ```
 *
 * @see {@link https://www.radix-ui.com/primitives/docs/components/dialog#title | Radix UI Dialog.Title}
 * @see {@link DialogHeader} - Parent container
 * @see {@link DialogDescription} - For supporting description
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * DialogDescription - Supporting description text for Dialog
 *
 * Muted text providing additional context for the Dialog.
 * Automatically sets aria-describedby on DialogContent for accessibility.
 * Built on Radix UI Dialog.Description primitive.
 *
 * @param className - Additional CSS classes to merge with base styles
 * @param children - Description text content
 *
 * @example
 * ```tsx
 * <DialogDescription>
 *   This action cannot be undone. Your data will be permanently deleted.
 * </DialogDescription>
 * ```
 *
 * @example
 * ```tsx
 * <DialogDescription className="text-xs">
 *   Last updated: {new Date().toLocaleDateString()}
 * </DialogDescription>
 * ```
 *
 * @see {@link https://www.radix-ui.com/primitives/docs/components/dialog#description | Radix UI Dialog.Description}
 * @see {@link DialogHeader} - Parent container
 * @see {@link DialogTitle} - For the main heading
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
