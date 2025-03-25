"use client";
import React from "react";
import { twMerge } from "tailwind-merge"; // Merges Tailwind class names
import { TracingBeam } from "./tracing-beam"; // Assuming TracingBeam is a component

export default function TracingBeamDemo() {
  return (
    <TracingBeam className="px-6">
      <div className="max-w-2xl mx-auto antialiased pt-4 relative">
        {dummyContent.map((item, index) => (
          <div key={`content-${index}`} className="mb-10">
            <h2 className="bg-black text-white rounded-full text-sm w-fit px-4 py-1 mb-4">
              {item.badge}
            </h2>
            <p className={twMerge( "text-xl mb-4")}>
              {item.title}
            </p>
            <div className="text-sm prose prose-sm dark:prose-invert">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </TracingBeam>
  );
}

const dummyContent = [
  {
    title: "Project Setup",
    description: (
      <>
        <p><b>Choice of Technologies:</b> This project was built using ReactJS for the frontend, with NodeJS and Express powering the backend. These technologies provide a scalable and responsive user experience while making the app easy to maintain and update..
        </p>
        <p>
        <b>UI and Visual Packages:</b> Several additional packages were incorporated to improve the look and feel of the app, including libraries for animations, UI components, and styling tools to ensure a modern, seamless interface.
        </p>
      </>
    ),
    badge: "Created app",
  },
  {
    title: "Homepage Creation",
    description: (
      <>
        <p><b>Backend Data Integration:</b> Designed the homepage to showcase item data fetched from a backend file, creating a dynamic display where users can easily browse available products.</p>
        <p><b>Interactive Layout:</b> The homepage was structured to give users an intuitive experience, with features like item search, filtering, and sorting options for a personalized browsing experience.
        </p>
      </>
    ),
    badge: "Changelog",
  },
  {
    title: "Cart System",
    description: (
      <>
        <p><b>Add to Cart Feature: </b>Implemented a fully interactive cart system that allows users to add items to the cart from the homepage with a single click.
        </p>
        <p><b>Quantity Management:</b></p> Added functionality to increase or decrease the quantity of each item within the cart. Each adjustment dynamically updates the total price, giving users a real-time view of their purchase.
      </>
    ),
    badge: "Changelog",
  },
  {
    title: "Payment Integration",
    description: (
      <>
        <p><b>Stripe Payment Processing:</b></p> Integrated Stripe for secure, seamless payment processing, enabling users to pay directly within the app using their credit cards.
        <p><b>Checkout Flow:</b></p> Designed a smooth checkout flow that guides users through payment steps, ensuring transparency and security with each transaction. Stripe’s robust API was essential for implementing card validation and secure payment handling.
      </>
    ),
    badge: "Changelog",
  },
  {
    title: "User Authentication",
    description: (
      <>
        <p><b>Login System:</b></p> Created a login system that captures essential user information and enhances the user experience by automatically populating details in the checkout form.
        <p><b>Personalized Experience:</b></p> This functionality speeds up the checkout process for returning users, allowing them to skip re-entering information like their name, email, and delivery address with each purchase.
      </>
    ),
    badge: "Changelog",
  },
  {
    title: "Order Data Storage",
    description: (
      <>
        <p><b>Backend Database:</b></p> Established a backend storage system that logs each order placed on the app, recording who ordered what, the order status, and whether the payment was successful.
        <p><b>Data Management: </b></p>This storage approach provides a reliable way to monitor user orders, view payment details, and confirm the status of each transaction, ensuring a robust record-keeping system for future reference.
      </>
    ),
    badge: "Changelog",
  },
  {
    title: "Admin Order Management",
    description: (
      <>
        <p><b>Authenticated Access: </b></p> Built a secure backend route accessible only to authorized users, such as administrators, to manage orders.
        <p><b>Order Dashboard: </b></p> Developed an order management dashboard where admins can view, update, and manage the status of all customer orders, providing a streamlined way to oversee app transactions and customer interactions.

      </>
    ),
    badge: "Launch Week",
  },
];
