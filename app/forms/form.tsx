"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createForm } from "@/lib/actions/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({});

export default function InputForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit() {
    const formData = await createForm();
    if ("id" in formData) {
      router.push(`forms/${formData.id}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <Button type="submit">Create new form</Button>
      </form>
    </Form>
  );
}
