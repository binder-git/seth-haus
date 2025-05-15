import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "How can I get in touch?",
    answer: "You can reach me at hello@seth.haus.",
  },
  {
    question: "Who built this site?",
    answer:
      "My name is Seth Bindernagel. I am a marketing professional with limited software development skills, but a lot of product and marketing experience working at technology companies like Mozilla, Twitter, and Strava. You can find my LinkedIn profile here: https://www.linkedin.com/in/sethbindernagel/",
  },
  {
    question: "Why did you build this?",
    answer:
      "I built this triathlon store prototype to prove to myself that I could build a functioning ecommerce prototype without the help of a developer.",
  },
  {
    question: "What tools did you use?",
    answer:
      "I used React, Vite, Netlify, and Commerce Layer to build this prototype.",
  },
  // Add more FAQ items here if needed
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible className="w-full">
        {faqData.map((item, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-lg font-semibold">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
              {/* Render links properly if answer contains one */}
              {item.question === "Who built this site?" ? (
                 <p>
                  My name is Seth Bindernagel. I am a marketing professional with limited software development skills, but a lot of product and marketing experience working at technology companies like Mozilla, Twitter, and Strava. You can find my LinkedIn profile here: <a href="https://www.linkedin.com/in/sethbindernagel/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.linkedin.com/in/sethbindernagel/</a>
                 </p>
              ) : (
                 <p>{item.answer}</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
