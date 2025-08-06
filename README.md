# Staff Hub

This repository contains a Vite + React application for managing your team, leads,
resources and commissions. It has been refactored to remove all dependencies on
Base44 and instead uses [Supabase](https://supabase.com/) for data storage and
authentication. All features are self‑hosted, so you can run the hub locally or
deploy it to your own server without relying on external services.

## Running the app

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Make sure you have the following environment variables defined (e.g. in a
`.env` file) with your Supabase project details:

```bash
# Supabase project URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase anon/public API key
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Building the app

To create an optimized production build:

```bash
npm run build
```

The build output will be generated in the `dist` directory. You can serve it
with any static file server.

## Support

This project is maintained by your team. For questions or contributions,
open an issue or submit a pull request.