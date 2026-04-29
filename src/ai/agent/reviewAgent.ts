import fs from 'fs-extra';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { REVIEW_PROMPT } from './prompts';
import { getChangedFiles } from './git';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

const MAX_FILES = 3;
const MAX_CHARS = 12000;

function shouldIgnore(file: string) {
  return (
    file.includes('node_modules') ||
    file.includes('dist') ||
    file.includes('.test') ||
    file.includes('ai/agent')
  );
}

async function buildContext(files: string[]) {
  let context = '';

  for (const file of files) {
    const code = await fs.readFile(file, 'utf-8');

    if (!code.trim()) continue;

    const block = `FILE: ${file}\n${code}\n\n`;

    if ((context + block).length > MAX_CHARS) break;

    context += block;
  }

  return context;
}

async function reviewFiles(files: string[]) {
  const context = await buildContext(files);

  if (!context) {
    console.log('No valid code to review.');
    return;
  }

  const prompt = `
${REVIEW_PROMPT}

Review the following files:

${context}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('\n=== AI REVIEW RESULT (GEMINI) ===\n');
    console.log(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Gemini review failed:', message);
  }
}

export async function runReviewAgent() {
  console.log('Running AI Review Agent (Gemini)...\n');

  const changedFiles = getChangedFiles();

  const filteredFiles = changedFiles
    .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
    .filter((f) => !shouldIgnore(f))
    .slice(0, MAX_FILES);

  if (!filteredFiles.length) {
    console.log('No relevant files to review.');
    return;
  }

  await reviewFiles(filteredFiles);
}
