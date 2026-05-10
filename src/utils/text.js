const truncateText = (value = "", limit = 80) => {
  const text = String(value);
  const chars = Array.from(text);

  if (chars.length <= limit) {
    return text;
  }

  return `${chars.slice(0, limit).join("").trimEnd()}...`;
};

exports.truncateText = truncateText;
