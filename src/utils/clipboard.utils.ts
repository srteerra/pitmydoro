const writeWithClipboardApi = (text: string) => {
  if (!navigator.clipboard?.writeText) return Promise.resolve(false);

  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
};

const writeWithSelection = (text: string) => {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);

    return copied;
  } catch {
    return false;
  }
};

export const copyToClipboard = async (text: string) => {
  if (!text) return false;

  return (await writeWithClipboardApi(text)) || writeWithSelection(text);
};
