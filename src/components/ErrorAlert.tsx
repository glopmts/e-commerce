import {
  AlertCircle,
  CheckCircle2,
  Info,
  Terminal,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export interface ErrorAlertProps {
  variant?: "default" | "destructive" | "warning" | "success" | "info";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

const ErrorAlert = ({
  variant = "default",
  title = "Heads up!",
  description = "You can add components and dependencies to your app using the cli.",
  icon,
  className,
}: ErrorAlertProps) => {
  const defaultIcons = {
    default: <Terminal className="h-4 w-4" />,
    destructive: <XCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  const alertIcon = icon || defaultIcons[variant];

  return (
    <Alert variant={variant} className={className}>
      {alertIcon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
