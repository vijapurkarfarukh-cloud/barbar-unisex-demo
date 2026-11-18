# The Barber Unisex — client demo

A static, front-end-only demo website for **The Barber Unisex**, a unisex salon in Shivane, Pune. It is meant to show a client how online booking, a live queue and reminders could look. It is **not** the official website of the salon, and it does not take real appointments.

The folder and GitHub repository name is `barbar-unisex-demo` (as approved). The name shown on the site is **The Barber Unisex**.

## What’s on the page

- Black and gold premium design (near-black backgrounds, gold headings and buttons). No pink.
- Hero with Call, Book, WhatsApp and Directions.
- Clickable phone mock-up:
  1. Booking flow — service → stylist → time slot → confirmation
  2. Live queue — now serving, your position, estimated wait (animated sample data)
  3. WhatsApp-style reminder mock
- Sample service menu with clearly labelled sample prices
- Gallery of real haircuts from the salon’s Google listing (“Our work”)
- Google rating only (4.2 from 5 reviews) — no invented written testimonials
- Address, phone and daily hours

Nothing in the booking form, queue or reminder is sent anywhere.

## Facts used

- **Address:** NDA Rd, Shivtirth Nagar, Dangat Patil Nagar, Shivane, Pune 411023
- **Phone:** +91 80907 13927
- **Hours:** 8:30 AM–10:00 PM daily
- **Rating:** 4.2 from 5 Google reviews

Stylist names and prices are placeholders for the demo.

## How to view it

Open `index.html` in a browser, or serve the folder (for example `python3 -m http.server`) so paths resolve the same way they will on GitHub Pages.

The site uses only relative paths, so it works at a Pages subpath. `.nojekyll` is included so GitHub Pages will not process the folder with Jekyll.

## Photographs

Hero, shopfront and gallery images are from the salon’s Google listing, compressed to under about 250 KB each.

## Built with

Plain HTML, CSS and JavaScript. Fonts (Playfair Display and DM Sans) are self-hosted in `assets/fonts/`.
