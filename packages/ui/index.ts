// Core UI Components
export { Button, buttonVariants, type ButtonProps } from './src/components/ui/button';
export { Input, type InputProps } from './src/components/ui/input';
export { Label } from './src/components/ui/label';
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
} from './src/components/ui/select';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
  type CardProps,
} from './src/components/ui/card';
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
} from './src/components/ui/dialog';

// Link component
export { Link, linkVariants, type LinkProps } from './src/components/ui/Link';

// Section Header component
export {
  SectionHeader,
  sectionHeaderVariants,
  sectionDescriptionVariants,
  type SectionHeaderProps,
} from './src/components/ui/section-header';

// Utilities
export { cn } from './src/lib/utils';

// Animations
export {
  fadeIn,
  slideUp,
  scale,
  slideInRight,
  getReducedMotionVariants,
  type AnimationCustomProps,
} from './src/lib/animations';

// Hooks
export { useReducedMotion } from './src/lib/use-reduced-motion';
