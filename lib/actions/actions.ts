"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth";
import { prisma } from "../prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

type AnswersWithQuestionOptionAndResponse = Prisma.AnswerGetPayload<{
  include: { question: true; options: true; response: true };
}>;

export const createForm = async () => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const response = await prisma.form.create({
    data: {
      userId: session.user.id,
      title: "",
    },
  });

  return response;
};

export const updateFormFromUser = async (formId: string, title: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const response = await prisma.form.update({
    where: {
      id: formId,
      userId: session.user.id,
    },
    data: {
      title,
    },
  });
  revalidatePath(`forms/${formId}`);
  return response;
};

export const updateQuestionFromUser = async (
  formId: string,
  questionId: string,
  placeholder: string | null,
  text: string | null
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  if (text !== null && placeholder !== null) {
    const response = await prisma.question.update({
      where: {
        formId,
        id: questionId,
        userId: session.user.id,
      },
      data: {
        text,
        placeholder,
      },
    });
    revalidatePath(`forms/${formId}`);
    return response;
  } else if (text !== null) {
    const response = await prisma.question.update({
      where: {
        formId,
        id: questionId,
        userId: session.user.id,
      },
      data: {
        text,
      },
    });
    revalidatePath(`forms/${formId}`);
    return response;
  } else if (placeholder !== null) {
    const response = await prisma.question.update({
      where: {
        formId,
        id: questionId,
        userId: session.user.id,
      },
      data: {
        placeholder,
      },
    });
    revalidatePath(`forms/${formId}`);
    return response;
  }
};

export const getFormsFromUser = async () => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const response = await prisma.form.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return response;
};

export const getFormFromUser = async (formId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const response = await prisma.form.findFirst({
    where: {
      userId: session.user.id,
      id: formId,
    },
  });

  return response;
};

export const getQuestionsFromUser = async (formId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const formFromUser = await prisma.form.findFirst({
    where: {
      id: formId,
    },
  });

  if (!formFromUser) {
    return {
      error: "Form does not exist",
    };
  }

  if (formFromUser.userId !== session.user.id) {
    return {
      error: "Form is not from user",
    };
  }

  const response = await prisma.question.findMany({
    where: {
      formId: formFromUser.id,
      userId: session.user.id,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      options: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  revalidatePath(`forms/${formId}`);

  return response;
};

export const updateOptionText = async (
  optionText: string,
  optionId: string,
  questionId: string,
  formId: string
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  await prisma.question.findFirstOrThrow({
    where: {
      userId: session.user.id,
      id: questionId,
      formId,
    },
  });

  await prisma.option.update({
    where: {
      id: optionId,
    },
    data: {
      optionText,
    },
  });

  revalidatePath(`forms/${formId}`);
  return;
};

export const deleteQuestion = async (formId: string, questionId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const formFromUser = await prisma.form.findFirst({
    where: {
      id: formId,
    },
  });

  if (!formFromUser) {
    return {
      error: "Form does not exist",
    };
  }

  const questionToDelete = await prisma.question.findFirst({
    where: {
      id: questionId,
    },
  });

  if (!questionToDelete) {
    return {
      error: "Question does not exist",
    };
  }

  if (questionToDelete.formId != formId) {
    return {
      error: "Given questionId is not from the given form Id",
    };
  }

  const questions = await prisma.question.findMany({
    where: {
      formId,
      order: {
        gte: questionToDelete.order,
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  const updateOperations = questions.map((question) => {
    const newOrder = question.order - 1;
    return prisma.question.update({
      where: { id: question.id, formId },
      data: { order: newOrder },
    });
  });

  const deleteFunction = prisma.question.delete({
    where: {
      id: questionId,
    },
  });

  updateOperations.push(deleteFunction);

  await prisma.$transaction(updateOperations);

  revalidatePath(`forms/${formId}`);

  return;
};

export const togglePublishFormFromUser = async (formId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const form = await prisma.form.findFirstOrThrow({
    where: {
      id: formId,
      userId: session.user.id,
    },
  });

  const response = await prisma.form.update({
    where: {
      id: formId,
      userId: session.user.id,
    },
    data: {
      published: !form.published,
    },
  });

  revalidatePath(`/forms/${formId}`);
  return response;
};

export const getFormIfPublishedOrIsAuthor = async (formId: string) => {
  const session = await getSession();

  let isTheAuthor = false;

  const form = await prisma.form.findFirst({
    where: {
      id: formId,
    },
  });

  if (!form) {
    redirect("/forms/e");
  }

  if (form.userId === session?.user.id) {
    isTheAuthor = true;
  }

  if (!isTheAuthor && !form.published) {
    redirect("/forms/e");
  }

  return form;
};

interface InputValueType {
  type: "SHORT_RESPONSE" | "SELECT_ONE_OPTION" | "SELECT_MULTIPLE_OPTIONS";
  text: string | null;
  optionId: string | null;
  optionIds: string[] | null;
}

interface OutputType {
  answerText: string | null;
  questionId: string;
  type: "SHORT_RESPONSE" | "SELECT_ONE_OPTION" | "SELECT_MULTIPLE_OPTIONS";
  optionId: string | null;
  optionIds: string[] | null;
}

function transform(obj: Record<string, InputValueType>): OutputType[] {
  const result: OutputType[] = [];
  for (let key in obj) {
    if (obj[key].type === "SHORT_RESPONSE") {
      result.push({
        answerText: obj[key].text,
        questionId: key,
        type: "SHORT_RESPONSE",
        optionId: null,
        optionIds: null,
      });
    } else if (obj[key].type === "SELECT_ONE_OPTION") {
      result.push({
        answerText: null,
        questionId: key,
        optionId: obj[key].optionId,
        type: "SELECT_ONE_OPTION",
        optionIds: null,
      });
    } else if (obj[key].type === "SELECT_MULTIPLE_OPTIONS") {
      result.push({
        answerText: null,
        questionId: key,
        optionIds: obj[key].optionIds,
        type: "SELECT_MULTIPLE_OPTIONS",
        optionId: null,
      });
    }
  }

  return result;
}

export const submitForm = async (answersHash: any, formId: string) => {
  const answers = transform(answersHash);

  const form = await prisma.form.findFirstOrThrow({
    where: {
      id: formId,
    },
  });

  answers.map(async (answer) => {
    const question = await prisma.question.findFirstOrThrow({
      where: {
        id: answer.questionId,
      },
    });

    if (question.formId !== form.id) {
      throw new Error();
    }
    return answer;
  });

  const response = await prisma.response.create({
    data: {
      submittedAt: new Date().toISOString(),
    },
  });

  const createAnswerOperations = answers.map((answer) => {
    if (answer.type === "SHORT_RESPONSE") {
      return prisma.answer.create({
        data: {
          answerText: answer.answerText!,
          questionId: answer.questionId,
          formId: form.id,
          responseId: response.id,
        },
      });
    } else if (answer.type === "SELECT_ONE_OPTION") {
      return prisma.answer.create({
        data: {
          answerText: "",
          questionId: answer.questionId,
          formId: form.id,
          responseId: response.id,
          options: {
            connect: {
              id: answer.optionId!,
            },
          },
        },
      });
    } else if (answer.type === "SELECT_MULTIPLE_OPTIONS") {
      const connectAnswers = answer.optionIds!.map((option: string) => {
        return { id: option };
      });
      return prisma.answer.create({
        data: {
          answerText: "",
          questionId: answer.questionId,
          formId: form.id,
          responseId: response.id,
          options: {
            connect: [...connectAnswers],
          },
        },
      });
    } else {
      throw new Error("Not valid type");
    }
  });

  await prisma.$transaction(createAnswerOperations);

  return;
};

export const getResponsesSummaryFromUser = async (formId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const questions = await prisma.question.findMany({
    where: {
      formId: formId,
      userId: session.user.id,
    },
    include: {
      options: true,
      answers: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          options: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return questions;
};

export const checkIfUserIsLoggedIn = async () => {
  const session = await getSession();
  if (!session?.user.id) {
    return false;
  }
  return true;
};

export const getQuestionsFromPublishedFormOrFromAuthor = async (
  formId: string
) => {
  const session = await getSession();

  let isTheAuthor = false;
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
    },
  });

  if (!form) {
    return {
      error: "Form does not exist",
    };
  }

  if (form.userId === session?.user.id) {
    isTheAuthor = true;
  }

  if (!isTheAuthor && !form.published) {
    return {
      error: "Form is not published",
    };
  }

  const response = await prisma.question.findMany({
    where: {
      formId: form.id,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      options: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return response;
};

export const getResponsesFromForm = async (formId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const answers = await prisma.answer.findMany({
    where: {
      formId: formId,
      question: {
        userId: session.user.id,
      },
    },
    include: {
      question: true,
      options: true,
      response: true,
    },
  });

  const questions = await prisma.question.findMany({
    where: {
      formId: formId,
    },
    orderBy: {
      order: "asc",
    },
  });

  const questionNames = questions.map((question) => {
    return question.text;
  });

  const totalQuestions = questions.length;

  type GroupedResponses = {
    [key: string]: AnswersWithQuestionOptionAndResponse[];
  };

  const groupedByResponses: GroupedResponses = answers.reduce(
    (acc: GroupedResponses, answer: AnswersWithQuestionOptionAndResponse) => {
      const responseId = answer.responseId;
      if (!acc[responseId]) {
        acc[responseId] = [];
      }
      acc[responseId].push(answer);
      return acc;
    },
    {}
  );

  const formattedResponses: string[][] = Object.values(groupedByResponses).map(
    (answersForResponse: AnswersWithQuestionOptionAndResponse[]) => {
      const sortedAnswers = answersForResponse.sort(
        (a, b) => a.question.order - b.question.order
      );

      const answersArray: string[] = new Array(totalQuestions).fill("");

      sortedAnswers.forEach((answer) => {
        const index = answer.question.order - 1;
        answersArray[index] =
          answer.question.type === "SELECT_ONE_OPTION"
            ? answer.options && answer.options.length === 1
              ? answer.options[0].optionText
              : ""
            : answer.answerText;
      });

      return answersArray;
    }
  );

  return [questionNames].concat(formattedResponses);
};
