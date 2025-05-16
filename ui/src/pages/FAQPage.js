import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const faqData = [
    {
        question: "How can I get in touch?",
        answer: "You can reach me at hello@seth.haus.",
    },
    {
        question: "Who built this site?",
        answer: "My name is Seth Bindernagel. I am a marketing professional with limited software development skills, but a lot of product and marketing experience working at technology companies like Mozilla, Twitter, and Strava. You can find my LinkedIn profile here: https://www.linkedin.com/in/sethbindernagel/",
    },
    {
        question: "Why did you build this?",
        answer: "I built this triathlon store prototype to prove to myself that I could build a functioning ecommerce prototype without the help of a developer.",
    },
    {
        question: "What tools did you use?",
        answer: "I used React, Vite, Netlify, and Commerce Layer to build this prototype.",
    },
    // Add more FAQ items here if needed
];
export default function FAQPage() {
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Frequently Asked Questions" }), _jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: faqData.map((item, index) => (_jsxs(AccordionItem, { value: `item-${index}`, children: [_jsx(AccordionTrigger, { className: "text-lg font-semibold", children: item.question }), _jsx(AccordionContent, { className: "text-base text-muted-foreground", children: item.question === "Who built this site?" ? (_jsxs("p", { children: ["My name is Seth Bindernagel. I am a marketing professional with limited software development skills, but a lot of product and marketing experience working at technology companies like Mozilla, Twitter, and Strava. You can find my LinkedIn profile here: ", _jsx("a", { href: "https://www.linkedin.com/in/sethbindernagel/", target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline", children: "https://www.linkedin.com/in/sethbindernagel/" })] })) : (_jsx("p", { children: item.answer })) })] }, index))) })] }));
}
