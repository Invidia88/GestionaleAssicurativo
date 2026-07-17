"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarClock,
  ContactRound,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelsTopLeft,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { esci } from "@/app/(app)/azioni-sessione";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const voci = [
  { href: "/dashboard", etichetta: "Dashboard", Icona: LayoutDashboard },
  { href: "/clienti", etichetta: "Clienti", Icona: Users },
  { href: "/polizze", etichetta: "Polizze", Icona: ShieldCheck },
  { href: "/compagnie", etichetta: "Compagnie", Icona: Building2 },
  { href: "/contatti", etichetta: "Contatti", Icona: ContactRound },
];

const vociAmministratore = [
  { href: "/utenti", etichetta: "Utenti", Icona: Users },
  { href: "/impostazioni", etichetta: "Impostazioni", Icona: Settings },
];

const vocePiattaforma = {
  href: "/piattaforma/agenzie",
  etichetta: "Piattaforma",
  Icona: PanelsTopLeft,
};

type NavigazioneProps = {
  amministratore: boolean;
  nomeAgenzia: string;
  proprietarioPiattaforma: boolean;
};

function ElencoVoci({
  amministratore,
  proprietarioPiattaforma,
  mobile = false,
}: {
  amministratore: boolean;
  proprietarioPiattaforma: boolean;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const elenco = amministratore ? [...voci, ...vociAmministratore] : [...voci];

  if (proprietarioPiattaforma) {
    elenco.push(vocePiattaforma);
  }

  return (
    <nav aria-label="Navigazione principale" className="space-y-1">
      {elenco.map(({ href, etichetta, Icona }) => {
        const attiva = pathname === href || pathname.startsWith(`${href}/`);
        const collegamento = (
          <Link
            href={href}
            aria-current={attiva ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-11 w-full justify-start gap-3 rounded-xl px-3 font-medium",
              attiva && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
            )}
          >
            <Icona aria-hidden="true" className="size-4" />
            {etichetta}
          </Link>
        );

        return mobile ? (
          <SheetClose asChild key={href}>
            {collegamento}
          </SheetClose>
        ) : (
          <div key={href}>{collegamento}</div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ amministratore, nomeAgenzia, proprietarioPiattaforma }: NavigazioneProps) {
  return (
    <aside className="m-3 hidden h-[calc(100vh-1.5rem)] w-72 shrink-0 rounded-2xl border bg-sidebar p-4 shadow-sm lg:sticky lg:top-3 lg:flex lg:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/20">
          <CalendarClock aria-hidden="true" className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold leading-tight tracking-tight">
            GestionaleAssicurativo
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {nomeAgenzia}
          </span>
        </span>
      </Link>
      <Separator className="my-4" />
      <div className="flex-1">
        <ElencoVoci amministratore={amministratore} proprietarioPiattaforma={proprietarioPiattaforma} />
      </div>
      <Separator className="my-4" />
      <form action={esci}>
        <Button type="submit" variant="ghost" className="h-10 w-full justify-start gap-3 px-3">
          <LogOut aria-hidden="true" />
          Esci
        </Button>
      </form>
    </aside>
  );
}

export function MenuMobile({ amministratore, nomeAgenzia, proprietarioPiattaforma }: NavigazioneProps) {
  const [aperto, setAperto] = useState(false);

  return (
    <Sheet open={aperto} onOpenChange={setAperto}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="icon-lg" className="lg:hidden">
          <Menu aria-hidden="true" />
          <span className="sr-only">Apri menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[19rem]">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarClock aria-hidden="true" className="size-5" />
            </span>
            GestionaleAssicurativo
          </SheetTitle>
          <SheetDescription className="truncate">{nomeAgenzia}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 px-3">
          <ElencoVoci amministratore={amministratore} proprietarioPiattaforma={proprietarioPiattaforma} mobile />
        </div>
        <SheetFooter className="border-t">
          <form action={esci}>
            <Button type="submit" variant="outline" className="w-full">
              <LogOut aria-hidden="true" />
              Esci
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
