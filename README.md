# SQS Message Processor

[![npm version](https://img.shields.io/npm/v/sqs-message-processor.svg)](https://www.npmjs.com/package/sqs-message-processor)

**SQS Message Processor** is a reusable TypeScript library for processing AWS SQS messages with **automatic retries** (exponential backoff, linear, fixed) and optional **Dead Letter Queue (DLQ)** support. It is designed to be used in **serverless projects (Lambda)** or any Node.js worker application.

---

## Features

- ✅ Supports **exponential, linear, and fixed backoff** strategies  
- ✅ Handles **message retries** automatically  
- ✅ Supports **Dead Letter Queue** for failed messages  
- ✅ Works in **serverless Lambda functions** or polling workers  
- ✅ Fully written in **TypeScript** with type declarations  
- ✅ Easily reusable as an **npm package**

---

## Installation

```bash
npm install sqs-message-processor
