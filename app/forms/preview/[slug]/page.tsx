import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getFormFromUser, getQuestionsFromUser } from "@/lib/actions/actions";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { type Form, type Question, Prisma, type Option } from "@prisma/client";
import { FormTitle } from "@/components/formTitle";
import { FormContainer } from "@/components/form-container";

type QuestionWithOptions = Prisma.QuestionGetPayload<{
  include: {
    options: true;
  };
}>;

export default async function Page({ params }: { params: { slug: string } }) {
  const questions = await getQuestionsFromUser(params.slug);
  const form = await getFormFromUser(params.slug);

  if (!form || "error" in form) {
    notFound();
  }

  if ("error" in questions) {
    notFound();
  }

  const title = form?.title;

  return (
    <div className="mx-auto my-6 mt-18 sm:mx-48 sm:my-24 w-full max-w-xs sm:max-w-4xl">
      <div className="my-10">
        <Link href={`/forms/${form?.id}`}>
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
            {"Back to Editor"}
          </div>
        </Link>
      </div>
      <FormContainer>
        <FormTitle title={title} />
        <div className="mt-12">
          {questions.map((element: any) => {
            if (element.type === "SHORT_RESPONSE") {
              return (
                <div key={element.id} className="mb-5 group relative">
                  <div className="sm:w-1/2 tracking-tight flex h-9 w-full rounded-md border-0 bg-transparent py-1 text-sm transition-colors leading-7 file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    {element.text}
                  </div>
                  <Input
                    placeholder={element.placeholder ? element.placeholder : ""}
                    key={element.id + "1"}
                    className="sm:w-1/2 leading-7 [&:not(:first-child)]:mt-0 text-muted-foreground"
                  />
                </div>
              );
            } else if ("MANY_OPTIONS") {
              return (
                <div key={element.id} className="mb-5 group relative">
                  <div className="sm:w-1/2 tracking-tight flex h-9 w-full rounded-md border-0 bg-transparent py-1 text-sm transition-colors leading-7 file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    {element.text}
                  </div>
                  <QuestionRadioGroup options={element.options} />
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>

        <div className="mt-16">
          <Button>Submit</Button>
        </div>
      </FormContainer>
    </div>
  );
}

const QuestionRadioGroup = ({ options }: { options: Option[] }) => {
  return (
    <RadioGroup defaultValue="option-one font-base">
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
