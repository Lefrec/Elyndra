# Elyndra backend documentation

This is a personal doc to help this project's dev build a decent code.

It will contains information about :

- Project architecture
- Syntax, case and good practice
- Astro's API endpoints
- LabAI LLM
- Weaviate and RAG
- Pocketbase and gamestate
- Using Tools

## Project architecture

Tech stack :

- Astro
- LabAI
- Weaviate
- Pocketbase

## Syntax, case and good practice

### Logs

Every log must specify which function it comes from between brackets at its start.

```TS
function logFunction() {
    console.log("[logFunction] Log whatever you want here")
}
```

### Functions

Functions should do simple tasks, overly complex ones should be break down into multiple smaller ones.

Functions' names start with a verb and describe simply what the function does, they are written in camel case.

```TS
function getExample() {
    ...
}

function deleteAllExample() {
    ...
}

function sortExampleByName() [
    ...
]
```

### Variables and const

Variables and consts should also be named in camel case. Their names should describe shortly what the value is and adapt depending on the expected type.

```TS

```

Global const like api keys or database URL are named in upper snake case instead.

```TS
const GLOBAL_CONST
```
