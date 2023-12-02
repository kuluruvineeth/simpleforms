import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  CheckCircledIcon,
  CheckboxIcon,
  PauseIcon,
} from "@radix-ui/react-icons";
import { Trash2 } from "lucide-react";

export function QuestionCommand({
  open,
  setOpen,
  newElementOrder,
  formId,
  createShortResponseQuestion,
  createOptionQuestion,
  deleteQuestion,
  commandQuestionId,
  createMultipleOptionQuestion,
}: {
  open: boolean;
  setOpen: any;
  newElementOrder: number;
  formId: string;
  createShortResponseQuestion: any;
  createOptionQuestion: any;
  deleteQuestion: any;
  commandQuestionId: any;
  createMultipleOptionQuestion: any;
}) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen((open: any) => !open);
      }
    };

    document.addEventListener("keydown", down);

    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  return (
    <div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Options">
            <CommandItem
              className="cursor-pointer"
              onSelect={async () => {
                await createShortResponseQuestion(formId, newElementOrder);
                setOpen(false);
              }}
            >
              <PauseIcon className="mr-2 h-4 w-4 rotate-90" />
              <span>Add short text question</span>
            </CommandItem>
            <CommandItem
              className="cursor-pointer"
              onSelect={async () => {
                await createOptionQuestion(formId, newElementOrder);
                setOpen(false);
              }}
            >
              <CheckCircledIcon className="mr-2 h-4 w-4" />
              <span>Add multiple choice question</span>
            </CommandItem>
            <CommandItem
              className="cursor-pointer"
              onSelect={async () => {
                await createMultipleOptionQuestion({
                  formId,
                  questionOrder: newElementOrder,
                });
                setOpen(false);
              }}
            >
              <CheckboxIcon className="mr-2 h-4 w-4" />
              <span>Add checkboxes question</span>
            </CommandItem>
            {commandQuestionId ? (
              <CommandItem
                className="md:hidden cursor-pointer"
                onSelect={async () => {
                  await deleteQuestion(formId, commandQuestionId);
                  setOpen(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Remove question</span>
              </CommandItem>
            ) : null}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
