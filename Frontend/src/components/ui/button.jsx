import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

const variantClasses = {
    default: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-opacity-75 disabled:opacity-50 disabled:pointer-events-none",
    destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-opacity-75 disabled:opacity-50 disabled:pointer-events-none",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-opacity-75 disabled:opacity-50 disabled:pointer-events-none",
    secondary: "bg-blue-100 text-blue-800 shadow-sm hover:bg-blue-200 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-opacity-75 disabled:opacity-50 disabled:pointer-events-none",
    ghost: "bg-transparent text-blue-700 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-opacity-75 disabled:opacity-50 disabled:pointer-events-none",
    link: "text-blue-600 underline underline-offset-2 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none",
};

const sizeClasses = {
    default: "h-9 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2",
    sm: "h-8 px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center justify-center gap-1.5",
    lg: "h-10 px-6 py-2.5 rounded-md text-base font-medium inline-flex items-center justify-center gap-2",
    icon: "h-9 w-9 rounded-md inline-flex items-center justify-center",
};

function Button({
    className = "",
    variant = "default",
    size = "default",
    asChild = false,
    ...props
}) {
    const Comp = asChild ? Slot : "button";

    const variantClass = variantClasses[variant] || variantClasses.default;
    const sizeClass = sizeClasses[size] || sizeClasses.default;

    return (
        <Comp
            data-slot="button"
            className={`${variantClass} ${sizeClass} outline-none focus-visible:outline-none ${className}`}
            {...props}
        />
    );
}

export { Button };
