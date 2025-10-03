// Core UI Components
export { Button, buttonVariants, type ButtonProps } from './components/ui/button';
export { Input, type InputProps } from './components/ui/input';
export { Label } from './components/ui/label';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';

// Utilities
export { cn } from './lib/utils';

// Animations
export {
  fadeIn,
  slideUp,
  scale,
  slideInRight,
  getReducedMotionVariants,
  type AnimationCustomProps,
} from './lib/animations';

// Hooks
export { useReducedMotion } from './lib/use-reduced-motion';
