import React from "react";
import { Link } from "react-router-dom"; // Import Link

export interface Props {
  className?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const Categories = ({ className = "" }: Props) => {
  const categories: Category[] = [
    {
      id: "swim",
      name: "Swim",
      description: "Wetsuits, goggles, and accessories for open water and pool training",
      image: "/migrated-assets/category-swim.jpg"
    },
    {
      id: "bike",
      name: "Bike",
      description: "Triathlon bikes, components, and cycling gear for speed and endurance",
      image: "/migrated-assets/category-bike.jpg"
    },
    {
      id: "run",
      name: "Run",
      description: "Running shoes, apparel, and accessories designed for triathletes",
      image: "/migrated-assets/category-run.jpg"
    },
    {
      id: "triathlon",
      name: "Triathlon",
      description: "Specialized triathlon gear, race suits, and transition equipment",
      image: "/migrated-assets/category-triathlon.jpg"
    }
  ];

  // Handle image loading errors with fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (!target.src.includes('no-image.jpg')) {
      target.src = '/migrated-assets/no-image.jpg';
    }
  };

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
        <p className="text-muted-foreground mb-8">Specialized gear for every discipline</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                onError={handleImageError}
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-white/80 mb-4">{category.description}</p>
                <Link 
                  to={`/products?category=${category.id}`}
                  className="inline-block px-4 py-2 bg-background text-foreground border border-border rounded-md font-medium hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                >
                  Browse {category.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
