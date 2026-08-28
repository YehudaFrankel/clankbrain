# Comment All Code Changes

Every code change must have a clear, short comment explaining what it does.

**Applies to:** Java, JS, HTML, CSS, SQL — every file, every change.

**Does NOT apply to:** memory files, `.claude/` rules/skills/settings files.

## Rules

- One-line comment above every new block of code
- Even "obvious" changes get a comment — what's obvious today isn't obvious in 6 months
- Comments explain WHAT the change does, not WHY it was added (the WHY belongs in the commit message)
- No session numbers or ticket references in comments — they rot as the codebase evolves

## Examples

```java
// Save Progress - skip validation when SaveForLater=1 (mobile edit path)
boolean saveForLater = UFmt.isTrue(request.getParameter("SaveForLater"));
```

```javascript
// Conditional required - attach dynamic listeners for fields with ColConditional
applyConditionalRequired(dataDef, eFormID);
```

```java
// Split by numberOfFormatParameters to include Conditional field
String[] parts = field.split("\\|\\^;", UConst.numberOfFormatParameters);
```
