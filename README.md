# SQS Message Processor

[![npm version](https://img.shields.io/npm/v/sqs-message-processor.svg)](https://www.npmjs.com/package/@narsicloud/sqs-message-processor)

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
npm install @narsicloud/sqs-message-processor
```
---

## Usage (Serverless / Lambda)
```typescript
import { SQSClient } from "@aws-sdk/client-sqs";
import { MessageProcessor, RetryStrategies } from "sqs-message-processor";

// Create an AWS SQS client
const sqs = new SQSClient({ region: "us-east-1" });

// Create a MessageProcessor instance
const processor = new MessageProcessor({
  sqs,
  queueUrl: process.env.SQS_URL,
  dlqUrl: process.env.DLQ_URL,
  maxRetries: 5,
  retryStrategy: RetryStrategies.exponentialBackoff(5, 900),
});

// Lambda handler
export const handler = async (event: any) => {
  for (const record of event.Records) {
    await processor.processMessage(record, async (msg) => {
      const data = JSON.parse(msg.body);
      console.log("Processing:", data);

      // Example: simulate random failure
      if (Math.random() < 0.7) throw new Error("Random failure");

      console.log("Processed successfully:", data);
    });
  }
};
```
---

## Retry Strategies
The library includes several built-in strategies:

**Exponential Backoff**
```typescript
RetryStrategies.exponentialBackoff(baseDelay: number, maxDelay: number)
```
* Delay grows exponentially: baseDelay * 2^attempt
* Capped at maxDelay

**Linear Backoff**
```typescript
RetryStrategies.linearBackoff(step: number, maxDelay: number)
```
* Delay grows linearly: step * attempt
* Capped at maxDelay

**Fixed Delay**
```typescript
RetryStrategies.fixedDelay(delay: number)
```
* Constant delay for every retry

**Custom Strategy**
```typescript
const customRetry = (attempt: number) => attempt * 10 + Math.floor(Math.random() * 5);
```
---

## API
**MessageProcessor**
```typescript
constructor(config: MessageProcessorConfig)
```
**Config:**
* sqs: SQSClient — AWS SQS client
* queueUrl: string — URL of the main queue
* dlqUrl?: string — URL of the Dead Letter Queue (optional)
* maxRetries?: number — maximum retry attempts (default: 5)
* retryStrategy: (attempt: number) => number — function to calculate delay in seconds
---
```typescript
processMessage(message: any, handler: (message: any) => Promise<void>)
```
Processes a single SQS message with retry logic.
* message — SQS message object
* handler — async function containing your business logic
* Throws an error if the message fails (optional, lets Lambda mark it as failed)

