"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { type Form, type Question, Prisma, type Option } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { updateOptionText } from "@/lib/actions/actions";

type QuestionWithOptions = Prisma.QuestionGetPayload<{
  include: {
    options: true;
  };
}>;

type ShortResponseAnswer = {
  type: "SHORT_RESPONSE";
  optionId: null;
  text: string;
  optionIds: null;
};

type OneOptionAnswer = {
  type: "SELECT_ONE_OPTION";
  optionId: string;
  text: string;
  optionIds: null;
};

type SelectMultipleOptionsAnswer = {
  type: "SELECT_MULTIPLE_OPTIONS";
  optionIds: string[];
  optionId: null;
  text: string;
};

type Accumulator = {
  [key: string]:
    | ShortResponseAnswer
    | OneOptionAnswer
    | SelectMultipleOptionsAnswer;
};

type SetAnswers = React.Dispatch<React.SetStateAction<Accumulator>>;

export default function Form({
  questions,
  submitForm,
  formId,
}: {
  questions: QuestionWithOptions[];
  submitForm: any;
  formId: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState(
    questions.reduce<Accumulator>((acc, question) => {
      if (question.type === "SHORT_RESPONSE") {
        acc[question.id] = {
          type: "SHORT_RESPONSE",
          optionId: null,
          text: "",
          optionIds: null,
        };
      } else if (question.type === "SELECT_ONE_OPTION") {
        acc[question.id] = {
          type: "SELECT_ONE_OPTION",
          optionId: "",
          text: "",
          optionIds: null,
        };
      } else if (question.type === "SELECT_MULTIPLE_OPTIONS") {
        acc[question.id] = {
          type: "SELECT_MULTIPLE_OPTIONS",
          optionId: null,
          text: "",
          optionIds: [],
        };
      }

      return acc;
    }, {})
  );

  return (
    <div>
      <div className="mt-16">
        {questions.map((element: any) => {
          if (element.type === "SHORT_RESPONSE") {
            return (
              <div key={element.id} className="mb-5 group relative">
                <div className="sm:w-1/2 tracking-tight flex h-9 w-full rounded-md border-0 bg-transparent py-1 text-sm transition-colors leading-7 file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                  {element.text}
                </div>
                <Input
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setAnswers((prevAnswers) => ({
                      ...prevAnswers,
                      [element.id]: {
                        ...prevAnswers[element.id],
                        text: newValue,
                        type: "SHORT_RESPONSE",
                        optionId: null,
                        optionIds: null,
                      },
                    }));
                  }}
                  placeholder={element.placeholder ? element.placeholder : ""}
                  key={element.id + "1"}
                  className="sm:w-1/2 leading-7 [&:not(:first-child)]:mt-0 text-muted-foreground"
                />
              </div>
            );
          } else if (element.type === "SELECT_ONE_OPTION") {
            return (
              <div key={element.id} className="mb-5 group relative">
                <div className="sm:w-1/2 tracking-tight flex h-9 w-full rounded-md border-0 bg-transparent py-1 text-sm transition-colors leading-7 file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                  {element.text}
                </div>
                <QuestionRadioGroup
                  setAnswers={setAnswers}
                  options={element.options}
                  questionId={element.id}
                />
              </div>
            );
          } else if (element.type === "SELECT_MULTIPLE_OPTIONS") {
            return (
              <div key={element.id} className="mb-5 group relative">
                <div className="sm:w-1/2 tracking-tight flex h-9 w-full rounded-md border-0 bg-transparent py-1 text-sm transition-colors leading-7 file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                  {element.text}
                </div>
                <QuestionCheckbox
                  setAnswers={setAnswers}
                  options={element.options}
                  questionId={element.id}
                />
              </div>
            );
          }
        })}
      </div>
      <div className="mt-8">
        <Button
          onClick={async () => {
            await submitForm(answers, formId);
            router.push(`/forms/success/${formId}`);
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

const QuestionRadioGroup = ({
  options,
  setAnswers,
  questionId,
}: {
  options: Option[];
  setAnswers: SetAnswers;
  questionId: string;
}) => {
  return (
    <RadioGroup
      onValueChange={(value) => {
        const newValue = value;
        setAnswers((prevAnswers: any) => ({
          ...prevAnswers,
          [questionId]: {
            text: "",
            optionId: newValue,
            type: "SELECT_ONE_OPTION",
            optionIds: null,
          },
        }));
      }}
    >
      {options.map((option: any) => {
        return (
          <div
            key={option.id}
            className="flex items-center space-x-2 relative group"
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <Input
              defaultValue={option.optionText}
              placeholder="Type the option"
              className="w-1/2 border-0 shadow-none focus-visible:ring-0 pl-0 !mt-0 !pt-0 scroll-m-20 tracking-tight transition-colors leading-7 [&:not(:first-child)]:mt-0"
            />
          </div>
        );
      })}
    </RadioGroup>
  );
};

const QuestionCheckbox = ({
  options,
  setAnswers,
  questionId,
}: {
  options: Option[];
  setAnswers: SetAnswers;
  questionId: string;
}) => {
  return (
    <div>
      {options.map((option) => {
        return (
          <div
            key={option.id}
            className="flex items-center space-x-2 relative group"
          >
            <Checkbox
              value={option.id}
              onCheckedChange={(checked) => {
                if (checked) {
                  setAnswers((prevAnswers) => {
                    const existingOptionIds =
                      prevAnswers[questionId].optionIds || [];
                    return {
                      ...prevAnswers,
                      [questionId]: {
                        text: "",
                        optionId: null,
                        type: "SELECT_MULTIPLE_OPTIONS",
                        optionIds: [...existingOptionIds, option.id],
                      },
                    };
                  });
                }
              }}
            />
            <Input
              defaultValue={option.optionText}
              placeholder="Type the option"
              className="w-1/2 border-0 shadow-none focus-visible:ring-0 pl-0 !mt-0 !pt-0 scroll-m-20 tracking-tight transition-colors leading-7 [&:not(:first-child)]:mt-0"
            />
          </div>
        );
      })}
    </div>
  );
};
