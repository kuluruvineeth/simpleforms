import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";

export function SiteHeader({ isUserLogged }: { isUserLogged: boolean }) {
  return (
    <>
      <MainNav isUserLogged={isUserLogged} />
      <MobileNav isUserLogged={isUserLogged} />
    </>
  );
}
