import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export type RetryStrategy = (attempt: number) => number;

export interface MessageProcessorConfig {
  sqs: SQSClient;
  queueUrl: string;
  dlqUrl?: string;
  maxRetries?: number;
  retryStrategy: RetryStrategy;
}

export class MessageProcessor {
  private sqs: SQSClient;
  private queueUrl: string;
  private dlqUrl?: string;
  private maxRetries: number;
  private retryStrategy: RetryStrategy;

  constructor({ sqs, queueUrl, dlqUrl, maxRetries = 5, retryStrategy }: MessageProcessorConfig) {
    this.sqs = sqs;
    this.queueUrl = queueUrl;
    this.dlqUrl = dlqUrl;
    this.maxRetries = maxRetries;
    this.retryStrategy = retryStrategy;
  }

  private getRetryCount(message: any): number {
    const attrs = message.messageAttributes || {};
    return parseInt(attrs?.RetryCount?.stringValue || "0", 10);
  }

  public async processMessage<T>(
    message: any,
    handler: (message: any) => Promise<T>
  ): Promise<void> {
    try {
      await handler(message);
      console.log("✅ Processed successfully:", message.body);
    } catch (err) {
      const attempt = this.getRetryCount(message) + 1;

      if (attempt > this.maxRetries) {
        console.error("❌ Max retries reached. Sending to DLQ");
        if (this.dlqUrl) {
          await this.sqs.send(
            new SendMessageCommand({
              QueueUrl: this.dlqUrl,
              MessageBody: message.body,
            })
          );
        }
      } else {
        const delay = this.retryStrategy(attempt);
        console.warn(`⚠️ Retrying (attempt ${attempt}) after ${delay}s`);
        await this.sqs.send(
          new SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: message.body,
            DelaySeconds: delay,
            MessageAttributes: {
              RetryCount: { DataType: "Number", StringValue: attempt.toString() },
            },
          })
        );
      }

      // Optional: rethrow to let Lambda mark this as failed
      throw err;
    }
  }
}
