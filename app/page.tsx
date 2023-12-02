import Header from "@/components/header.component";
import { LoginLink } from "@/components/loginLink";
import Logout from "@/components/logout";
import { RegisterLink } from "@/components/registerLink";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkIfUserIsLoggedIn } from "@/lib/actions/actions";
import { Github } from "lucide-react";
import Link from "next/link";
import { RegisterDialog } from "./registerDialog";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { SiteHeader } from "@/components/site-header";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";

export function Register() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Form</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Register</DialogTitle>
          <DialogDescription>
            For full access and a seamless experience on this application,
            please take a moment to register.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="abc@example.com" type="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
        <DialogFooter>
          <Button type="submit">Register</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default async function Home() {
  const isUserLogged = await checkIfUserIsLoggedIn();
  return (
    <div>
      <SiteHeader isUserLogged={isUserLogged} />
      <section className="md:mt-20 md:px-32 px-4 mt-10">
        <div className="">
          <div className="flex justify-center">
            <div>
              <h1 className="mt-2 text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] text-center">
                Build Beautiful Forms
              </h1>
              <h1 className="md:mt-2 text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] text-center">
                And own your data.
              </h1>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <div className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Publish your form in very quick span of time.
          </div>
        </div>
        <div className="mt-8">
          <div className="flex justify-center space-x-3">
            {isUserLogged ? (
              <Link href={"/forms"}>
                <Button>Create Form</Button>
              </Link>
            ) : (
              <RegisterDialog></RegisterDialog>
            )}
          </div>
        </div>
      </section>
      <section className="mt-14 mb-8">
        <div className="flex justify-center">
          <Image
            alt="hero image form"
            height={1000}
            width={1000}
            src={"/home-image.png"}
            className="border-2 shadow-lg"
          />
        </div>
      </section>
      <section className="px-8 md:px-48 mt-20 mb-20">
        <div className="md:px-48">
          <div>
            <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Its simple and lighter application
            </h3>
            <p className="leading-8 text-lg [&:not(:first-child)]:mt-6 text-slate-500 font-normal">
              Simple Forms is new application to create quickly forms and
              collect enough data for your surveys or for your needs.
            </p>
          </div>
          <div className="mt-12">
            <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Its simple and lighter application
            </h3>
            <p className="leading-8 text-lg [&:not(:first-child)]:mt-6 text-slate-500 font-normal">
              Simple Forms is new application to create quickly forms and
              collect enough data for your surveys or for your needs.
            </p>
          </div>
          <div className="mt-12">
            <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Its simple and lighter application
            </h3>
            <p className="leading-8 text-lg [&:not(:first-child)]:mt-6 text-slate-500 font-normal">
              Simple Forms is new application to create quickly forms and
              collect enough data for your surveys or for your needs.
            </p>
          </div>
          <div className="mt-12">
            <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Its simple and lighter application
            </h3>
            <p className="leading-8 text-lg [&:not(:first-child)]:mt-6 text-slate-500 font-normal">
              1. Quick form creation in very less time.
            </p>
            <p className="leading-8 text-lg [&:not(:first-child)]:mt-6 text-slate-500 font-normal">
              2. Easy publication of forms and viewing of respones with charts.
            </p>
            <p className="leading-8 text-lg [&:not(:first-child)]:mt-6 text-slate-500 font-normal">
              3. Data export to excel files.
            </p>
            <p className="leading-8 text-lg [&:not(:first-child)]:mt-6 text-slate-500 font-normal">
              4. Support for short answer, multiple-choice, and single-choice
              questions.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
