# XAU₮Anchor Safety & Guardrails

To ensure the security of the treasury, XAU₮Anchor implements "Deterministic Guardrails"—hardcoded rules in the JavaScript layer that the LLM cannot override.

## 1. Execution Boundaries
- **Max Allocation:** The agent is hard-capped at 80% XAU₮. It cannot "all-in" on gold regardless of signal.
- **Slippage Protection:** All swaps are hardcoded to fail if slippage exceeds 1%.
- **Gas Breakeven:** The agent will not supply to Aave if the gas cost is higher than the projected 45-day yield.

## 2. Risk Circuit Breaker
If the portfolio value drops by 15% from the high-water mark, the system enters **Emergency Mode**:
- LLM reasoning is bypassed.
- The agent automatically swaps XAU₮ back to USDT.
- Funds are parked in Aave for safety.
- Human intervention is required to reset the breaker.

## 3. Anti-Whipsaw Logic
- **Hysteresis:** Signals must move by more than 8 points to trigger a change in direction.
- **Cooldown:** A mandatory 2-cycle (10 minute) wait time is enforced between any trade execution to prevent burning gas on market noise.
