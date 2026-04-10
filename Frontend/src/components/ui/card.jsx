// Card wrapper
export function Card({ className = "", ...props }) {
    return (
        <div
            data-slot="card"
            className={`bg-white text-gray-900 flex flex-col gap-8 rounded-2xl border border-blue-300 shadow-lg hover:shadow-xl transition-shadow duration-400 ease-in-out ${className}`}
            {...props}
        />
    );
}

// Card header
export function CardHeader({ className = "", ...props }) {
    return (
        <div
            data-slot="card-header"
            className={`grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-8 py-6 border-b border-blue-200 bg-gradient-to-r from-blue-100 to-white ${className}`}
            {...props}
        />
    );
}

// Card title
export function CardTitle({ className = "", ...props }) {
    return (
        <h2
            data-slot="card-title"
            className={`leading-tight font-extrabold text-2xl tracking-tight text-blue-800 ${className}`}
            {...props}
        />
    );
}

// Card description
export function CardDescription({ className = "", ...props }) {
    return (
        <p
            data-slot="card-description"
            className={`text-gray-600 text-base max-w-prose leading-relaxed ${className}`}
            {...props}
        />
    );
}

// Card action
export function CardAction({ className = "", ...props }) {
    return (
        <div
            data-slot="card-action"
            className={`col-start-2 row-span-2 row-start-1 self-start justify-self-end ${className}`}
            {...props}
        />
    );
}

// Card main content
export function CardContent({ className = "", ...props }) {
    return (
        <div
            data-slot="card-content"
            className={`px-8 py-6 text-gray-800 text-base leading-relaxed ${className}`}
            {...props}
        />
    );
}

// Card footer
export function CardFooter({ className = "", ...props }) {
    return (
        <div
            data-slot="card-footer"
            className={`flex items-center justify-end px-8 py-4 border-t border-blue-200 bg-blue-50 rounded-b-2xl ${className}`}
            {...props}
        />
    );
}
