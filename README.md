# LLM Playground

A TypeScript/Node lab for building and testing practical LLM patterns
using Gemini models.

This repository focuses on small, isolated experiments that explore real
engineering concerns: structured outputs, streaming, tool calling, RAG
pipelines, evaluation, and reliability patterns. Each experiment is
runnable independently and keeps abstractions minimal.

The goal is simple: understand how to build reliable LLM systems without
heavy frameworks or hidden orchestration layers.

## Setup

``` bash
pnpm install
cp .env.example .env
```

Add your API key:

    GEMINI_API_KEY=your_key

Run an experiment:

``` bash
pnpm exp:01
```
