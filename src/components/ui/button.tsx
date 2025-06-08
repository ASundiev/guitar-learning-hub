import * as React from "react";
import { cn } from "./utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:transform hover:-translate-y-0.5";
    
    const variantStyles = {
      default: { 
        background: 'linear-gradient(135deg, #ff6b35 0%, #e53e3e 100%)', 
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
      },
      destructive: { 
        backgroundColor: 'var(--destructive)', 
        color: 'var(--destructive-foreground)',
        border: '1px solid var(--destructive)'
      },
      outline: { 
        border: '1px solid var(--border)', 
        backgroundColor: 'var(--card)', 
        color: 'var(--foreground)' 
      },
      secondary: { 
        backgroundColor: 'var(--secondary)', 
        color: 'var(--secondary-foreground)',
        border: '1px solid var(--border)'
      },
      ghost: { 
        backgroundColor: 'transparent', 
        color: 'var(--foreground)',
        border: '1px solid transparent'
      },
      link: { 
        backgroundColor: 'transparent', 
        color: 'var(--primary)', 
        textDecoration: 'underline',
        border: '1px solid transparent'
      },
    };
    
    const sizeClasses = {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 py-1.5 text-xs",
      lg: "h-10 px-6 py-2.5",
      icon: "h-9 w-9",
    };
    
    const classes = cn(
      baseClasses,
      sizeClasses[size],
      className
    );
    
    if (asChild) {
      return React.cloneElement(props.children as React.ReactElement, {
        className: classes,
        style: variantStyles[variant],
        ref,
        ...props
      });
    }
    
    return (
      <button
        className={classes}
        style={variantStyles[variant]}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };