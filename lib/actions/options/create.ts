"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export const createOption = async (
  questionId: string,
  formId: string,
  order: number
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const question = await prisma.question.findFirstOrThrow({
    where: {
      id: questionId,
      userId: session.user.id,
      formId,
    },
    include: {
      options: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  const options = question.options;

  const updateOptionsOrder = options
    .filter((option) => {
      if (option.order >= order) {
        return true;
      }
      return false;
    })
    .map((option) => {
      const newOrder = question.order + 1;
      return prisma.option.update({
        where: { id: option.id },
        data: { order: newOrder },
      });
    });

  const createOrder = prisma.option.create({
    data: {
      order,
      optionText: `Option ${order}`,
      questionId: questionId,
    },
  });

  updateOptionsOrder.push(createOrder);

  await prisma.$transaction(updateOptionsOrder);

  revalidatePath(`forms/${formId}`);
};
