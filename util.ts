
export function d() {
  return new Date().toISOString();
}

export const emojiRanges = [
  {
    begin: 0x2700,
    end: 0x27BF,
  },
  {
    begin: 0x1F650,
    end: 0x1F67F,
  },
  {
    begin: 0x1F600,
    end: 0x1F64F,
  },
  {
    begin: 0x2600,
    end: 0x26FF,
  },
  {
    begin: 0x1F300,
    end: 0x1F3FF,
  },
  {
    begin: 0x1F900,
    end: 0x1F9FF,
  },
  {
    begin: 0x1F680,
    end: 0x1F6FF,
  }
];

function isEmoji(codePoint: number): boolean {
  for (let range of emojiRanges) {
    if (range.begin >= codePoint && range.end <= codePoint) {
      return true;
    }
  }
  return false;
}

export function filterEmoji(input: string): string {
  let output = '';
  if (!input) {
    return '';
  }
  for (let i = 0; i < input.length; ++i) {
    const codePoint = input.codePointAt(i);
    if (!isEmoji(codePoint)) {
      output += String.fromCodePoint(codePoint);
    }

    if (codePoint > 0x10000) {
      ++i;
    }

  }
  return output;
}