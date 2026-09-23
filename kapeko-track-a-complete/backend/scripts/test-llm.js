require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const llm = require('../src/services/llmService');

async function main() {
  const provider = process.env.LLM_PROVIDER || 'azure';
  console.log(`Testing LLM provider: ${provider}`);

  const response = await llm.complete(
    'You are a concise test assistant.',
    'Reply with exactly: LLM connection works.'
  );

  console.log('LLM response:', response);
}

main().catch((error) => {
  console.error('LLM smoke test failed:', error.message);
  process.exitCode = 1;
});
