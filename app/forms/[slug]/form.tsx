"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { string, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, useToast } from "@/components/ui/use-toast";
import {
  updateFormFromUser,
  updateOptionText,
  updateQuestionFromUser,
} from "@/lib/actions/actions";
import { useDebouncedCallback } from "use-debounce";
import { MoveLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionCommand } from "@/components/command";

import { type Form, type Question, Prisma, type Option } from "@prisma/client";
import EditableFormTitle from "@/components/ui/editable-form-title";
import EditableQuestionText from "@/components/ui/editable-question-text";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { FormContainer } from "@/components/form-container";
import { Checkbox } from "@/components/ui/checkbox";

type QuestionWithOptions = Prisma.QuestionGetPayload<{
  include: {
    options: true;
  };
}>;

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 1 characters",
  }),
  questions: z
    .array(
      z.object({
        text: z
          .string()
          .min(1, { message: "Can't leave it as empty question" }),
        placeholder: z.string(),
      })
    )
    .optional(),
});

export default function QuestionForm({
  questions,
  createShortResponseQuestion,
  deleteQuestion,
  togglePublishFormFromUser,
  form,
  createOptionQuestion,
  updateOptionText,
  createOption,
  deleteOption,
  host,
  createMultipleOptionQuestion,
}: {
  formId: string;
  questions: QuestionWithOptions[];
  title: string;
  createShortResponseQuestion: any;
  deleteQuestion: any;
  togglePublishFormFromUser: any;
  form: Form;
  createOptionQuestion: any;
  updateOptionText: any;
  createOption: any;
  deleteOption: any;
  host: string;
  createMultipleOptionQuestion: any;
}) {
  const { id: formId, title } = form;
  const router = useRouter();
  const { toast } = useToast();
  type FormSchema = z.infer<typeof formSchema>;
  const defaultValues: Partial<FormSchema> = {
    questions,
    title,
  };

  function onSubmit(data: FormSchema) {
    console.log("form submitted");
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  const debounced = useDebouncedCallback((questionId, placeholder, text) => {
    updateQuestionFromUser(formId, questionId, placeholder, text);
  }, 300);

  const formTitleDebounced = useDebouncedCallback(
    (formId: string, title: string) => {
      updateFormFromUser(formId, title);
    },
    300
  );

  const [openQuestionCommand, setOpenQuestionCommand] = useState(false);
  const [newElementOrder, setNewElementOrder] = useState(questions.length + 1);
  const [commandQuestionId, setCommandQuestionId] = useState("");

  return (
    <div className="">
      <div className="my-10">
        <QuestionCommand
          setOpen={setOpenQuestionCommand}
          open={openQuestionCommand}
          newElementOrder={newElementOrder}
          formId={formId}
          createShortResponseQuestion={createShortResponseQuestion}
          createOptionQuestion={createOptionQuestion}
          deleteQuestion={deleteQuestion}
          commandQuestionId={commandQuestionId}
          createMultipleOptionQuestion={createMultipleOptionQuestion}
        />
        {form.published ? null : (
          <Link href={`/forms`}>
            <div className="flex items-center">
              {
                <MoveLeft
                  className="mr-2"
                  color="#000000"
                  strokeWidth={1.75}
                  absoluteStrokeWidth
                  size={18}
                />
              }
              {"Back to my forms"}
            </div>
          </Link>
        )}
      </div>

      <FormContainer>
        <EditableFormTitle
          value={title}
          formTitleDebounced={formTitleDebounced}
          formId={formId}
        />
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={async () => {
              setNewElementOrder(questions.length + 1);
              setCommandQuestionId("");
              setOpenQuestionCommand(true);
            }}
          >
            Add Question
          </Button>
          <Link href={`/forms/viewform/${formId}`} target="_blank">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 ml-8"
            >
              Preview
            </Button>
          </Link>

          <Button
            type="button"
            size="sm"
            className="mt-2 ml-2"
            onClick={async () => {
              await togglePublishFormFromUser(formId);
            }}
          >
            {form.published ? "Unpublish" : "Publish"}
          </Button>
          {form.published ? (
            <div>
              <Button
                type="button"
                size="sm"
                className="mt-8"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `${host}/forms/viewform/${formId}`
                  );
                  toast({
                    title: "Link successfully copied",
                  });
                }}
              >
                Copy Link
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-8 ml-2"
                onClick={() => {
                  router.push(`/forms/viewform/${formId}`);
                }}
              >
                Go to form
              </Button>
            </div>
          ) : null}
        </div>
        <div className="mt-12">
          {questions.map((element: any) => {
            if (element.type === "SHORT_RESPONSE") {
              return (
                <div key={element.id} className="mb-5 group relative">
                  <EditableQuestionText
                    value={element.text}
                    questionTextandPlaceholderDebounced={debounced}
                    questionId={element.id}
                  />
                  <Input
                    defaultValue={element.placeholder}
                    placeholder="Type a placeholder for the response"
                    key={element.id + "1"}
                    className="w-1/2 leading-7 [&:not(:first-child)]:mt-0 text-muted-foreground"
                    onChange={(e) =>
                      debounced(element.id, e.target.value, null)
                    }
                  />
                  <div className="absolute top-0 left-0 transform -translate-x-full flex md:hidden items-center">
                    <div className="mt-2 mr-2 flex">
                      <DotsVerticalIcon
                        className="h-4 w-4"
                        onClick={() => {
                          setNewElementOrder(element.order + 1);
                          setCommandQuestionId(element.id);
                          setOpenQuestionCommand(true);
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute top-2 left-0 transform -translate-x-full hidden group-hover:inline-flex">
                    <div className="mr-6">
                      <div className="px-2 hover:cursor-pointer">
                        <Plus
                          className="text-gray-700"
                          onClick={async () => {
                            setNewElementOrder(element.order + 1);
                            setOpenQuestionCommand(true);
                          }}
                        />
                      </div>
                      <div
                        className="px-2 mt-1 hover:cursor-pointer"
                        onClick={async () => {
                          await deleteQuestion(formId, element.id);
                        }}
                      >
                        <Trash2 className="mt-1 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else if (element.type === "SELECT_ONE_OPTION") {
              return (
                <div key={element.id} className="mb-5 group relative">
                  <EditableQuestionText
                    value={element.text}
                    questionTextandPlaceholderDebounced={debounced}
                    questionId={element.id}
                  />
                  <QuestionRadioGroup
                    options={element.options}
                    formId={formId}
                    questionId={element.id}
                    createOption={createOption}
                    deleteOption={deleteOption}
                  />
                  <div className="absolute top-0 left-0 transform -translate-x-full flex md:hidden items-center">
                    <div className="mt-2 mr-2 flex">
                      <DotsVerticalIcon
                        className="h-4 w-4"
                        onClick={() => {
                          setNewElementOrder(element.order + 1);
                          setCommandQuestionId(element.id);
                          setOpenQuestionCommand(true);
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute top-2 left-0 transform -translate-x-full hidden group-hover:inline-flex">
                    <div className="mr-6">
                      <div className="px-2 hover:cursor-pointer">
                        <Plus
                          className="text-gray-700"
                          onClick={async () => {
                            setNewElementOrder(element.order + 1);
                            setOpenQuestionCommand(true);
                          }}
                        />
                      </div>
                      <div
                        className="px-2 mt-1 hover:cursor-pointer"
                        onClick={async () => {
                          await deleteQuestion(formId, element.id);
                        }}
                      >
                        <Trash2 className="mt-1 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            if (element.type === "SELECT_MULTIPLE_OPTIONS") {
              return (
                <div key={element.id} className="mb-5 group relative">
                  <EditableQuestionText
                    value={element.text}
                    questionTextandPlaceholderDebounced={debounced}
                    questionId={element.id}
                  />
                  <QuestionCheckboxes
                    options={element.options}
                    formId={formId}
                    questionId={element.id}
                    createOption={createOption}
                    deleteOption={deleteOption}
                  />
                  <div className="absolute top-0 left-0 transform -translate-x-full flex md:hidden items-center">
                    <div className="mt-2 mr-2 flex">
                      <DotsVerticalIcon
                        className="h-4 w-4"
                        onClick={() => {
                          setNewElementOrder(element.order + 1);
                          setCommandQuestionId(element.id);
                          setOpenQuestionCommand(true);
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute top-2 left-0 transform -translate-x-full hidden group-hover:inline-flex">
                    <div className="mr-6">
                      <div className="px-2 hover:cursor-pointer">
                        <Plus
                          className="text-gray-700"
                          onClick={async () => {
                            setNewElementOrder(element.order + 1);
                            setOpenQuestionCommand(true);
                          }}
                        />
                      </div>
                      <div
                        className="px-2 mt-1 hover:cursor-pointer"
                        onClick={async () => {
                          await deleteQuestion(formId, element.id);
                        }}
                      >
                        <Trash2 className="mt-1 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </FormContainer>
    </div>
  );
}

const QuestionRadioGroup = ({
  options,
  formId,
  questionId,
  createOption,
  deleteOption,
}: {
  options: Option[];
  formId: string;
  questionId: string;
  createOption: any;
  deleteOption: any;
}) => {
  const [prevOptionsLength, setPrevOptionsLength] = useState(options.length);
  const debounded = useDebouncedCallback((optionText, optionId) => {
    updateOptionText(optionText, optionId, questionId, formId);
  }, 500);

  const lastInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (options.length > prevOptionsLength) {
      lastInputRef.current && lastInputRef.current.focus();
    }

    setPrevOptionsLength(options.length);
  }, [options, prevOptionsLength]);

  const debouncedCreateOption = useDebouncedCallback((order) => {
    createOption(questionId, formId, order);
  }, 500);

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <RadioGroup>
      {options.map((option: any, index: number) => {
        return (
          <div
            key={option.id}
            className="flex items-center space-x-2 relative group"
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <Input
              ref={options.length === index + 1 ? lastInputRef : null}
              defaultValue={option.optionText}
              placeholder="Type the option"
              className="w-1/2 border-0 shadow-none focus-visible:ring-0 pl-0 !mt-0 !pt-0 scroll-m-20 tracking-tight transition-colors leading-7 [&:not(:first-child)]:mt-0"
              onChange={(e) => debounded(e.target.value, option.id)}
            />
            <div className="absolute top-2 left-0 transform -translate-x-full hidden group-hover:inline-flex">
              <div className="mr-4">
                <div className="px-2 hover:cursor-pointer">
                  <Trash2
                    size={20}
                    className="text-gray-700"
                    onClick={async () => {
                      await deleteOption(questionId, option.id, formId);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div
        onClick={() => {
          createOption(questionId, formId, options.length + 1);
        }}
        key={"dsd"}
        className="flex items-center space-x-2"
      >
        <RadioGroupItem value={"input"} id={"input"} />
        <Input
          defaultValue="Add other option"
          placeholder="Type the option"
          className="w-1/2 border-0 shadow-none focus-visible:ring-0 pl-0 !mt-0 !pt-0 scroll-m-20 tracking-tight transition-colors leading-7 [&:not(:first-child)]:mt-0"
          onChange={(e) => debouncedCreateOption(options.length + 1)}
        />
      </div>
    </RadioGroup>
  );
};

const QuestionCheckboxes = ({
  options,
  formId,
  questionId,
  createOption,
  deleteOption,
}: {
  options: Option[];
  formId: string;
  questionId: string;
  createOption: any;
  deleteOption: any;
}) => {
  const [prevOptionsLength, setPrevOptionsLength] = useState(options.length);
  const debounded = useDebouncedCallback((optionText, optionId) => {
    updateOptionText(optionText, optionId, questionId, formId);
  }, 500);

  const lastInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (options.length > prevOptionsLength) {
      lastInputRef.current && lastInputRef.current.focus();
    }

    setPrevOptionsLength(options.length);
  }, [options, prevOptionsLength]);

  const debouncedCreateOption = useDebouncedCallback((order) => {
    createOption(questionId, formId, order);
  }, 500);

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div>
      {options.map((option, index) => {
        return (
          <div
            key={option.id}
            className="flex items-center space-x-2 relative group"
          >
            <Checkbox />
            <Input
              ref={options.length === index + 1 ? lastInputRef : null}
              defaultValue={option.optionText}
              placeholder="Type the option"
              className="w-1/2 border-0 shadow-none focus-visible:ring-0 pl-0 !mt-0 !pt-0 scroll-m-20 tracking-tight transition-colors leading-7 [&:not(:first-child)]:mt-0"
              onChange={(e) => debounded(e.target.value, option.id)}
            />
            <div className="absolute top-2 left-0 transform -translate-x-full hidden group-hover:inline-flex">
              <div className="mr-4">
                <div className="px-2 hover:cursor-pointer">
                  <Trash2
                    size={20}
                    className="text-gray-700"
                    onClick={async () => {
                      await deleteOption(questionId, option.id, formId);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div
        onClick={() => {
          createOption(questionId, formId, options.length + 1);
        }}
        key={"dsd"}
        className="flex items-center space-x-2"
      >
        <Checkbox value={"input"} id={"input"} />
        <Input
          defaultValue="Add other option"
          placeholder="Type the option"
          className="w-1/2 border-0 shadow-none focus-visible:ring-0 pl-0 !mt-0 !pt-0 scroll-m-20 tracking-tight transition-colors leading-7 [&:not(:first-child)]:mt-0"
          onChange={(e) => debouncedCreateOption(options.length + 1)}
        />
      </div>
    </div>
  );
};
