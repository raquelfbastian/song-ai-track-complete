// orderAgentService.js — Track A (Node.js)
// Lab 9: Order Assistant Agent — COMPLETE IMPLEMENTATION

const llm = require('./llmService');

const AGENT_SYSTEM = `You are the Kape Ko Order Assistant — an autonomous agent that helps
customers manage their orders and subscriptions.

You have access to these tools. Call them by returning JSON in this format:
{ "tool": "toolName", "args": { "param": "value" } }

Available tools:
1. getOrderStatus
   Args: { "orderId": "string" }
   Use when: customer asks about order status, tracking, or delivery

2. pauseSubscription
   Args: { "customerId": "string", "months": number }
   Use when: customer wants to pause their subscription
   Constraint: maximum 3 months per pause request

3. changeSubscriptionProduct
   Args: { "customerId": "string", "newSku": "string" }
   Use when: customer wants to change which coffee they receive
   Valid SKUs: SKU-001, SKU-002, SKU-003, SKU-004

4. initiateReturn
   Args: { "orderId": "string", "reason": "string" }
   Use when: customer wants to return an order

If the request is unclear, ask ONE clarifying question.
If no tool matches, respond conversationally.
If a tool is called, also explain to the customer what you did.`;

async function process(customerId, message) {
  const response = await llm.complete(AGENT_SYSTEM, message);

  if (isToolCall(response)) {
    return executeToolCall(customerId, response);
  }

  return { type: 'message', response, toolCalled: false };
}

function isToolCall(response) {
  const trimmed = response.trim();
  return trimmed.startsWith('{') && trimmed.includes('"tool"');
}

function executeToolCall(customerId, toolJson) {
  try {
    const start = toolJson.indexOf('{');
    const end = toolJson.lastIndexOf('}') + 1;
    const parsed = JSON.parse(toolJson.substring(start, end));
    const { tool, args } = parsed;

    switch (tool) {
      case 'getOrderStatus':
        return getOrderStatus(args.orderId);
      case 'pauseSubscription':
        return pauseSubscription(customerId, args.months || 1);
      case 'changeSubscriptionProduct':
        return changeSubscriptionProduct(customerId, args.newSku);
      case 'initiateReturn':
        return initiateReturn(args.orderId, args.reason);
      default:
        return { type: 'error', response: `Unknown tool: ${tool}`, toolCalled: false };
    }
  } catch (e) {
    return { type: 'error', response: `Tool execution failed: ${e.message}`, toolCalled: false };
  }
}

// ── Tool implementations (mock) ───────────────────────────────────────────

function getOrderStatus(orderId) {
  return {
    type: 'tool_result', tool: 'getOrderStatus', toolCalled: true,
    result: {
      orderId, status: 'In Transit',
      estimatedDelivery: '2-3 business days',
      carrier: 'LBC Express',
      trackingNumber: `LBC-${orderId.toUpperCase()}`,
    },
    response: `Your order ${orderId} is currently in transit via LBC Express. Expected delivery in 2-3 business days. Tracking: LBC-${orderId.toUpperCase()}.`,
  };
}

function pauseSubscription(customerId, months) {
  const m = Math.min(months, 3);
  return {
    type: 'tool_result', tool: 'pauseSubscription', toolCalled: true,
    result: { customerId, pausedForMonths: m },
    response: `Done! Your Kape Ko subscription has been paused for ${m} month${m > 1 ? 's' : ''}. It will automatically resume after that. ☕`,
  };
}

function changeSubscriptionProduct(customerId, newSku) {
  const names = {
    'SKU-001': 'Benguet Sunrise', 'SKU-002': 'Sagada Mist',
    'SKU-003': 'Mt. Apo Dark', 'SKU-004': 'Kape Ko Blend',
  };
  const name = names[newSku] || newSku;
  return {
    type: 'tool_result', tool: 'changeSubscriptionProduct', toolCalled: true,
    result: { customerId, newProduct: name },
    response: `Switched! Your next Kape Ko delivery will be ${name}. Takes effect from your next billing cycle. ☕`,
  };
}

function initiateReturn(orderId, reason) {
  return {
    type: 'tool_result', tool: 'initiateReturn', toolCalled: true,
    result: { orderId, returnId: `RET-${orderId.toUpperCase()}`, reason, status: 'Return initiated' },
    response: `Return initiated for order ${orderId}. Return ID: RET-${orderId.toUpperCase()}. Drop off at any LBC branch within 7 days. Refund in 5-7 business days.`,
  };
}

module.exports = { process };
