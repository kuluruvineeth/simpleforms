import DOMPurify from "dompurify";
import { useState } from "react";

function EditableQuestionText({
  value: initialValue,
  questionTextandPlaceholderDebounced,
  questionId,
}: {
  value: string;
  questionTextandPlaceholderDebounced: (
    questionId: string,
    placeholder: string | null,
    text: string | null
  ) => void;
  questionId: string;
}) {
  const [value, setValue] = useState(initialValue);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const sanitizedHTML = DOMPurify.sanitize(target.innerHTML)
      .replace(/&nbsp;/g, " ")
      .trim();
    setValue(sanitizedHTML);
    questionTextandPlaceholderDebounced(questionId, null, sanitizedHTML);
  };

  return (
    <div
      tabIndex={0}
      contentEditable
      suppressContentEditableWarning
      className={`${
        !value ? "before:content-['Type_form_title] text-muted-foreground" : ""
      }cursor-text break-words focus:outline-none text-lg font-medium tracking-wide leading-7 mb-2 transition-colors`}
      onInput={handleInput}
    >
      {initialValue}
    </div>
  );
}

export default EditableQuestionText;
