import { exponentialBackoff, linearBackoff, fixedDelay } from "../src/retryStrategies";

describe("RetryStrategies", () => {
  test("exponentialBackoff returns correct delays", () => {
    const strategy = exponentialBackoff(5, 100);
    expect(strategy(0)).toBe(5);
    expect(strategy(1)).toBe(10);
    expect(strategy(2)).toBe(20);
    expect(strategy(5)).toBe(100); // capped
  });

  test("linearBackoff returns correct delays", () => {
    const strategy = linearBackoff(10, 50);
    expect(strategy(1)).toBe(10);
    expect(strategy(3)).toBe(30);
    expect(strategy(10)).toBe(50); // capped
  });

  test("fixedDelay always returns the same delay", () => {
    const strategy = fixedDelay(15);
    expect(strategy()).toBe(15);
    expect(strategy()).toBe(15);
  });
});
