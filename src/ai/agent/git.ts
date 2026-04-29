import { execSync } from 'child_process';

export function getChangedFiles(): string[] {
  const output = execSync('git diff --name-only HEAD').toString().split('\n');

  return output.filter(
    (file) =>
      file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'),
  );
}
