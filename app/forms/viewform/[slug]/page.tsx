import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getFormFromUser,
  getFormIfPublishedOrIsAuthor,
  getQuestionsFromPublishedFormOrFromAuthor,
  getQuestionsFromUser,
  submitForm,
} from "@/lib/actions/actions";
import Link from "next/link";
import Form from "./form";
import { notFound } from "next/navigation";
import { FormTitle } from "@/components/formTitle";
import { FormContainer } from "@/components/form-container";

export default async function Page({ params }: { params: { slug: string } }) {
  const formId = params.slug;
  const questions = await getQuestionsFromPublishedFormOrFromAuthor(formId);

  if (!questions || "error" in questions) {
    notFound();
  }
  const form = await getFormIfPublishedOrIsAuthor(formId);

  const title = form?.title;

  return (
    <FormContainer>
      <div className="mt-20 md:mt-0">
        <FormTitle title={title} />
        <Form
          questions={questions}
          formId={formId}
          submitForm={submitForm}
        ></Form>
      </div>
    </FormContainer>
  );
}
