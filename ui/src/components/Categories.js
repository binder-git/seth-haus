import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom"; // Import Link
export const Categories = ({ className = "" }) => {
    const categories = [
        {
            id: "swim",
            name: "Swim",
            description: "Wetsuits, goggles, and accessories for open water and pool training",
            image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            id: "bike",
            name: "Bike",
            description: "Triathlon bikes, components, and cycling gear for speed and endurance",
            image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            id: "run",
            name: "Run",
            description: "Running shoes, apparel, and accessories designed for triathletes",
            image: "https://images.unsplash.com/photo-1502904550040-7534597429ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
        },
        {
            id: "triathlon",
            name: "Triathlon",
            description: "Specialized triathlon gear, race suits, and transition equipment",
            image: "https://images.unsplash.com/photo-1489396160836-2c99c977e970?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        }
    ];
    return (_jsx("section", { className: `py-16 ${className}`, children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsx("h2", { className: "text-3xl font-bold mb-2", children: "Shop by Category" }), _jsx("p", { className: "text-muted-foreground mb-8", children: "Specialized gear for every discipline" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: categories.map((category) => (_jsxs("div", { className: "group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" }), _jsx("img", { src: category.image, alt: category.name, className: "w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" }), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-6 z-20", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-2", children: category.name }), _jsx("p", { className: "text-white/80 mb-4", children: category.description }), _jsxs(Link, { to: `/products?category=${category.id}`, className: "inline-block px-4 py-2 bg-white text-primary rounded-md font-medium hover:bg-white/90 transition-colors", children: ["Browse ", category.name] })] })] }, category.id))) })] }) }));
};
