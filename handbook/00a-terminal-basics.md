# Chapter 1: Your Computer's Command Line

## Metadata
* **Part**: Phase 0: Prerequisites
* **Learning Objectives**:
  - Open a terminal on Windows, Mac, or Linux
  - Navigate folders using cd commands
  - Create files and folders from the command line
* **Prerequisites**:
  - None — this is the starting point
* **Estimated Reading Time**: 15 mins
* **Difficulty Level**: Absolute Beginner

---

## 1. Why This Matters
Every tool you will use — Node.js, npm, Playwright — is controlled from the command line. If you cannot open a terminal and navigate folders, you cannot run a single test.

---

## 2. Conceptual Overview
A terminal (also called a command line, shell, or console) is a text-based interface to your computer. Instead of clicking icons, you type commands.

On Windows, you will use PowerShell. On Mac or Linux, you will use Terminal.

Here are the essential commands you need to know:

1. Opening a terminal:
- Windows: Press the Windows key, type "PowerShell", and click it.
- Mac: Press Cmd + Space, type "Terminal", and press Enter.

2. Navigating folders:
- cd foldername — moves into a folder.
- cd .. — moves back up one level.
- dir (Windows) or ls (Mac/Linux) — lists files in the current folder.

3. Creating things:
- mkdir my-project — creates a new folder called "my-project".
- New-Item hello.txt (Windows) or touch hello.txt (Mac/Linux) — creates an empty file.

4. Understanding paths:
- When you open a terminal, you start in a "home" folder.
- Every file on your computer has an address called a path (like C:\\Users\\you\\Desktop\\file.txt).
- The terminal always shows your current location. This is called the "working directory".

### Execution Flow Diagram
```
You (typing commands)
    │
    ▼
[Terminal / PowerShell / Bash]
    │
    ▼
[Operating System executes the command]
```

---

## 3. Implementation and Code Examples
```typescript
# Step 1: Open your terminal (PowerShell on Windows)

# Step 2: See where you are right now
cd ~

# Step 3: Create a project folder
mkdir playwright-learning

# Step 4: Move into that folder
cd playwright-learning

# Step 5: Verify you are inside the folder
pwd
# Output: C:\Users\YourName\playwright-learning (Windows)
# Output: /Users/YourName/playwright-learning (Mac)

# Step 6: List contents (it will be empty)
dir    # Windows
ls     # Mac/Linux
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Practice navigating folders every day until cd and dir/ls feel natural.
* Always check your current directory with pwd before running commands.

### Don't
* Do not copy-paste commands blindly — type them by hand to build muscle memory.
* Do not panic if you see an error. Read the message carefully — it usually tells you what went wrong.

---

## 5. Chapter Summary
* The terminal is a text-based way to control your computer.
* Use cd to move between folders, dir/ls to list files, and mkdir to create folders.
* Always know your current working directory before running commands.

---

## 6. Exercises & Mini-Project

### Exercises
1. Create a folder called "test-project" inside your home directory, navigate into it, and then navigate back out.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
# Exercise 1 Solution:
mkdir test-project
cd test-project
pwd              # Verify you are inside test-project
cd ..
pwd              # Verify you are back in the parent folder
```

</details>

2. List all files on your Desktop folder using only terminal commands.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
# Exercise 2 Solution (Windows):
cd ~\Desktop
dir

# Exercise 2 Solution (Mac/Linux):
cd ~/Desktop
ls
```

</details>

### Mini-Project
Create the following folder structure using only terminal commands: playwright-learning/tests/, playwright-learning/pages/, playwright-learning/data/.

<details>
<summary>💡 Mini-Project Solution</summary>

```
# Mini-Project Solution:
mkdir playwright-learning
cd playwright-learning
mkdir tests
mkdir pages
mkdir data
dir    # Verify all three folders exist
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Open your terminal and create the project folder that will hold your entire TodoMVC automation project:
```
mkdir todomvc-automation
cd todomvc-automation
pwd
```
This folder will be your home base for the next 32 chapters.

---

## 8. Interview Q&A Preparation

**Q1: Why is the command line important for test automation?**
* **Expected Answer:** All automation tools (Node.js, npm, Playwright) are controlled via CLI commands. CI/CD servers do not have graphical interfaces — everything runs through terminal commands.


---

## 9. Chapter Cheat Sheet
```
cd folder    # Enter folder\ncd ..        # Go back\ndir / ls     # List files\nmkdir name   # Create folder\npwd          # Where am I?
```