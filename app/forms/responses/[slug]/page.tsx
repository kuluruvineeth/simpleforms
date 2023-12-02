import ResponsePie from "@/components/pie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getResponsesFromForm,
  getResponsesSummaryFromUser,
} from "@/lib/actions/actions";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

import { notFound } from "next/navigation";

import { type Form, type Question, Prisma, type Option } from "@prisma/client";
import { ExportToExcelButton } from "./export-excel-button";
import ResponseBarChart from "@/components/response-bar-chart";

type QuestionWithOptionsWithAnswer = Prisma.QuestionGetPayload<{
  include: {
    options: true;
    answers: {
      include: {
        options: true;
      };
    };
  };
}>;

function transformData(optionsData: (Option | null)[]) {
  type QuestionIdCount = {
    [key: string]: {
      name: string;
      value: number;
    };
  };
  const questionIdCount: QuestionIdCount = {};

  optionsData.forEach((item) => {
    if (item === null) {
      return;
    }
    if (!questionIdCount[item.id]) {
      questionIdCount[item.id] = { name: item.optionText, value: 1 };
    } else {
      questionIdCount[item.id].value += 1;
    }
  });

  const result = Object.values(questionIdCount);

  return result;
}

function Question({ question }: { question: QuestionWithOptionsWithAnswer }) {
  if (question.type === "SHORT_RESPONSE") {
    return (
      <Card className="col-span-3 mt-8">
        <CardHeader className="pb-2">
          <CardTitle>{question.text}</CardTitle>
          <CardDescription>{`${question.answers.length} responses`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="md:space-y-6 space-y-2">
            {question.answers.map((answer: any) => {
              return (
                <div key={answer.id} className="ml-4 space-y-1">
                  <p className="text-sm text-muted-background">
                    {answer.answerText}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  } else if (question.type === "SELECT_ONE_OPTION") {
    const optionsData = question.answers.map((answer) => {
      return answer.options[0];
    });
    const options = transformData(optionsData);
    return (
      <Card className="col-span-3 mt-8">
        <CardHeader className="pb-2">
          <CardTitle>{question.text}</CardTitle>
          <CardDescription>{`${question.answers.length} responses`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <ResponsePie data={options} />
            {question.answers.map((answer) => {
              return (
                <div key={answer.id} className="ml-4 space-y-1">
                  <p className="text-sm text-muted-background">
                    {answer.answerText}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  } else if (question.type === "SELECT_MULTIPLE_OPTIONS") {
    const { options, answers } = question;

    const optionsCounter: Record<
      string,
      { name: string; count: number; order: number }
    > = {};

    for (const option of options) {
      optionsCounter[option.id] = {
        name: option.optionText,
        count: 0,
        order: option.order,
      };
    }

    for (const answer of answers) {
      const optionsOfAnswer = answer.options;
      for (const optionOfAnswer of optionsOfAnswer) {
        const newCount = (optionsCounter[optionOfAnswer.id].count += 1);
        optionsCounter[optionOfAnswer.id] = {
          ...optionsCounter[optionOfAnswer.id],
          count: newCount,
        };
      }
    }

    const barChartData = Object.entries(optionsCounter)
      .sort((a, b) => {
        return a[1].order - b[1].order;
      })
      .map(([_, value]) => {
        return { name: value.name, count: value.count };
      });

    return (
      <Card className="col-span-3 mt-8">
        <CardHeader className="pb-2">
          <CardTitle>{question.text}</CardTitle>
          <CardDescription>{`${question.answers.length} responses`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="mt-12">
              <ResponseBarChart data={barChartData} />
            </div>
          </div>
          <div className="md:space-y-6 space-y-2">
            {question.answers.map((answer: any) => {
              return (
                <div key={answer.id} className="ml-4 space-y-1">
                  <p className="text-sm text-muted-background">
                    {answer.answerText}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const formId = params.slug;
  const result = await getResponsesSummaryFromUser(formId);
  const processedData = await getResponsesFromForm(formId);

  if (processedData === null || "error" in processedData) {
    notFound();
  }

  if ("error" in result) {
    notFound();
  }

  return (
    <div className="md:mx-48 md:my-20 px-4 mb-4">
      <div className="my-10">
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
      </div>
      <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
        Responses
      </h2>
      <div className="mt-6">
        <ExportToExcelButton processedData={processedData} />
      </div>
      {result.map((question: any) => {
        return <Question question={question} key={question.id} />;
      })}
    </div>
  );
}
