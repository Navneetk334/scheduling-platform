/**
 * @invincible/ui — the INVINCIBLE PROS design system. Original, accessible,
 * Radix-based primitives styled with the shared Tailwind preset/tokens.
 */

export { cn } from './lib/cn';

export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Input, type InputProps } from './components/input';
export { Label } from './components/label';
export { Field, type FieldProps } from './components/field';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/card';
export { Badge, badgeVariants, type BadgeProps } from './components/badge';
export { Alert, AlertTitle, AlertDescription, type AlertProps } from './components/alert';
export { Avatar, AvatarImage, AvatarFallback } from './components/avatar';
export { Spinner, type SpinnerProps } from './components/spinner';
export { Skeleton } from './components/skeleton';
export { Logo, type LogoProps } from './components/logo';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/tabs';
export { Switch } from './components/switch';
export { Separator } from './components/separator';
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './components/table';
export {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from './components/tooltip';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './components/dropdown-menu';
