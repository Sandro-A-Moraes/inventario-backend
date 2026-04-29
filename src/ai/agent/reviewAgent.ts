import fs from 'fs-extra';
import OpenAI from 'openai';
import { REVIEW_PROMPT } from './prompts';
import { getChangedFiles } from './git';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ReviewResult = {
  file: string;
  content: string;
};

async function reviewFile(filePath: string): Promise<ReviewResult> {
  const code = await fs.readFile(filePath, 'utf-8');

  if (!code.trim()) {
    return { file: filePath, content: 'Empty file' };
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: REVIEW_PROMPT },
      {
        role: 'user',
        content: `Review this file:\n\n${code}`,
      },
    ],
    temperature: 0.2,
  });

  const content = response.choices?.[0]?.message?.content ?? '';

  return {
    file: filePath,
    content,
  };
}

export async function runReviewAgent() {
  console.log('Running AI Review Agent...\n');

  const files = getChangedFiles();

  if (!files.length) {
    console.log('No changed files found.');
    return;
  }

  for (const file of files) {
    try {
      const result = await reviewFile(file);

      console.log(`\n=== ${result.file} ===\n`);
      console.log(result.content);
    } catch (err) {
      console.error(`Error reviewing ${file}:`, err);
    }
  }
}
