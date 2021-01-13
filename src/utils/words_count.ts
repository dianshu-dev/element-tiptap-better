export default function wordsCount (content: string): any {
  const paragraph = content.split(/\n{2,}/).filter(line => line).length;
  let word: number = 0;
  let character: number = 0;
  let all: number = 0;

  const removedChinese = content.replace(/[\u4e00-\u9fa5]/g, '');
  const tokens = removedChinese.split(/[\s\n]+/).filter(t => t);
  const chineseWordLength = content.length - removedChinese.length;
  word += chineseWordLength + tokens.length;
  character += tokens.reduce((acc, t) => acc + t.length, 0) + chineseWordLength;
  all += content.length;

  return { word, paragraph, character, all };
};
