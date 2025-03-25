"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "./UI/navbar-menu";

export default function Navbar({
  className
}) {
  const [active, setActive] = useState(null);
  return (
    (<div
      className="fixed top-10 inset-x-0 max-w-2xl mx-auto z-50 flex">
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Services">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/">Order Now</HoveredLink>
            <HoveredLink href="/backends">Listing of Order</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Products">
          <div className=" text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Stripe"
              href="https://stripe.com/in"
              src="https://static.tildacdn.com/tild3332-6431-4536-b461-356361346362/Screen_Shot_2022-03-.png"
              description="Used for making payment integration." />
            <ProductItem
              title="Tailwind "
              href="https://tailwindcss.com/"
              src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
              description="Production ready Tailwind css components for your next project" />
            <ProductItem
              title="Auth0"
              href="https://auth0.com/"
              src="https://media.licdn.com/dms/image/v2/D4E0BAQFQkZMeSoNlyA/company-logo_200_200/company-logo_200_200/0/1696008983311/auth0_logo?e=2147483647&v=beta&t=0qLmkgXLDdq88fbbNDC1pt13RUfJruTicN4WH1GVUe8"
              description="One stop for all payment." />
            <ProductItem
              title="Aceternity UI"
              href="https://ui.aceternity.com/"
              src="https://www.aceternity.com/_next/image?url=%2Fimages%2Fproducts%2Fthumbnails%2Fnew%2Faceternityui.png&w=1920&q=75"
              description="One stop for all creazy react component." />
          </div>
        </MenuItem>
      </Menu>
    </div>)
  );
}
