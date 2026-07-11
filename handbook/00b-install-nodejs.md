# Chapter 2: Installing Node.js & npm

## Metadata
* **Part**: Phase 0: Prerequisites
* **Learning Objectives**:
  - Download and install Node.js
  - Verify Node.js and npm are working
  - Understand what npm does
* **Prerequisites**:
  - Chapter 0A: Your Computer's Command Line
* **Estimated Reading Time**: 10 mins
* **Difficulty Level**: Absolute Beginner

---

## 1. Why This Matters
Node.js is the engine that runs JavaScript outside the browser. npm is the package manager that installs tools like Playwright. Without these two, nothing works.

---

## 2. Conceptual Overview
Node.js is a program that lets you run JavaScript on your computer (not just in a web browser). npm (Node Package Manager) comes bundled with Node.js and is the tool that downloads and installs libraries and frameworks.

Installation steps:

1. Go to https://nodejs.org
2. Download the LTS (Long Term Support) version — it is the stable, recommended version.
3. Run the installer. Accept all default options. Click "Next" through every screen.
4. When installation completes, close and reopen your terminal (this is important!).
5. Verify the installation by typing two commands.

What is npm?
- npm is like an app store for JavaScript code.
- When you type npm install playwright, npm downloads Playwright from the internet and saves it in your project folder.
- The downloaded packages go into a folder called node_modules.
- The list of what you installed is saved in a file called package.json.

### Execution Flow Diagram
```
[nodejs.org] ──► Download Installer ──► Run Setup ──► node and npm available in terminal
```

---

## 3. Implementation and Code Examples
```typescript
# After installing Node.js, open a NEW terminal window and type:

node -v
# Expected output: v20.x.x (or similar version number)

npm -v
# Expected output: 10.x.x (or similar version number)

# If both commands show version numbers, you are ready!
# If you see "command not found", close the terminal, reopen it, and try again.
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Always download the LTS version from nodejs.org.
* Reopen your terminal after installing Node.js.

### Don't
* Do not install the "Current" version — it may have unstable features.
* Do not skip the verification step (node -v and npm -v).

---

## 5. Chapter Summary
* Node.js lets you run JavaScript on your computer.
* npm downloads and installs packages like Playwright.
* Always verify installation with node -v and npm -v.

---

## 6. Exercises & Mini-Project

### Exercises
1. Install Node.js and verify the version numbers appear in your terminal.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
# Exercise 1 Solution:
node -v
# Output: v20.15.0 (your version may differ)
npm -v
# Output: 10.7.0 (your version may differ)
```

</details>

2. Run node -e "console.log(2 + 3)" in your terminal and observe the output.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
# Exercise 2 Solution:
node -e "console.log(2 + 3)"
# Output: 5
# This proves Node.js can execute JavaScript from your terminal!
```

</details>

### Mini-Project
Create a new folder, navigate into it, and run npm init -y to generate a package.json file. Open the file and read its contents.

<details>
<summary>💡 Mini-Project Solution</summary>

```
# Mini-Project Solution:
mkdir my-first-project
cd my-first-project
npm init -y
# Output: Wrote to .../package.json
# Open the file to see: { "name": "my-first-project", "version": "1.0.0", ... }
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Navigate into your `todomvc-automation` folder and initialize it as a Node.js project:
```
cd todomvc-automation
npm init -y
```
This creates `package.json` — the file that tracks your project dependencies.

---

## 8. Interview Q&A Preparation

**Q1: What is the difference between Node.js and npm?**
* **Expected Answer:** Node.js is the JavaScript runtime engine. npm is the package manager that comes with Node.js, used to install third-party libraries and tools.


---

## 9. Chapter Cheat Sheet
```
node -v         # Check Node version\nnpm -v          # Check npm version\nnpm init -y     # Create package.json\nnpm install pkg # Install a package
```