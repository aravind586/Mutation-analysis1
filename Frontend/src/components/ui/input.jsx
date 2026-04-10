import * as React from "react";

function Input({ className = "", type, ...props }) {
    return (
        <input
            type={type}
            data-slot="input"
            className={
                "file:text-foreground placeholder:text-muted-foreground selection:bg-blue-500 selection:text-white " +
                "bg-white border border-blue-300 flex h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-sm transition-colors outline-none " +
                "focus:border-blue-600 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 " +
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 " +
                "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium " +
                "md:text-sm " +
                (className ? className : "")
            }
            {...props}
        />
    );
}

export { Input };
