---
trigger: always_on
---

## SESSION START
1. Read tasks/lessons.md — apply all lessons before touching anything
2. Read tasks/todo.md — understand current state
3. If neither exists, create them before starting

---

## WORKFLOW

### 1. Mandatory Planning (STRICT RULE)
- ALWAYS enter plan mode before executing any non-trivial task (3+ steps)
- EVEN for moderately simple tasks, prefer planning first
- Write the full plan to tasks/todo.md BEFORE doing anything

🚫 CRITICAL RULE:
- NO CODE should be written or modified until the plan is explicitly approved by the user
- If not approved → WAIT
- Never assume approval

---

### 2. Plan First
- Break task into clear, minimal steps
- Identify risks, dependencies, and assumptions
- Keep plan simple and elegant
- If something fails → STOP and re-plan (do NOT push forward blindly)

---

### 3. Subagent Strategy
- Use subagents to keep main context clean
- One task per subagent
- Use for:
  - Complex debugging
  - Large codebase analysis
  - Parallelizable tasks
  - Heavy computation/reasoning

---

### 4. Self-Improvement Loop
- After any bug, mistake, or correction:
  - Update tasks/lessons.md

Format:
[date]
Issue:
Root Cause:
Fix Applied:
Prevention Rule:

- Review lessons at EVERY session start

---

### 5. Verification Standard (Definition of Done)
Never mark complete unless ALL are satisfied:

- Code runs without errors
- Edge cases tested
- Logs checked (no silent failures)
- Output matches expected behavior
- No debug/temp code remains

Ask:
👉 "Would a staff engineer approve this?"

---

### 6. Demand Elegance
- Always prefer the simplest correct solution
- If a fix feels hacky → redesign properly
- Avoid over-engineering simple problems

---

### 7. Autonomous Bug Fixing
- When given a bug:
  - Go to logs
  - Identify root cause (NOT symptoms)
  - Fix cleanly
- No unnecessary back-and-forth

---

### 8. Failure Protocol
If anything goes wrong:

1. STOP immediately
2. Capture exact error/log
3. Identify root cause
4. Document in tasks/todo.md
5. Re-plan BEFORE retrying

---

### 9. Pre-Execution Validation
Before writing or modifying code:

- Verify file paths exist
- Verify APIs and dependencies
- Confirm assumptions are correct
- Never assume anything without checking

---

## CORE PRINCIPLES

- Simplicity First → minimal changes only
- No Laziness → fix root causes, no temporary hacks
- Never Assume → verify everything
- Ask Once → only one clarification upfront if needed

---

## TASK MANAGEMENT

1. Plan → write to tasks/todo.md
2. Verify → confirm plan before execution
3. Execute → ONLY after approval
4. Track → mark steps complete as you go
5. Explain → give high-level summary per step
6. Learn → update tasks/lessons.md after mistakes

---

## LEARNED
(Continuously updated in tasks/lessons.md)