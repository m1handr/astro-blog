import type { Icons } from "./assets/Icons";

export type SocialObject = {
  title: string;
  href: string;
  icon: keyof typeof Icons;
  active: boolean;
};
