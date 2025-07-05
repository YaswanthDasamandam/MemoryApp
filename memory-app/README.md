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

### To deploy 

```bash
npm run deploy
```

This will start the Vite development server. By default, you can access the app at [http://localhost:5173/](http://localhost:5173/).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Memory Training App Features

This app is designed to help you improve your memory using various mnemonic techniques. It includes three main stages:

### Stage 1: Major System Practice
- Practice converting numbers to words using the Major System
- Multiple practice modes: Number-to-Word, Word-to-Number, and Mixed
- Track your progress and accuracy

### Stage 2: Word Management
- Create and manage your personal word associations for numbers 0-99
- Add, edit, and remove words for each number
- Practice recalling your custom word associations
- Import/export your word data

### Stage 3: Person-Object-Action (POA) System
The POA system is an advanced memory technique that helps you remember numbers by creating vivid mental images involving a person, an object, and an action.

#### POA Management Page
- **Grid View**: Browse all numbers (0-99) and see your POA entries
- **Add POAs**: Click any number to add a new Person-Object-Action combination
- **Edit POAs**: Modify existing POA entries with new people, objects, or actions
- **Remove POAs**: Delete POA entries you no longer need
- **Data Management**: Import/export your POA data for backup or sharing

#### POA Practice Mode
- **Number-to-POA**: Practice recalling the Person-Object-Action for a given number
- **POA-to-Number**: Practice recalling the number for a given Person-Object-Action
- **Strict Mode**: Practice only with numbers that have saved POA entries
- **Score Tracking**: Monitor your accuracy and progress
- **Flexible Input**: Partial matches are accepted (e.g., just the person's name)

#### How POA Works
1. **Person**: Choose a memorable person (real or fictional)
2. **Object**: Select a distinctive object
3. **Action**: Create a vivid action connecting the person and object

Example: For number 23, you might create "Einstein (Person) → Telescope (Object) → Looking through (Action)"

This creates a memorable mental image that's easier to recall than abstract numbers.

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
