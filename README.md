# Immigration Court Hearing Reminder App

A bilingual, accessible web app to help immigrants in removal proceedings receive timely court hearing reminders via email. Built with **Next.js**, **MongoDB**, and **SendGrid**, this app is designed for use through pro bono services, community orgs, and directly by individuals facing immigration court dates. In a practical setting, the respondent in question would be notified and integrated to the reminder system after they have received their hearing date in court.

This project was built by an individual named Reinaldo with the support of AI-assisted development using OpenAI’s ChatGPT.

All core design, direction, and social-legal context were created by a human. ChatGPT was used as a development assistant — helping to implement features, debug errors, and accelerate technical learning during development.
---

## Features

**Multilingual Support**: English and Spanish  
**Email Reminders**: Sends confirmation email upon hearing date submission  
**Date Awareness**: Formats court dates in human-readable language  
**Court-Specific Guidance**: Includes EOIR hotline and disclaimer  
**Secure Data Storage**: MongoDB Atlas integration  
**Open Source**: Customizable for clinics or pro bono services

---

## The Purpose Behind This Project

Immigrants in removal proceedings often struggle to track court dates — especially with paper-only notifications. This app is:

- Lightweight and easy to use at court or clinics
- Notifies individuals with clear, actionable info
- Designed to support trust, not replace legal advice

>Includes a disclaimer and reminder to confirm court dates via EOIR hotline.

---

## Tech Stack

- **Frontend**: Next.js / React
- **Backend**: API Routes (Node.js)
- **Database**: MongoDB Atlas
- **Email Service**: SendGrid
- **Deployment**: Vercel

---

## Live Demo

🔗 [https://hearing-date-reminder.vercel.app](https://hearing-date-reminder.vercel.app)

---

## Environment Variables

To run locally, create a `.env.local` file with:

```env
SENDGRID_API_KEY=your_sendgrid_api_key
MONGODB_URI=your_mongodb_connection_string
