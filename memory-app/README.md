# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## How to Run This App

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation
1. Open a terminal and navigate to this `memory-app` directory.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
Start the app locally with:
```bash
npm run dev
```

This will start the Vite development server. By default, you can access the app at [http://localhost:5173/](http://localhost:5173/).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Planned Feature: Weak Areas Analysis & Targeted Practice

### Overview
- The app will track your performance for each digit (0–9) and each sound/letter in the Major System.
- An "Analysis" or "Progress" page will show your accuracy and attempts for each digit/sound, helping you identify strengths and weaknesses.
- You will be able to start a "Practice Weak Areas" session, which focuses on the digits/sounds where your accuracy is lowest.

### How it will work
- Every answer you give will be recorded (locally or in the cloud).
- The analysis page will display stats and visualizations for your performance.
- The targeted practice mode will help you improve your weakest areas efficiently.

---

*This feature is planned for a future update. If you want to contribute or prioritize this, please open an issue or pull request!*
