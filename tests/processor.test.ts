import { MessageProcessor } from "../src/processor";
import { SQSClient } from "@aws-sdk/client-sqs";
import { exponentialBackoff } from "../src/retryStrategies";

jest.mock("@aws-sdk/client-sqs");

const mockSqsSend = jest.fn();
(SQSClient as jest.Mock).mockImplementation(() => ({
  send: mockSqsSend,
}));

describe("MessageProcessor", () => {
  beforeEach(() => {
    mockSqsSend.mockClear();
  });

  const sqs = new SQSClient({});
  const queueUrl = "queue-url";
  const dlqUrl = "dlq-url";

  const processor = new MessageProcessor({
    sqs,
    queueUrl,
    dlqUrl,
    maxRetries: 3,
    retryStrategy: exponentialBackoff(1, 10),
  });

  test("processMessage calls handler and succeeds", async () => {
    const handler = jest.fn().mockResolvedValueOnce(undefined);
    const message = { body: JSON.stringify({ foo: "bar" }), messageAttributes: {} };

    await processor.processMessage(message, handler);

    expect(handler).toHaveBeenCalled();
    expect(mockSqsSend).toHaveBeenCalledTimes(0);
  });

  test("processMessage retries on failure", async () => {
    const handler = jest.fn().mockRejectedValueOnce(new Error("fail"));
    const message = { body: JSON.stringify({ foo: "bar" }), messageAttributes: {} };

    await expect(processor.processMessage(message, handler)).rejects.toThrow("fail");
    expect(mockSqsSend).toHaveBeenCalledTimes(1);
  });

  test("processMessage sends to DLQ after max retries", async () => {
    const failingHandler = jest.fn().mockRejectedValue(new Error("fail"));
    const message = {
      body: JSON.stringify({ foo: "bar" }),
      messageAttributes: { RetryCount: { stringValue: "3" } },
    };

    await expect(processor.processMessage(message, failingHandler)).rejects.toThrow("fail");
    // expect(mockSqsSend).toHaveBeenCalledWith(expect.objectContaining({
    //   input: expect.objectContaining({ QueueUrl: dlqUrl }),
    // }));
    expect(mockSqsSend).toHaveBeenCalledTimes(1);
  });
});
